const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const frontend = path.resolve(root, '../frontend');
const checkout = process.argv[2] === 'checkout';
const journey = process.argv[2] === 'journey';
const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const output = path.join(root, 'output');
fs.mkdirSync(output, { recursive: true });
let server;
let runner;
let serverError;
let stopping = false;
const serverLog = fs.createWriteStream(path.join(output, 'frontend.log'));

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

async function main() {
  if (journey && !process.env.E2E_CHECKOUT_FIXTURES) {
    throw new Error('Run CheckoutBrowserIT to create isolated checkout fixtures; see README.md.');
  }
  if (journey) {
    const results = path.join(output, 'checkout-journey');
    fs.mkdirSync(results, { recursive: true });
    // Delete only generated result files in this suite's own disposable output directory.
    for (const entry of fs.readdirSync(results, { withFileTypes: true })) {
      if (entry.isFile() && /\.(png|json|xml)$/.test(entry.name)) fs.unlinkSync(path.join(results, entry.name));
    }
  }
  if (checkout && !process.env.E2E_ACCESS_TOKEN) {
    throw new Error('Checkout needs E2E_ACCESS_TOKEN and prepared local test account/address/cart. See README.md.');
  }
  const url = new URL(baseUrl);
  if (checkout && !/^[1-9]\d*(,[1-9]\d*)*$/.test(process.env.E2E_CART_ITEM_IDS || '')) {
    throw new Error('Checkout requires E2E_CART_ITEM_IDS, for example 7,8. See README.md.');
  }
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('Only local test targets are allowed. Do not run this suite against production.');
  }
  if (!process.env.E2E_BASE_URL) {
    if (process.env.E2E_API_URL && !['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.E2E_API_URL).hostname)) {
      throw new Error('E2E_API_URL must point to a local test backend.');
    }
    const vite = path.join(frontend, 'node_modules/vite/bin/vite.js');
    if (!fs.existsSync(vite)) throw new Error('Frontend dependencies missing: run npm ci in frontend first.');
    server = spawn(process.execPath, [vite, '--host', '127.0.0.1', '--port', '4173', '--strictPort', '--mode', 'e2e'], {
      cwd: frontend, windowsHide: true,
      // Never load production API settings from .env.local during smoke tests.
      env: { ...process.env, VITE_API_URL: process.env.E2E_API_URL || 'http://127.0.0.1:8081/api',
        VITE_GOOGLE_CLIENT_ID: 'e2e-local-only.apps.googleusercontent.com' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    server.on('error', error => { serverError = error; });
    server.stdout.pipe(serverLog, { end: false });
    server.stderr.pipe(serverLog, { end: false });
  }
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (serverError) throw serverError;
    if (server && server.exitCode !== null) throw new Error('Frontend could not start. Check output/frontend.log (possibly port 4173 is occupied).');
    try {
      const response = await fetch(baseUrl + '/login', { signal: AbortSignal.timeout(1000) });
      if (response.ok && (await response.text()).includes('id="root"')) { ready = true; break; }
    } catch { /* Retry until startup deadline. */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Frontend not ready after 30 seconds: ' + baseUrl);
  console.log(`Running ${journey ? 'checkout journey' : checkout ? 'checkout' : 'smoke'} on ${baseUrl} using CodeceptJS + Playwright`);
  const executable = path.join(root, 'node_modules/codeceptjs/bin/codecept.js');
  const args = [executable, 'run', '--reporter', './reporters/JUnitConsole.js'];
  if (checkout) args.push('--config', 'codecept.checkout.conf.js');
  if (journey) args.push('--config', 'codecept.journey.conf.js');
  runner = spawn(process.execPath, args, {
    cwd: root, windowsHide: true, stdio: 'inherit', env: { ...process.env, E2E_BASE_URL: baseUrl },
  });
  const [code] = await once(runner, 'exit');
  process.exitCode = code === null ? 1 : code;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(stop);
