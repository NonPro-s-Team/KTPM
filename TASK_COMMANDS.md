# Lệnh thường dùng của project KTPM

Các lệnh dưới đây dùng cho Windows PowerShell và chạy từ
`D:\Workspace\university\KTPM\KTPM`, trừ khi phần đó yêu cầu chuyển thư mục.
Project dùng Java 21, Maven Wrapper, Node.js/npm, MySQL, Redis, Postman/Newman,
CodeceptJS và JaCoCo.

## 1. Database và Redis

File `docker-compose.yml` ở thư mục gốc khai báo MySQL tại cổng `3306`, Redis tại
cổng `6379`, đồng thời tự nạp `database/schema.sql` và `database/seed.sql` khi tạo
volume MySQL lần đầu.

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM'
docker compose up -d mysql redis
docker compose ps
docker compose exec mysql mysqladmin ping -h localhost -uroot
docker compose exec redis redis-cli ping
```

Dừng dịch vụ nhưng giữ dữ liệu:

```powershell
docker compose stop mysql redis
```

Xem log:

```powershell
docker compose logs --tail 100 mysql redis
```

Không dùng `docker compose down -v` khi chưa chủ động muốn xóa toàn bộ dữ liệu
local.

## 2. Schema và seed

Project không cấu hình Flyway hoặc Liquibase. Spring Boot dùng
`spring.jpa.hibernate.ddl-auto=validate`; migration local là `database/schema.sql`
và dữ liệu mẫu là `database/seed.sql`.

Chỉ chạy thủ công khi database đã tồn tại nhưng chưa có schema/seed:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM'
Get-Content -Raw .\database\schema.sql | docker compose exec -T mysql mysql -uroot green_juice_hub
Get-Content -Raw .\database\seed.sql   | docker compose exec -T mysql mysql -uroot green_juice_hub
```

`seed.sql` có chốt tránh chèn trùng tài khoản seed. Không chạy các lệnh này trên
database dùng chung hoặc production.

## 3. Backend

`application.yml` tự import `backend/.env`, nên không cần vòng lặp PowerShell để
nạp biến môi trường.

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM\backend'
.\mvnw.cmd spring-boot:run
```

Backend sẵn sàng khi terminal có `Tomcat started on port 8081`.

Build và test toàn backend:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM\backend'
.\mvnw.cmd clean verify
```

## 4. Frontend

Chuẩn bị dependency lần đầu hoặc sau khi `package-lock.json` thay đổi:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM\frontend'
npm.cmd ci
```

Chạy frontend:

```powershell
npm.cmd run dev -- --host localhost --port 5173
```

Build, unit test pricing và lint:

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run lint
```

## 5. Kiểm tra nhanh API và cổng

```powershell
Invoke-WebRequest 'http://localhost:8081/api/products?page=0&size=1' | Select-Object StatusCode
Test-NetConnection localhost -Port 3306
Test-NetConnection localhost -Port 6379
Test-NetConnection localhost -Port 8081
Test-NetConnection localhost -Port 5173
```

## 6. QLPT-253, QLPT-277, QLPT-278 và QLPT-279

Chạy đúng bộ backend Admin/Dashboard dùng cho QLPT-253 và QLPT-277:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM\backend'
.\mvnw.cmd -B verify '-Dtest=BackendApplicationTests,AdminControllersUnitTest,AdminDashboardMockMvcIntegrationTest'
```

Chạy SonarQube và quét phạm vi Admin/Dashboard của QLPT-278:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM'
docker compose -f .\quality\sonarqube\compose.yml up -d
$env:SONAR_TOKEN = 'TOKEN_LOCAL_VUA_TAO'
.\quality\sonarqube\scan-admin-dashboard.ps1 -Label final
```

Không ghi token vào file, ảnh hoặc Jira. Mở kết quả tại
`http://127.0.0.1:9000/dashboard?id=green-juice-hub-admin-dashboard`.

Chạy CodeceptJS Admin/Dashboard của QLPT-279:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM\e2e'
npm.cmd ci
npm.cmd run browsers:install
npm.cmd run test:admin
npm.cmd run test:admin:headed
```

Lệnh `test:admin:headed` mở Chromium để quan sát khi báo cáo. Kết quả JUnit nằm
trong `test-evidence/codeceptjs-admin/`.

## 7. QLPT-282 - BVA Product/Cart/Promotion

Sau khi chọn database local, bật ba chốt ghi dữ liệu trong environment Postman:
`dedicated_test_data_confirmed=true`, `allow_test_writes=true` và
`allow_order_creation=true`. Chạy bằng Collection Runner với `Iterations=1`.

Nếu máy đã cài Newman, lệnh chạy toàn bộ collection là:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM'
newman run .\postman\BVA\Nhan\QLPT-282\QLPT-282.postman_collection.json `
  -e .\postman\BVA\Nhan\QLPT-282\QLPT-282.postman_environment.json `
  --reporters cli,json `
  --reporter-json-export .\backend\target\qlpt282-newman.json `
  --timeout-request 15000 `
  --timeout-script 180000 `
  --ignore-redirects
```

Sau khi chạy, đặt lại ba chốt về `false`. Không commit file environment có token.

## 8. QLPT-300 - Product API sort theo giá và giữ filter

Các test nằm trên nhánh `QLPT-300`. Chạy test hồi quy trực tiếp:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM\backend'
.\mvnw.cmd -B test '-Dtest=ProductPriceSortFilterIntegrationTest,ProductServiceImplTest'
```

Kiểm tra thủ công cả hai chiều sort với cùng filter:

```powershell
Invoke-RestMethod 'http://localhost:8081/api/products?page=0&size=20&categoryId=1&sortBy=price_asc'
Invoke-RestMethod 'http://localhost:8081/api/products?page=0&size=20&categoryId=1&sortBy=price_desc'
```

Thay `categoryId=1` bằng ID có dữ liệu trong database local. So sánh tổng số phần
tử với request cùng filter nhưng không có `sort`; sort không được làm mất filter.

## 9. QLPT-347 - Equivalence Partitioning

Chạy collection
`postman/EP/Nhan/QLPT-347/QLPT-347.postman_collection.json` bằng Postman Collection
Runner, chọn environment `QLPT-282 LOCAL`, `Iterations=1`, đúng thứ tự Setup,
Product EP, QLPT-350, QLPT-351, QLPT-352.

Lệnh Newman tương đương:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM'
npx.cmd --yes newman@6.2.1 run .\postman\EP\Nhan\QLPT-347\QLPT-347.postman_collection.json `
  -e .\postman\BVA\Nhan\QLPT-282\QLPT-282.postman_environment.json `
  --reporters cli,json `
  --reporter-json-export .\backend\target\qlpt347-newman.json `
  --timeout-request 15000 `
  --timeout-script 180000 `
  --ignore-redirects
```

Kết quả đúng của lần kiểm tra hiện tại: 5 Setup + 46 testcase EP, gồm 9 Product,
10 Cart và 27 Promotion; 260/260 assertions PASS. Newman có thể đếm tổng request
HTTP lớn hơn 51 vì script dùng `pm.sendRequest` để chuẩn bị và đối chiếu fixture.

## 10. QLPT-367 - White-box coverage cho BVA + EP

JaCoCo version `0.8.13` đã được cấu hình trong `backend/pom.xml`. Mở PowerShell thứ
nhất để chạy backend có agent coverage:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM\backend'
$jacocoAgent = (Resolve-Path "$env:USERPROFILE\.m2\repository\org\jacoco\org.jacoco.agent\0.8.13\org.jacoco.agent-0.8.13-runtime.jar").Path
$jvmArgs = "-javaagent:$jacocoAgent=output=file,destfile=target/jacoco-qlpt367.exec,append=false,dumponexit=true"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.jvmArguments=$jvmArgs"
```

Khi backend đã lên, chạy lần lượt collection BVA của QLPT-282 và EP của QLPT-347
trong Postman. Sau khi chạy xong, quay lại terminal backend và nhấn `Ctrl+C` để
JaCoCo ghi file `.exec`. Sau đó tạo HTML report:

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM\backend'
.\mvnw.cmd jacoco:report '-Djacoco.dataFile=target/jacoco-qlpt367.exec'
Start-Process .\target\site\jacoco\index.html
```

Các file trong `backend/target/` là kết quả chạy local, có thể tạo lại và không cần
commit.

## 11. Git kiểm tra an toàn

```powershell
Set-Location 'D:\Workspace\university\KTPM\KTPM'
git branch --show-current
git status --short --branch
git diff --check
git diff --stat
git diff
```

Luôn xem lại `git diff` và chỉ stage đúng file của task. Các lệnh ở đây không thực
hiện commit, push, merge hoặc thay đổi Jira.
