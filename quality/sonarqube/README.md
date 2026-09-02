# SonarQube cho luồng checkout

Cấu hình quét Order, Payment, Shipping và Webhook của backend Green Juice Hub.
Chạy trên máy local; không gửi mã nguồn tới SonarCloud hay dịch vụ bên ngoài.

## Khởi chạy

Yêu cầu Docker Desktop, Java 21 và PowerShell. Từ thư mục gốc repository:

```powershell
docker compose -p greenjuice-quality -f quality/sonarqube/compose.yml up -d
```

Mở http://127.0.0.1:9000, đợi server sẵn sàng. Lần cài mới dùng tài khoản
khởi tạo theo tài liệu SonarQube, đổi mật khẩu và tạo analysis token trong
My Account → Security. Đưa token vào biến môi trường `SONAR_TOKEN` của phiên
PowerShell; không ghi token vào source, lệnh có thể chia sẻ hoặc ảnh minh chứng.

```powershell
# JAVA_HOME phải trỏ tới JDK 21 trên máy của bạn.
# SONAR_TOKEN phải được đặt trong môi trường trước khi chạy.
./quality/sonarqube/scan.ps1
./quality/sonarqube/snapshot.ps1 -Label final
```

Scanner chạy Maven `verify`, xuất JaCoCo rồi gửi phân tích. Sau dòng
`ANALYSIS SUCCESSFUL`, đợi background task hoàn tất trong SonarQube trước khi
chạy snapshot; đây là hai giai đoạn khác nhau. Đường dẫn task xử lý nằm trong
`backend/target/sonar/report-task.txt`. Script snapshot xuất trạng thái hiện tại,
không tự đợi phân tích mới.

Lưu ý `-Label baseline`/`final` ghi đè snapshot cùng tên. Giữ bản baseline
trước khi sửa nếu cần so sánh riêng cho đợt quét khác.

## Phạm vi và tiêu chí

- Controller: OrderController, PaymentController, ShippingController,
  ShippingFeeController, WebhookController.
- Service: OrderServiceImpl/IOrderService và toàn bộ service payment, sepay,
  shipping; DTO order, payment, sepay.
- Test sources vẫn được scanner phân tích theo Maven. Một số cảnh báo test
  ngoài checkout có thể xuất hiện; không tắt rule để giấu các cảnh báo này.
- Profile Java mặc định **Sonar way**, không hạ severity, không `NOSONAR`,
  không đánh dấu false positive/accepted để đạt mục tiêu.
- Mục tiêu đợt xử lý: **0 Blocker và 0 Critical** trong phạm vi trên.
- Bản Community Build chạy MQR Mode: giao diện dùng mức impact
  Blocker/High/Medium/Low/Info. Snapshot giữ cả `severity` truyền thống và
  `impacts`; chỉ tiêu Blocker/Critical lấy từ API issue severity và measures.

Image Docker cố định bằng digest, phiên bản 26.8.0.126808;
Maven scanner 5.7.0.6970. Cổng chỉ bind loopback 127.0.0.1. Database nhúng
chỉ phục vụ đánh giá local, **không phải cấu hình production**.

```powershell
# Dừng khi không cần dùng; giữ các volume chứa lịch sử phân tích.
docker compose -p greenjuice-quality -f quality/sonarqube/compose.yml stop
```

## Thay đổi hành vi cần biết

VNPay Return URL chỉ kiểm tra và trả kết quả hiển thị, không ghi trạng thái
PAID. Chỉ IPN hợp lệ về chữ ký, merchant, số tiền, phương thức và trạng thái
đơn mới cập nhật thanh toán. Response thêm `confirmed` để phân biệt callback
hợp lệ với đơn đã được IPN xác nhận. Cần cấu hình IPN truy cập được từ VNPay
khi tích hợp sandbox/production; không thể xác nhận thanh toán chỉ bằng việc
người dùng quay lại trình duyệt.

IPN và SePay khóa bản ghi đơn trong transaction khi xử lý callback nhằm tuần
tự hóa các callback cho cùng đơn. Callback đến sau khi đơn bị hủy không tự
khôi phục đơn; tiền thực nhận cần quy trình đối soát/hoàn tiền riêng.
Thử nghiệm hiện tại chưa chứng minh cạnh tranh đồng thời trên MySQL thật.

SePay từ chối khi chưa cấu hình API key, so sánh chính xác phần key, không
ghi Authorization vào log. Endpoint kiểm tra dữ liệu webhook/đơn/phí ship;
phí ship kiểm tra chủ sở hữu địa chỉ trước cả nhánh phí mặc định.

## Giới hạn

Đây là kiểm tra tĩnh có phạm vi và test tự động với dependency được mock/H2,
không phải kiểm thử thanh toán thật, pentest hay chứng nhận toàn bộ hệ thống.
Community Build không có đầy đủ phân tích injection như các bản thương mại.
Không có Security Hotspot được công cụ phát hiện không đồng nghĩa không còn
lỗ hổng; các lỗi nghiệp vụ/payment được rà soát thủ công và kiểm thử riêng.

Minh chứng nằm ở `test-evidence/sonarqube-checkout`, tách khỏi `docs`.
Thông tin đăng nhập local phục vụ phiên làm việc được giữ trong thư mục
`logs` đã bị Git ignore; không commit hoặc chia sẻ thư mục này.

## Tài liệu gốc

- [SonarScanner for Maven](https://docs.sonarsource.com/sonarqube-community-build/analyzing-source-code/scanners/sonarscanner-for-maven)
- [SonarQube Community Build local evaluation](https://docs.sonarsource.com/sonarqube-community-build/try-out-sonarqube)
- [VNPay: Return URL hiển thị, IPN cập nhật giao dịch](https://sandbox.vnpayment.vn/apis/docs/faqs/)
- [VNPay payment integration](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html)
