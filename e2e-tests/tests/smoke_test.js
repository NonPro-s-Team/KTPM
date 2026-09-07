Feature('Smoke test - kiểm tra kết nối');

Scenario('Mở trang chủ React app', ({ I }) => {
  I.amOnPage('/');
  I.wait(3);
});