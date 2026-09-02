# ELearning 1 — Postman

File nộp bài: `Elearning-1-GreenJuiceHub.postman_collection.json`.

Đây là collection rút gọn từ collection chính của project, minh họa phần REST API sản phẩm. Collection có 7 request `GET` công khai và đã khai báo sẵn `base_url`, vì vậy không cần import Environment hoặc đăng nhập.

## Cách sử dụng

1. Khởi tạo MySQL bằng `database/schema.sql`, sau đó nạp `database/seed.sql`.
2. Khởi động MySQL, Redis và backend tại `http://localhost:8081`.
3. Mở Postman và import file JSON trong thư mục này.
4. Chọn collection `ELearning 1 - Green Juice Hub REST API (Products)`.
5. Chạy toàn bộ collection theo thứ tự từ `01` đến `07`.

Request `01 - List products` sẽ tự lấy slug của sản phẩm đầu tiên để request `02 - Get product detail by slug` sử dụng.
