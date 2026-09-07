Feature('Case biên reviews.rating (BVA): 0, 1, 2, 4, 5, 6');

// ===================================================================
// Cấu hình test — lấy từ .env
// Mỗi order chỉ được review 1 lần -> mỗi case rating dùng 1 orderId riêng
// Mỗi order test chỉ có 1 sản phẩm cần đánh giá, trạng thái DELIVERED
// ===================================================================
const ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN;
const PRODUCT_ID = process.env.TEST_PRODUCT_ID;

const ORDER_ID_RATING_0 = process.env.TEST_ORDER_ID_RATING_0;
const ORDER_ID_RATING_1 = process.env.TEST_ORDER_ID_RATING_1;
const ORDER_ID_RATING_2 = process.env.TEST_ORDER_ID_RATING_2;
const ORDER_ID_RATING_4 = process.env.TEST_ORDER_ID_RATING_4;
const ORDER_ID_RATING_5 = process.env.TEST_ORDER_ID_RATING_5;
const ORDER_ID_RATING_6 = process.env.TEST_ORDER_ID_RATING_6;
// Mỗi case rating dùng 1 order RIÊNG BIỆT, kể cả rating=0 (order 83) -
// dù không submit gì, tách order riêng để không phụ thuộc thứ tự chạy
// của scenario khác (order của rating=1 có thể đã bị "dùng" nếu
// scenario đó chạy trước và submit thành công).

// ===================================================================
// Helper: set accessToken vào localStorage trước khi vào trang,
// để app nhận diện đã đăng nhập (không cần login lại qua UI mỗi lần)
// ===================================================================
async function loginWithToken(I) {
  I.amOnPage('/'); // vào trang bất kỳ trước để có origin hợp lệ cho localStorage
  I.executeScript((token) => {
    localStorage.setItem('accessToken', token);
  }, ACCESS_TOKEN);
}

// ===================================================================
// Helper: vào trang chi tiết đơn hàng và bấm nút "Đánh giá"
// để mở popup ReviewFormPopup
// ===================================================================
async function openReviewPopup(I, orderId) {
  I.amOnPage(`/orders/${orderId}`);
  I.waitForElement('//button[contains(text(), "Đánh giá")]', 10);
  I.click('//button[contains(text(), "Đánh giá")]');
  I.waitForElement('[data-testid="review-form-popup"]', 5);
}

// ===================================================================
// RATING = 1 (biên dưới - valid, min)
// ===================================================================
Scenario('Rating = 1 (biên dưới, valid) - gửi đánh giá thành công', async ({ I }) => {
  await loginWithToken(I);
  await openReviewPopup(I, ORDER_ID_RATING_1);

  I.click('[data-testid="star-1"]');
  I.see('Tệ', '[data-testid="star-rating-label"]');

  I.fillField('[data-testid="review-comment"]', 'Test BVA: rating = 1 (biên dưới)');
  I.click('[data-testid="review-submit-btn"]');

  I.waitForElement('[data-testid="review-success-screen"]', 10);
  I.see('Cảm ơn bạn đã đánh giá', '[data-testid="review-success-title"]');
});

// ===================================================================
// RATING = 2 (cận biên dưới - valid)
// ===================================================================
Scenario('Rating = 2 (cận biên dưới, valid) - gửi đánh giá thành công', async ({ I }) => {
  await loginWithToken(I);
  await openReviewPopup(I, ORDER_ID_RATING_2);

  I.click('[data-testid="star-2"]');
  I.see('Không ổn', '[data-testid="star-rating-label"]');

  I.fillField('[data-testid="review-comment"]', 'Test BVA: rating = 2 (cận biên dưới)');
  I.click('[data-testid="review-submit-btn"]');

  I.waitForElement('[data-testid="review-success-screen"]', 10);
  I.see('Cảm ơn bạn đã đánh giá', '[data-testid="review-success-title"]');
});

// ===================================================================
// RATING = 4 (cận biên trên - valid)
// ===================================================================
Scenario('Rating = 4 (cận biên trên, valid) - gửi đánh giá thành công', async ({ I }) => {
  await loginWithToken(I);
  await openReviewPopup(I, ORDER_ID_RATING_4);

  I.click('[data-testid="star-4"]');
  I.see('Tốt', '[data-testid="star-rating-label"]');

  I.fillField('[data-testid="review-comment"]', 'Test BVA: rating = 4 (cận biên trên)');
  I.click('[data-testid="review-submit-btn"]');

  I.waitForElement('[data-testid="review-success-screen"]', 10);
  I.see('Cảm ơn bạn đã đánh giá', '[data-testid="review-success-title"]');
});

// ===================================================================
// RATING = 5 (biên trên - valid, max)
// ===================================================================
Scenario('Rating = 5 (biên trên, valid, max) - gửi đánh giá thành công', async ({ I }) => {
  await loginWithToken(I);
  await openReviewPopup(I, ORDER_ID_RATING_5);

  I.click('[data-testid="star-5"]');
  I.see('Tuyệt vời', '[data-testid="star-rating-label"]');

  I.fillField('[data-testid="review-comment"]', 'Test BVA: rating = 5 (biên trên)');
  I.click('[data-testid="review-submit-btn"]');

  I.waitForElement('[data-testid="review-success-screen"]', 10);
  I.see('Cảm ơn bạn đã đánh giá', '[data-testid="review-success-title"]');
});

// ===================================================================
// RATING = 0 (dưới biên dưới - invalid)
// UI không cho chọn "0 sao" bằng cách click, vì chỉ vẽ 5 nút (1-5).
// 0 chính là giá trị mặc định khi CHƯA chọn sao nào.
// Test: mở popup, không click sao nào, bấm "Gửi đánh giá" ngay.
// Theo code thật (ReviewFormPopup.jsx), nút "Gửi đánh giá" bị DISABLE
// khi pendingRatedCount === 0 (chưa sản phẩm nào được chấm sao).
// => Test đúng là kiểm tra nút bị disable, không phải click rồi xem lỗi.
// ===================================================================
Scenario('Rating = 0 (dưới biên dưới, invalid) - nút gửi bị vô hiệu hoá khi chưa chọn sao', async ({ I }) => {
  await loginWithToken(I);
  await openReviewPopup(I, ORDER_ID_RATING_0); // order riêng biệt, không dùng chung với case rating=1

  // Không click sao nào, kiểm tra nút Gửi đánh giá bị disable
  I.seeAttributesOnElements('[data-testid="review-submit-btn"]', { disabled: true });

  // Đóng popup mà không gửi gì, order này vẫn còn "sạch" cho scenario khác nếu cần
  I.click('[data-testid="review-popup-close-btn"]');
  I.dontSeeElement('[data-testid="review-form-popup"]');
});

// ===================================================================
// RATING = 6 (trên biên trên - invalid)
// UI không thể tạo ra giá trị này (chỉ có 5 nút sao) -> không test qua UI.
// Test trực tiếp tầng API bằng REST helper để kiểm tra backend Spring Boot
// có validate và từ chối rating > 5 hay không.
// ===================================================================
Scenario('Rating = 6 (trên biên trên, invalid) - API phải từ chối', ({ I }) => {
  if (!ACCESS_TOKEN) {
    throw new Error('Thiếu TEST_ACCESS_TOKEN trong file .env, không thể gọi API.');
  }

  I.sendPostRequest('/reviews', {
    productId: Number(PRODUCT_ID),
    orderId: Number(ORDER_ID_RATING_6),
    rating: 6,
    comment: 'Test BVA: rating = 6 (trên biên trên) - phải bị từ chối'
  }).then((response) => {
    // Kỳ vọng: backend trả lỗi 400 Bad Request (validate rating không hợp lệ)
    I.assertEqual(response.status, 400);
  });
});