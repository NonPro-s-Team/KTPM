Feature('Checkout and payment');

Before(({ I }) => {
  I.loginAsCustomer();
});

Scenario('Customer can select COD on a prepared checkout', ({ I }) => {
  I.amOnPage('/checkout');
  I.waitForElement('[data-testid="order-summary"]', 15);
  I.click('[data-testid="payment-COD"]');
  I.seeElement('[data-testid="place-order-button"]');
});

Scenario('Checkout exposes every supported payment option', ({ I }) => {
  I.amOnPage('/checkout');
  I.waitForElement('[data-testid="order-summary"]', 15);
  I.seeElement('[data-testid="payment-COD"]');
  I.seeElement('[data-testid="payment-VNPAY"]');
  I.seeElement('[data-testid="payment-MOMO"]');
  I.seeElement('[data-testid="payment-BANK_TRANSFER"]');
});
