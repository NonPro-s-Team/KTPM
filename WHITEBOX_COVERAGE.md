# WHITE-BOX COVERAGE — QLPT-367

## 1. Một testcase bao phủ được bao nhiêu phần trăm?

Coverage của một testcase không có một tỷ lệ cố định. Tỷ lệ phụ thuộc vào đường đi
thực tế của testcase qua source code. Hai testcase khác nhau có thể chạy lại nhiều
line giống nhau nên phần coverage không được cộng trực tiếp với nhau.

Kết quả dưới đây được đo bằng JaCoCo 0.8.13 trên môi trường local. Trước testcase
chính có 5 request Setup bắt buộc để kiểm tra backend và lấy quyền Customer/Admin.

| Testcase đại diện | Class được đánh giá | Line coverage quan sát được | Branch coverage | Method coverage | Phần do testcase chính làm tăng |
|---|---|---:|---:|---:|---:|
| `PROD-MIN-002` | `ProductServiceImpl` | 63/101 = **62.38%** | 28/64 = **43.75%** | 6/14 = **42.86%** | **+35/101 line = +34.65 điểm %**; +13/64 branch = +20.31 điểm % |
| `CART-EP-ADD-VALID` | `CartServiceImpl` | 28/58 = **48.28%** | 3/12 = **25.00%** | 5/13 = **38.46%** | Setup không chạm class này, nên testcase bao phủ 28/58 line = **48.28%** |
| `PROMO-EP-PCT-VALID` | `AdminPromotionServiceImpl` | 47/81 = **58.02%** | 15/50 = **30.00%** | 8/13 = **61.54%** | Setup không chạm class này, nên testcase bao phủ 47/81 line = **58.02%** |

Với `PROD-MIN-002`, không được nói riêng testcase này bao phủ 62.38% vì 5 request
Setup đã bao phủ sẵn 28/101 line. Testcase chính chỉ mở thêm 35 line, tương đương
**34.65 điểm phần trăm** của `ProductServiceImpl`.

## 2. Cần tối thiểu bao nhiêu testcase để đạt 100%?

Không thể xác định chính xác số testcase tối thiểu chỉ từ phần trăm coverage. Lý do:

- Các testcase có thể bao phủ trùng những line và branch đã chạy.
- Một testcase có thể tăng line coverage nhưng không đi qua nhánh `true` hoặc
  `false` còn thiếu.
- Muốn đạt 100% White-box phải xét riêng line, branch và method coverage.
- Một số nhánh lỗi cần dữ liệu, trạng thái database hoặc exception riêng mới đi qua.

Nếu **giả định lý tưởng** rằng mọi testcase mới đều bao phủ được số line mới bằng
testcase đại diện và không trùng bất kỳ line nào, phép tính minh họa là:

| Class | Công thức lý tưởng | Số testcase ước lượng để phủ 100% line |
|---|---:|---:|
| `ProductServiceImpl` | `ceil((101 - 28 line Setup) / 35 line mới)` | **3 testcase** sau Setup |
| `CartServiceImpl` | `ceil(58 / 28)` | **3 testcase** |
| `AdminPromotionServiceImpl` | `ceil(81 / 47)` | **2 testcase** |

Các số **3, 3 và 2** chỉ là ước lượng toán học trong điều kiện không chồng lặp,
không phải số testcase tối thiểu được bảo đảm trong thực tế. Ví dụ, ba testcase
Cart đều đi qua cùng nhánh hợp lệ vẫn có thể để sót nhánh quantity không hợp lệ.

## 3. Kết quả sau khi chạy toàn bộ bộ BVA + EP

Lần đo ngày 15/09/2026 dùng 72 testcase BVA (451/451 assertions PASS) và 46
testcase EP (260/260 assertions PASS), trong đó có 9 testcase Product EP vừa bổ
sung. Năm request Setup được chạy trước mỗi collection.

| Phạm vi | Line coverage | Branch coverage | Method coverage | Phần còn thiếu |
|---|---:|---:|---:|---|
| Product API | **61.11%** | **48.44%** | **38.10%** | 42/108 line, 33/64 branch, 13/21 method |
| Cart API | **81.25%** | **75.00%** | **61.11%** | 12/64 line, 3/12 branch, 7/18 method |
| Promotion API | **87.16%** | **61.84%** | **80.65%** | 19/148 line, 29/76 branch, 6/31 method |
| Order promotion flow | **63.69%** | **39.86%** | **41.18%** | 134/369 line, 89/148 branch, 30/51 method |

Bộ BVA + EP hiện tại chưa đạt 100% vì mục tiêu chính của bộ test là kiểm tra miền
dữ liệu đầu vào và giá trị biên, không phải đi qua toàn bộ luồng nội bộ của mọi
method trong module.

Coverage của các module mục tiêu không tăng so với lần đo trước khi thêm Product
EP. Bộ BVA đã đi qua cùng các line/branch của `ProductServiceImpl` cho đọc tồn kho
và lọc giá; EP bổ sung cách phân lớp đầu vào và bằng chứng hành vi, còn JaCoCo chỉ
đếm code đã thực thi nên không cộng thêm phần trăm cho đường đi bị trùng.

## 4. Cách xác định số testcase tối thiểu thực tế

1. Mở báo cáo JaCoCo và liệt kê từng line, branch và method màu đỏ/vàng.
2. Nhóm các nhánh chưa bao phủ có thể đi qua trong cùng một luồng.
3. Thiết kế testcase nhỏ nhất cho từng nhóm điều kiện chưa được thực thi.
4. Reset dữ liệu coverage, chạy Setup và từng testcase riêng để đo phần tăng thêm.
5. Loại testcase không tạo coverage mới hoặc gộp các testcase có cùng đường đi.
6. Chạy lại toàn bộ bộ test đến khi chỉ số mục tiêu đạt 100%.

Chỉ sau quy trình này mới có thể kết luận số testcase tối thiểu thực tế. Với số liệu
hiện có, câu trả lời chính xác khi báo cáo là: **một testcase đại diện bao phủ thêm
34.65% line Product, 48.28% line Cart hoặc 58.02% line Promotion; ước lượng lý tưởng
là 3, 3 và 2 testcase, nhưng số tối thiểu để bảo đảm 100% chưa thể xác định nếu chưa
thiết kế testcase theo các line và branch còn thiếu.**
