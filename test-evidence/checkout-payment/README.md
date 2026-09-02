# Checkout → thanh toán → theo dõi đơn

Minh chứng QLPT-269, thực hiện ngày 31/08/2026. CodeceptJS 3.7.5 + Playwright
1.55.0 chạy frontend React thật và backend Spring Boot thật trên H2 cô lập.
Nhà cung cấp thanh toán/vận chuyển được mô phỏng; không chuyển tiền thật.

Kết quả: **6/6 checkout scenarios đạt**; Maven **133 tests, 130 passed,
0 failures/errors, 3 skipped có sẵn**; smoke cũ **4/4 đạt**; frontend build
thành công. Log/JUnit đi kèm là căn cứ đối chiếu các số liệu này.

## Phạm vi đã kiểm tra

| Scenario | Phí ship | Tổng đơn | Kết quả mong đợi |
| --- | ---:| ---:| --- |
| COD, địa chỉ Hà Nội | 30.000đ | 130.000đ | Đặt hàng → xác nhận → đang giao → đã giao; chỉ thanh toán sau khi nhận hàng |
| VNPay, địa chỉ Hà Nội | 30.000đ | 130.000đ | Chữ ký sai bị từ chối; return trước IPN chờ xác nhận; IPN hợp lệ cập nhật PAID; theo dõi đến đã giao |
| MoMo, địa chỉ Hà Nội | 30.000đ | 130.000đ | Modal MoMo, SePay webhook và polling; theo dõi đến đã giao |
| Chuyển khoản/SePay, Hà Nội | 30.000đ | 130.000đ | Key sai/thiếu tiền không ghi PAID; callback đúng và lặp; polling; theo dõi đến đã giao |
| VNPay hủy thanh toán (code 24) | 30.000đ | 130.000đ | Hiển thị đã hủy; đơn vẫn PENDING, payment record FAILED |
| TP.HCM đối chứng | 19.000đ | 119.000đ | Dùng phí GHN mô phỏng, không áp phí ngoài vùng |

Các địa chỉ Hà Nội đều có đủ districtId/wardCode. Phí 30.000đ phải đúng ở
API báo phí, UI checkout và đơn lưu, không chỉ là fallback do thiếu mã GHN.
Tạm tính mỗi đơn 100.000đ, không có mã freeship/giảm giá.

## Những lỗi đã xử lý

1. Trước sửa, địa chỉ ngoài TP.HCM có mã GHN bị gửi sang GHN: 5 scenario
   tái hiện 19.000đ thay vì 30.000đ. Dùng chung ShippingFeePolicy cho báo phí
   và tạo đơn, vẫn giữ ưu tiên promotion miễn ship khi đặt hàng.
2. VNPay Return URL hợp lệ nhưng IPN chưa đến từng hiển thị thành công.
   UI hiện phân biệt `confirmed=false` và chờ xác nhận; không tự ghi PAID.
3. Thông báo “sẽ xác nhận đơn” chỉ còn hiển thị khi đơn PENDING, tránh còn
   xuất hiện khi đơn đã giao.

## Minh chứng để đính kèm Jira

Ưu tiên `test-summary.png`, `cod-checkout.png` và một hoặc nhiều ảnh
`cod-delivered.png`, `vnpay-delivered.png`, `momo-delivered.png`,
`bank_transfer-delivered.png`.

- `test-summary.png`: ảnh cửa sổ tổng hợp từ JUnit và event API thực tế;
  không phải ảnh màn hình ứng dụng hay giao diện nhà cung cấp.
- `*-checkout.png`: màn hình checkout thực tế, có địa chỉ và phí/tổng tiền.
- `*-pending.png`, `*-confirmed.png`, `*-shipping.png`, `*-delivered.png`:
  màn hình theo dõi đơn sau khi kiểm tra đúng trạng thái UI và API.
- `vnpay-awaiting-ipn.png`: browser return hợp lệ nhưng vẫn chờ xác nhận.
- `vnpay-payment-result.png`: kết quả sau IPN hợp lệ.
- `vnpay_declined-payment-result.png`: khách hủy thanh toán.
- `junit.xml`, `test-run.txt`: kết quả CodeceptJS và log console thực tế.
- `backend-test-run.txt`: tổng kết test Maven, gồm harness browser và unit/
  MockMvc test. 6 browser scenarios là con của 1 JUnit harness, không cộng
  hai số tổng lại thành số testcase độc lập.
- `*-events.json`: phương thức, phí/tổng tiền, trạng thái thực đọc từ API;
  không chứa token, khóa hay header Authorization.
- `regression-before.txt`: trích log tái hiện lỗi phí ngoài vùng trước sửa.
- `source-manifest.json`: hash source thay đổi tại lần chạy cuối.

Ảnh logo/sản phẩm/QR bên ngoài có thể không tải do chặn network ngoài
loopback. Không thay ảnh giả để che tình trạng này. Khách hàng/địa chỉ seed
là dữ liệu test, không phải giao dịch hay thông tin khách hàng thật.

## Giới hạn và cách chạy lại

Session CUSTOMER/STAFF được seed để tập trung checkout; không test OTP/login.
Chỉ GHN, VNPay gateway, SePay callback, Redis blacklist và CORS local được
mô phỏng. Không mock API tạo đơn, thanh toán hoặc đọc trạng thái của ứng dụng.
STAFF cập nhật xác nhận/đang giao qua admin API thật; khách bấm nhận hàng trên
UI thật. Kiểm tra database cuối gồm 6 đơn, 4 DELIVERED, 4 payment SUCCESS,
1 payment FAILED và tồn kho giảm đúng 12 sản phẩm.

H2 dùng VARCHAR cho snapshot địa chỉ trong test để tương thích cách JDBC
trả chuỗi JSON của MySQL. Schema production không đổi; không coi đây là
kiểm chứng cột JSON hoặc cạnh tranh transaction trên MySQL thật.

MoMo trong ứng dụng hiện là chuyển khoản được xác nhận qua SePay, không phải
MoMo merchant API độc lập. Chưa thử VNPay/SePay sandbox hoặc giao dịch thực,
QR ngân hàng, giao vận GHN thật hay chạy CI trên GitHub.

Lệnh từ gốc repository (Node trên PATH, JDK 21, đã npm ci frontend/e2e):

```powershell
./backend/mvnw.cmd -f backend/pom.xml -Dtest=CheckoutBrowserIT test
```

Hướng dẫn chi tiết: `e2e/README.md`. Không có ZIP hay JIRA-COMMENT.md.
Chưa commit/push hoặc tự đổi trạng thái Jira trong đợt thực hiện này.
