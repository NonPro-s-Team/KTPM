const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const repo = path.resolve(root, '..');
const frontend = path.join(repo, 'frontend');
const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const apiUrl = process.env.E2E_API_URL || 'http://localhost:8081/api';
const evidence = path.join(repo, 'test-evidence', 'codeceptjs-admin');
const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
let server;
let runner;
let serverError;
let stopping = false;

for (const [name, value] of [['E2E_BASE_URL', baseUrl], ['E2E_API_URL', apiUrl]]) {
  const url = new URL(value);
  if (!localHosts.has(url.hostname)) throw new Error(`${name} must point to localhost.`);
}

fs.mkdirSync(evidence, { recursive: true });
const serverLog = fs.createWriteStream(path.join(evidence, 'frontend.log'));

async function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of [runner, server]) {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await Promise.race([exited, new Promise(resolve => {
        const timer = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 3000);
        timer.unref();
      })]);
    }
  }
  serverLog.end();
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => { await stop(); process.exit(130); });
}

async function waitFor(url, description, attempts) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (serverError) throw serverError;
    if (server && server.exitCode !== null) {
      throw new Error('Frontend could not start. Check test-evidence/codeceptjs-admin/frontend.log.');
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch { /* Retry until the local service startup deadline. */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`${description} is not ready: ${url}`);
}

async function isReady(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  await waitFor(`${apiUrl}/products?page=0&size=1`, 'Backend', 4);

  if (!process.env.E2E_BASE_URL && !(await isReady(`${baseUrl}/login`))) {
    const vite = path.join(frontend, 'node_modules', 'vite', 'bin', 'vite.js');
    if (!fs.existsSync(vite)) throw new Error('Frontend dependencies missing: run npm ci in frontend first.');
    server = spawn(process.execPath, [vite, '--host', 'localhost', '--port', '5173', '--strictPort', '--mode', 'e2e'], {
      cwd: frontend,
      windowsHide: true,
      env: {
        ...process.env,
        VITE_API_URL: apiUrl,
        VITE_GOOGLE_CLIENT_ID: 'e2e-local-only.apps.googleusercontent.com',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    server.on('error', error => { serverError = error; });
    server.stdout.pipe(serverLog, { end: false });
    server.stderr.pipe(serverLog, { end: false });
  }

  await waitFor(`${baseUrl}/login`, 'Frontend', 60);
  console.log(`Running QLPT-279 Admin E2E on ${baseUrl}; backend ${apiUrl}`);
  const executable = path.join(root, 'node_modules', 'codeceptjs', 'bin', 'codecept.js');
  if (!fs.existsSync(executable)) throw new Error('E2E dependencies missing: run npm ci in e2e first.');
  const reporter = process.env.E2E_SHOW_BROWSER === 'true' ? 'spec' : './reporters/JUnitConsole.js';
  runner = spawn(process.execPath, [executable, 'run', '--config', 'codecept.admin.conf.js', '--reporter', reporter], {
    cwd: root,
    windowsHide: true,
    stdio: 'inherit',
    env: { ...process.env, E2E_BASE_URL: baseUrl, E2E_API_URL: apiUrl },
  });
  const [code] = await once(runner, 'exit');
  process.exitCode = code === null ? 1 : code;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(stop);
