# QLPT-278 - SonarQube Admin/Dashboard

Script chỉ quét source Admin/Dashboard trong phạm vi QLPT-278. Script chạy 25 test
Admin/Dashboard hiện có trước khi gửi kết quả lên SonarQube local, sau đó xuất toàn
bộ issue, hotspot, Quality Gate và riêng kết quả của `AdminTagController` thành JSON.

## Chuẩn bị một lần

1. Mở Docker Desktop.
2. Chạy SonarQube local:

   ```powershell
   docker compose -f .\quality\sonarqube\compose.yml up -d
   ```

3. Mở `http://127.0.0.1:9000`, đăng nhập lần đầu, đổi mật khẩu và tạo Analysis Token.
4. Chỉ lưu token trong phiên PowerShell hiện tại:

   ```powershell
   $env:SONAR_TOKEN = 'token-vua-tao'
   ```

Không ghi token vào source, `.env`, ảnh minh chứng hoặc Jira.

## Quét lần đầu

Từ thư mục gốc repository:

```powershell
.\quality\sonarqube\scan-admin-dashboard.ps1 -Label baseline
```

Kết quả nằm trong `test-evidence/sonarqube-admin-dashboard/baseline.json` và
`baseline-scan.log`. Trường `adminTagControllerFindingCount` trả lời trực tiếp việc
SonarQube có đánh dấu `AdminTagController` hay không.

Nếu baseline có finding cần sửa source, phải review từng finding trước rồi mới sửa.
Sau khi sửa và được duyệt, chạy lại với `-Label final` để so sánh:

```powershell
.\quality\sonarqube\scan-admin-dashboard.ps1 -Label final
```
