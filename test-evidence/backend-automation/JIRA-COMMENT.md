Đã hoàn thành QLPT-266 — Automation testing (Spring Boot) cho Order/Payment/Shipping/Webhook.

- Dùng Spring Boot Test, JUnit 5, Mockito và MockMvc.
- 45 test thuộc phạm vi task: 45 PASS, 0 failure, 0 error, 0 skipped.
- Unit test: OrderServiceImpl (14), VnpayServiceImpl (8), GhnService (3), SePayWebhookServiceImpl (5).
- MockMvc integration test: OrderController (6), PaymentController (4), ShippingController (2), WebhookController (3).
- Kiểm tra quyền sở hữu đơn/địa chỉ, tồn kho, tổng tiền, COD/VNPay/MoMo/chuyển khoản, hủy đơn và chờ hoàn tiền, nhận hàng COD, chữ ký VNPay giả, sai số tiền IPN, callback lặp, fallback phí vận chuyển và xác thực API key webhook.
- Chạy `clean verify`: BUILD SUCCESS lúc 23:25:22 ngày 30/08/2026 (UTC+7), Java 21. Toàn backend: 103 test, 100 PASS, 3 test cũ bị @Disabled ở Cart/Product/Promotion, 0 failure, 0 error.
- JaCoCo đã sinh tại `backend/target/site/jacoco/index.html`.

Minh chứng đính kèm: 01-test-summary.png, 02-service-cases.png, 02-controller-cases.png và maven-summary.txt.

Lưu ý phạm vi: controller integration là MVC slice (@WebMvcTest), dùng mock service và cấu hình security dành cho test; unit test mock repository/API ngoài. Không khẳng định đã kiểm thử giao dịch thật, production security chain hoặc tích hợp database đầu-cuối.
