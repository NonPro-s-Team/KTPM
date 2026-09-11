# QLPT-342 / BUG-CART-001 — minh chứng regression

- Thời điểm: 2026-09-11T22:07:47+07:00; nhánh huytran, bản sửa chưa commit.
- Tests run: 294, Failures: 0, Errors: 0, Skipped: 2. BUILD SUCCESS.
- POST /api/cart/items với productId=13, variantId=37, quantity=1.5: HTTP 400.
- PUT /api/cart/items/7 với quantity=1.5: HTTP 400.
- Cả hai kiểm tra verifyNoInteractions(cartService) đều đạt.
- File api-evidence.json chứa request/response lấy từ output MockMvc thực tế.
- PNG là ảnh chụp báo cáo HTML được dựng từ kết quả test, không phải ảnh Postman.
- Giới hạn: mock CUSTOMER principal và ICartService; không kiểm tra JWT login hoặc dữ liệu seed. Backend local không khởi động được do MySQL Access denied; chưa xác minh GET cart / tồn kho DB.
- 2 test bị skip thuộc bộ test hiện có; không phải toàn bộ test đều được chạy.

Chạy lại trong backend: `.\mvnw.cmd "-Dcart.evidence=true" test`
Sau đó chạy `build_evidence.py` để cập nhật báo cáo từ log backend/target/qlpt-342-evidence-run.log.
