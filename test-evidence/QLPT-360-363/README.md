# QLPT Sprint 7 - Admin product variant EP

Phạm vi: QLPT-360, QLPT-361, QLPT-362 và QLPT-363.

## Kết quả

- Đã đối chiếu Jira, SRS, SDD, schema, DTO và service thực tế.
- Đã thiết kế và tự động hóa 21 lượt kiểm thử mới theo Equivalence Partitioning.
- Đã chạy kèm 3 test hồi quy liên quan: tổng cộng 24 test, 24 Pass, 0 Fail, 0 Error, 0 Skip.
- Đã chạy toàn bộ backend: 318 test, 316 Pass, 0 Fail, 0 Error, 2 Skip có sẵn; build thành công.
- Đã kiểm tra cả `POST /api/admin/products/{productId}/variants` và `PUT /api/admin/products/variants/{variantId}`.
- Đã xác nhận dữ liệu `stockQty` và `discountPercent` được chuyển vào entity lưu/cập nhật đúng.
- Không phát hiện bug mới trong phạm vi chạy tự động.

## Tệp bàn giao

- `ep-test-cases.md`: cơ sở đặc tả, các lớp tương đương và test case.
- `execution-summary.md`: môi trường, lệnh chạy, kết quả và đánh giá bug.
- `variant-fixtures.md`: bộ variant đại diện để chia sẻ cho nhóm kiểm thử Customer.
- `test-run.txt`: phần tổng kết nguyên bản từ Maven Surefire.

## Mã kiểm thử

- `backend/src/test/java/com/greenjuicehub/backend/controller/AdminProductVariantEquivalencePartitioningTest.java`
- `backend/src/test/java/com/greenjuicehub/backend/service/product/AdminProductVariantPersistenceEpTest.java`

Không cần sửa production code: các lỗi hồi quy liên quan QLPT-303 và QLPT-365 đã được xử lý trên `develop` và đều được test xác nhận lại.
