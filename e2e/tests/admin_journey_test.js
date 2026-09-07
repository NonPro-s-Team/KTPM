Feature('QLPT-279 - Admin journey and tag authorization');

Scenario('ADMIN đăng nhập và mở Dashboard, Sản phẩm, Đơn hàng, Người dùng', async ({ I }) => {
  I.amOnPage('/login');
  await I.loginAsAdmin();

  I.amOnPage('/admin');
  I.waitForText('Tổng quan', 15, 'h1');
  I.dontSee('Không thể tải dữ liệu dashboard');

  I.amOnPage('/admin/products');
  I.waitForText('Quản lý sản phẩm', 15, 'h1');
  I.dontSee('Không thể tải danh sách sản phẩm.');

  I.amOnPage('/admin/orders');
  I.waitForText('Quản lý đơn hàng', 15, 'h1');

  I.amOnPage('/admin/users');
  I.waitForText('Người dùng', 15, 'h1');
  I.dontSee('Không thể tải danh sách người dùng');
});

Scenario('CUSTOMER gọi API quản lý tag phải nhận 403', async ({ I }) => {
  await I.assertCustomerCannotReadAdminTags();
});
