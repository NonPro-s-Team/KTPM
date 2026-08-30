module.exports = function () {
  return actor({
    loginAsCustomer() {
      const accessToken = process.env.E2E_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('Set E2E_ACCESS_TOKEN to a valid CUSTOMER token before running checkout E2E tests');
      }
      this.amOnPage('/');
      this.executeScript((token) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('role', 'CUSTOMER');
      }, accessToken);
    },
  });
};
