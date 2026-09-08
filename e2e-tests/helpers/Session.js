import codeceptjs from 'codeceptjs';

const { Helper } = codeceptjs;

export default class Session extends Helper {
  async seedCustomerSession() {
    const accessToken = process.env.TEST_ACCESS_TOKEN;
    const refreshToken = process.env.TEST_REFRESH_TOKEN || accessToken;

    if (!accessToken) {
      throw new Error('TEST_ACCESS_TOKEN is required for review tests.');
    }

    const { page } = this.helpers.Playwright;
    await page.evaluate(({ accessToken: token, refreshToken: refresh }) => {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);
    }, { accessToken, refreshToken });
  }
}