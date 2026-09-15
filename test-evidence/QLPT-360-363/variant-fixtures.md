# Variant đại diện chia sẻ cho kiểm thử Customer

Các bộ dữ liệu dưới đây tương ứng với các lớp EP đã tự động kiểm tra. Khi tạo trên môi trường dùng chung, thay `productId`, `flavorId` và `sizeId` bằng dữ liệu hợp lệ của môi trường.

| Mã | Mục đích | `originalPrice` | `salePrice` | `stockQty` | Giảm giá kỳ vọng |
|---|---|---:|---:|---:|---:|
| EP-ADMIN-OOS | hết hàng | 100.000 | 100.000 | 0 | 0,00% |
| EP-ADMIN-NORMAL | còn hàng, giảm thông thường | 100.000 | 80.000 | 25 | 20,00% |
| EP-ADMIN-FREE | còn hàng, giảm 100% | 100.000 | 0 | 10 | 100,00% |
| EP-ADMIN-ZERO-PRICE | giá gốc và sale đều 0 | 0 | 0 | 10 | 0,00% |

Payload mẫu:

```json
{
  "originalPrice": 100000,
  "salePrice": 80000,
  "stockQty": 25,
  "weightGram": 500,
  "sortOrder": 0,
  "isActive": true
}
```

Không nên tạo fixture `stockQty = 2147483647` trên môi trường dùng chung; case này chỉ cần chạy tự động để xác nhận cận kỹ thuật.
