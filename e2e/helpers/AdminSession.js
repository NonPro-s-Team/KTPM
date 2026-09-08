const { Helper } = require('codeceptjs');

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function localUrl(name, fallback) {
  const value = process.env[name] || fallback;
  const url = new URL(value);
  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(`${name} must point to localhost. Refusing to run Admin E2E against ${url.hostname}.`);
  }
  return value.replace(/\/$/, '');
}

class AdminSession extends Helper {
  async login(identifier, password, expectedRole) {
    const apiUrl = localUrl('E2E_API_URL', 'http://localhost:8081/api');
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, captchaToken: null }),
      signal: AbortSignal.timeout(15000),
    });
    const raw = await response.text();
    let body;
    try { body = JSON.parse(raw); } catch { body = {}; }
    if (!response.ok) {
      throw new Error(`Login ${expectedRole} failed with HTTP ${response.status}: ${body.message || raw || 'empty response'}`);
    }
    if (body.role !== expectedRole || !body.accessToken) {
      throw new Error(`Expected ${expectedRole} credentials and accessToken, received role=${body.role || 'missing'}.`);
    }
    return body;
  }

  async loginAsAdmin() {
    const session = await this.login(
      process.env.E2E_ADMIN_IDENTIFIER || 'seed.admin@greenjuicehub.local',
      process.env.E2E_ADMIN_PASSWORD || 'password',
      'ADMIN',
    );
    const { page } = this.helpers.Playwright;
    await page.evaluate(({ accessToken, refreshToken, role }) => {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role);
    }, session);
  }

  async assertCustomerCannotReadAdminTags() {
    const session = await this.login(
      process.env.E2E_CUSTOMER_IDENTIFIER || 'seed.user041@greenjuicehub.local',
      process.env.E2E_CUSTOMER_PASSWORD || 'password',
      'CUSTOMER',
    );
    const apiUrl = localUrl('E2E_API_URL', 'http://localhost:8081/api');
    const response = await fetch(`${apiUrl}/admin/tags`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      signal: AbortSignal.timeout(15000),
    });
    const body = await response.text();
    if (response.status !== 403) {
      throw new Error(`Expected CUSTOMER request to /admin/tags to return HTTP 403, received ${response.status}. Body: ${body}`);
    }
  }
}

module.exports = AdminSession;
