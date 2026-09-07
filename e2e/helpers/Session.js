const { Helper } = require('codeceptjs');

// Read inside the helper: token values must never appear in step arguments.
class Session extends Helper {
  async seedCustomerSession() {
    const accessToken = process.env.E2E_ACCESS_TOKEN;
    if (!accessToken) throw new Error('E2E_ACCESS_TOKEN is required for checkout tests.');
    const { page } = this.helpers.Playwright;
    await page.evaluate(token => {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('role', 'CUSTOMER');
    }, accessToken);
  }
}
module.exports = Session;
