# Green Juice Hub Postman Collection

File cần import:

- `GreenJuiceHub.postman_collection.json`

Collection dùng **collection variables**, vì vậy không cần file Environment riêng và không phụ thuộc token/ID trong workspace của người tạo.

## Chuẩn bị

1. Tạo dữ liệu local:

   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```

2. Chạy Redis.
3. Chạy backend từ thư mục `backend`; mặc định API ở `http://localhost:8081`.
4. Import `postman/GreenJuiceHub.postman_collection.json` vào Postman.

## Cách chạy

1. Chạy folder `00 - Setup` trước.
2. Chạy từng module cần kiểm thử: Products, Cart, Promotions, Reviews hoặc Users and Addresses.

`00 - Setup` tự động:

- đăng nhập tài khoản CUSTOMER `seed.user001@greenjuicehub.local`;
- đăng nhập tài khoản ADMIN `seed.admin@greenjuicehub.local`;
- dùng mật khẩu seed chung `password`;
- lấy product, tag và delivered order ID từ database vừa seed;
- lưu token và ID vào collection variables.

## Lưu ý

- `base_url` mặc định là `http://localhost:8081`; chỉ sửa collection variable này nếu backend chạy cổng khác.
- Các ca OTP, Google login và expiry bị bỏ qua mặc định. Đặt `runManualOtpCases=true` nếu có đủ cấu hình dịch vụ và muốn chạy thủ công.
- Một số module tạo/xóa dữ liệu kiểm thử. Nên chạy trên database local đã seed, không chạy collection này trên database production.
- Khi cần trạng thái ban đầu sạch, tạo lại schema và chạy lại `database/seed.sql`.
