# Tổng hợp thực thi - QLPT-360, QLPT-361, QLPT-362, QLPT-363

## Môi trường

- Ngày chạy: 14/09/2026 (Asia/Saigon)
- Nhánh: `QLPT-360-361-362-363`
- Base commit: `5a77271`
- Runtime: Maven 3.9.11, Eclipse Temurin JDK 21, Docker
- Framework: JUnit Jupiter, Spring MockMvc, Mockito, AssertJ

## Lệnh chạy

```powershell
docker run --rm `
  -v "D:\KTPM:/workspace" `
  -v "C:\Users\Thien\.m2:/root/.m2" `
  -w /workspace/backend `
  maven:3.9.11-eclipse-temurin-21 `
  mvn "-Dtest=AdminProductVariantEquivalencePartitioningTest,AdminProductVariantPersistenceEpTest,AdminProductControllerMockMvcIntegrationTest,AdminProductServiceImplTest" test
```

## Kết quả

| Test suite | Run | Pass | Fail | Error | Skip |
|---|---:|---:|---:|---:|---:|
| AdminProductVariantEquivalencePartitioningTest | 15 | 15 | 0 | 0 | 0 |
| AdminProductVariantPersistenceEpTest | 6 | 6 | 0 | 0 | 0 |
| AdminProductControllerMockMvcIntegrationTest | 1 | 1 | 0 | 0 | 0 |
| AdminProductServiceImplTest | 2 | 2 | 0 | 0 | 0 |
| **Tổng** | **24** | **24** | **0** | **0** | **0** |

Kết luận: **PASS**.

Chạy hồi quy toàn bộ backend sau khi hoàn tất: **318 test, 0 Fail, 0 Error, 2 Skip, BUILD SUCCESS** (02:17 phút; kết thúc 14/09/2026 12:55:39 UTC).

## Đối chiếu yêu cầu Jira

- QLPT-361: hoàn thành phân hoạch hợp lệ/không hợp lệ cho `stock_qty`, test create/update và kiểm tra giá trị đưa vào repository.
- QLPT-362: hoàn thành phân hoạch cho `discount_percent` thông qua cặp giá gốc/giá sale, test công thức 0%/20%/25%/100% và các đầu vào không hợp lệ.
- QLPT-363: đã tổng hợp số liệu Pass/Fail, nguồn đặc tả, dữ liệu chia sẻ và đánh giá bug.
- QLPT-360: ba subtask kỹ thuật đã có đủ mã test và bằng chứng trong repo.

## Bug và rủi ro

- Không phát hiện bug mới trong lần chạy này.
- Hồi quy QLPT-303 đạt: `salePrice > originalPrice` trả 400 và không lưu.
- Hồi quy QLPT-365 đạt: số thập phân, chuỗi phi số và giá trị vượt `Integer` trả 400 thay vì 500.
- Rủi ro còn lại: chưa có giới hạn tồn kho tối đa ở mức nghiệp vụ; hệ thống chấp nhận đến cận `Integer`. Vì SRS/SDD chưa quy định mức trần khác nên chưa phân loại đây là bug.
- Đây là kiểm thử tự động ở biên controller/service với repository mock; không thay thế một lượt Postman trên môi trường triển khai thật và MySQL thật.
