Feature('Application smoke');

Scenario('Login page renders its form @smoke', ({ I }) => {
  I.amOnPage('/login');
  I.waitForText('Đăng nhập / Đăng ký', 15, 'h2');
  I.seeElement('input[type="tel"]');
  I.see('Tiếp tục', 'button');
  I.saveScreenshot('login-form.png', true);
});

Scenario('Empty login input displays validation @smoke', ({ I }) => {
  I.amOnPage('/login');
  I.waitForElement('input[type="tel"]', 15);
  I.click('Tiếp tục');
  I.waitForText('Vui lòng nhập số điện thoại', 10);
  I.seeInCurrentUrl('/login');
  I.saveScreenshot('login-validation.png', true);
});

Scenario('Anonymous customer cannot open checkout @smoke', ({ I }) => {
  I.amOnPage('/checkout');
  I.waitInUrl('/login', 15);
  I.waitForText('Đăng nhập / Đăng ký', 15, 'h2');
  I.dontSeeElement('[data-testid="place-order-button"]');
  I.saveScreenshot('checkout-login-required.png', true);
});

Scenario('Unknown route displays the application 404 @smoke', ({ I }) => {
  I.amOnPage('/e2e-page-does-not-exist');
  I.waitForText('Trang không tồn tại', 15, 'h1');
  I.see('/e2e-page-does-not-exist');
  I.see('Về trang chủ', 'button');
  I.saveScreenshot('not-found.png', true);
});
