const { Helper } = require('codeceptjs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// Test fixture credentials stay in process memory, never in step arguments or reports.
class CheckoutJourney extends Helper {
  async startCheckoutJourney(key) {
    this.fixtures = JSON.parse(process.env.E2E_CHECKOUT_FIXTURES);
    this.fixture = this.fixtures[key];
    assert.ok(this.fixture, 'Missing fixture');
    this.key = key;
    this.order = null;
    this.events = [];
    this.api = process.env.E2E_API_URL;
    assert.equal(new URL(this.api).hostname, '127.0.0.1');
    const { page } = this.helpers.Playwright;
    await page.context().route('**/*', async route => {
      const url = new URL(route.request().url());
      // No bank/QR/analytics/Google calls leave this isolated test browser.
      if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
      if (url.pathname === '/__vnpay_simulator') {
        this.paymentUrl = url;
        return route.fulfill({ contentType: 'text/html', body:
          '<h1>VNPay local simulator</h1><p>No real transaction. Callback is sent by the test harness.</p>' });
      }
      return route.continue();
    });
    await page.goto('http://127.0.0.1:4173/login');
    await page.evaluate(token => {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('role', 'CUSTOMER');
    }, this.fixture.token);
    await page.evaluate(id => {
      history.replaceState({ usr: { selectedIds: [id] }, key: 'checkout-test', idx: 0 }, '', '/checkout');
    }, this.fixture.cartItemId);
    await page.reload();
    await page.getByTestId('order-summary').waitFor();
  }

  async verifyCheckoutFee(expected) {
    const { page } = this.helpers.Playwright;
    const fee = await this.request('/orders/shipping-fee', 'POST',
      { addressId: this.fixture.addressId, cartItemIds: [this.fixture.cartItemId] });
    assert.equal(fee.shippingFee, expected, 'Backend shipping quote');
    await page.getByTestId('checkout-shipping-fee').getByText(expected.toLocaleString('vi-VN'), { exact: false }).waitFor();
    this.expectedFee = expected;
    await page.screenshot({ path: this.output(`${this.key.toLowerCase()}-checkout.png`), fullPage: true, animations: 'disabled' });
  }

  async submitCheckout(method) {
    const { page } = this.helpers.Playwright;
    await page.getByTestId(`payment-${method}`).click();
    const responsePromise = page.waitForResponse(response =>
      new URL(response.url()).pathname === '/api/orders' && response.request().method() === 'POST');
    await page.getByTestId('place-order-button').click();
    const response = await responsePromise;
    assert.ok(response.ok(), `Place order HTTP ${response.status()}`);
    this.order = await response.json();
    assert.equal(this.order.paymentMethod, method);
    assert.equal(this.order.shippingFee, this.expectedFee, 'Persisted fee equals quote');
    assert.equal(this.order.subtotal, 100000);
    assert.equal(this.order.totalAmount, 100000 + this.expectedFee);
    assert.equal(this.order.paymentStatus, 'PENDING');
    assert.equal(this.order.status, 'PENDING');
    this.events.push({ event: 'placed', method, orderId: this.order.id, shippingFee: this.order.shippingFee,
      total: this.order.totalAmount, paymentStatus: this.order.paymentStatus });
    if (method === 'VNPAY') {
      await page.getByRole('heading', { name: 'VNPay local simulator' }).waitFor();
      assert.equal(this.paymentUrl.searchParams.get('vnp_TxnRef'), this.order.orderCode);
      assert.equal(Number(this.paymentUrl.searchParams.get('vnp_Amount')), this.order.totalAmount * 100);
    } else if (method !== 'COD') {
      await page.getByText(method === 'MOMO' ? 'Thanh toán qua MoMo' : 'Chờ thanh toán', { exact: true }).waitFor();
    } else {
      await page.getByText('Đặt hàng thành công', { exact: true }).waitFor();
    }
  }

  async simulateProviderCallback(outcome = 'success') {
    const { page } = this.helpers.Playwright;
    if (this.order.paymentMethod === 'VNPAY') {
      const params = { vnp_TmnCode: 'CHECKOUTTEST', vnp_TxnRef: this.order.orderCode,
        vnp_Amount: String(this.order.totalAmount * 100), vnp_TransactionNo: `900${this.order.id}`,
        vnp_ResponseCode: outcome === 'success' ? '00' : '24',
        vnp_TransactionStatus: outcome === 'success' ? '00' : '02' };
      const signed = this.sign(params);
      const bad = new URLSearchParams(signed);
      bad.set('vnp_Amount', '1');
      assert.equal((await this.request('/payment/vnpay/ipn?' + bad, 'GET', null, null)).RspCode, '97');
      await this.assertPayment('PENDING');
      // Browser return before IPN must not mark the persisted order paid.
      const returned = await this.request('/payment/vnpay/return?' + signed, 'GET', null, null);
      assert.equal(returned.confirmed, false);
      await this.assertPayment('PENDING');
      if (outcome === 'success') {
        await page.goto('http://127.0.0.1:4173/payment/vnpay/result?' + signed);
        await page.getByRole('heading', { name: 'Đang chờ xác nhận thanh toán' }).waitFor();
        assert.equal(await page.getByText('Thanh toán thành công!', { exact: true }).count(), 0);
        await page.screenshot({ path: this.output('vnpay-awaiting-ipn.png'), fullPage: true, animations: 'disabled' });
        await this.assertPayment('PENDING');
      }
      assert.equal((await this.request('/payment/vnpay/ipn?' + signed, 'GET', null, null)).RspCode, '00');
      await this.assertPayment(outcome === 'success' ? 'PAID' : 'PENDING');
      assert.equal((await this.request('/payment/vnpay/ipn?' + signed, 'GET', null, null)).RspCode, '00');
      await page.goto('http://127.0.0.1:4173/payment/vnpay/result?' + signed);
      await page.getByText(outcome === 'success' ? 'Thanh toán thành công!' : 'Bạn đã huỷ thanh toán', { exact: true }).waitFor();
      await page.screenshot({ path: this.output(`${this.key.toLowerCase()}-payment-result.png`), fullPage: true, animations: 'disabled' });
    } else {
      const payload = { transferType: 'in', transferAmount: this.order.totalAmount,
        content: this.order.orderCode, referenceCode: `E2E-${this.order.id}` };
      await this.request('/webhooks/sepay', 'POST', payload, 'apikey invalid-test-key', 401);
      await this.assertPayment('PENDING');
      await this.request('/webhooks/sepay', 'POST', { ...payload, transferAmount: 1 },
        'apikey ' + process.env.E2E_SEPAY_KEY);
      await this.assertPayment('PENDING');
      await this.request('/webhooks/sepay', 'POST', payload, 'apikey ' + process.env.E2E_SEPAY_KEY);
      await this.assertPayment('PAID');
      await this.request('/webhooks/sepay', 'POST', payload, 'apikey ' + process.env.E2E_SEPAY_KEY);
      // Exercise the real payment modal polling and its automatic navigation.
      await page.waitForURL(`**/orders/${this.order.id}`, { timeout: 20000 });
    }
    await this.assertPayment(outcome === 'success' ? 'PAID' : 'PENDING');
    this.events.push({ event: 'provider-simulated', provider: this.order.paymentMethod === 'VNPAY' ? 'VNPay' : 'SePay', outcome });
  }

  async seePersistedOrder(status, paymentStatus) {
    const order = await this.request(`/orders/${this.order.id}`);
    assert.equal(order.status, status);
    assert.equal(order.paymentStatus, paymentStatus);
    assert.equal(order.shippingAddress.province, this.key === 'HCM' ? 'Hồ Chí Minh' : 'Hà Nội');
    const { page } = this.helpers.Playwright;
    await page.goto(`http://127.0.0.1:4173/orders/${this.order.id}`);
    const labels = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao' };
    await page.getByTestId('order-status').getByText(labels[status], { exact: true }).waitFor();
    await page.getByTestId('order-payment-status').getByText(paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán', { exact: true }).waitFor();
    await page.getByText('Địa chỉ giả lập, không giao hàng', { exact: false }).waitFor();
    await page.screenshot({ path: this.output(`${this.key.toLowerCase()}-${status.toLowerCase()}.png`), fullPage: true, animations: 'disabled' });
    this.events.push({ event: 'order-visible', status, paymentStatus });
    fs.writeFileSync(this.output(`${this.key.toLowerCase()}-events.json`), JSON.stringify(this.events, null, 2));
  }

  async staffAdvancesOrder(status) {
    const order = await this.request(`/admin/orders/${this.order.id}/status`, 'PATCH', { status },
      'Bearer ' + this.fixtures.staffToken);
    assert.equal(order.status, status);
  }

  async customerConfirmsDelivery() {
    const { page } = this.helpers.Playwright;
    const responsePromise = page.waitForResponse(response =>
      new URL(response.url()).pathname === `/api/orders/${this.order.id}/confirm-delivered`);
    await page.getByText('Đã nhận được hàng', { exact: false }).first().click();
    assert.ok((await responsePromise).ok(), 'Customer confirms delivery via real API');
  }

  async assertPayment(expected) {
    assert.equal((await this.request(`/orders/${this.order.id}`)).paymentStatus, expected);
  }

  sign(params) {
    const query = new URLSearchParams(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)));
    query.set('vnp_SecureHash', crypto.createHmac('sha512', process.env.E2E_VNPAY_KEY).update(query.toString()).digest('hex'));
    return query;
  }

  async request(endpoint, method = 'GET', body = null, authorization = 'Bearer ' + this.fixture.token, expectedStatus = 200) {
    const response = await fetch(this.api + endpoint, { method, redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', ...(authorization ? { Authorization: authorization } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    assert.equal(response.status, expectedStatus, `${method} ${endpoint.split('?')[0]} HTTP status`);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  output(name) {
    const dir = path.resolve(__dirname, '../output/checkout-journey');
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, name);
  }
}
module.exports = CheckoutJourney;
