module.exports = function () {
  return actor({
    loginAsCustomer() {
      const accessToken = process.env.E2E_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('Set E2E_ACCESS_TOKEN to a valid CUSTOMER token before running checkout E2E tests');
      }
      this.amOnPage('/login');
      this.seedCustomerSession();
      // Auth store reads storage at module initialization, so reload after seeding.
      this.refreshPage();
    },
    openPreparedCheckout() {
      const ids = (process.env.E2E_CART_ITEM_IDS || '').split(',').map(Number);
      if (ids.length === 0 || ids.some(id => !Number.isSafeInteger(id) || id <= 0)) {
        throw new Error('Set E2E_CART_ITEM_IDS to comma-separated cartItemId values belonging to the test customer.');
      }
      this.amOnPage('/products');
      // React Router reads checkout selection from history.state.usr, not from the URL.
      this.executeScript((selectedIds) => {
        window.history.replaceState({ usr: { selectedIds }, key: 'e2e', idx: 0 }, '', '/checkout');
      }, ids);
      this.refreshPage();
      this.waitForElement('[data-testid="order-summary"]', 15);
    },
  });
};
