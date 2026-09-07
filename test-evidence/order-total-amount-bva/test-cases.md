# QLPT-293 — Test cases và kết quả thực thi

Môi trường: H2 MySQL mode; JPA generated schema, NOT MySQL. 59 cases: 39 Pass, 6 Fail, 14 Blocked. 327 HTTP requests.

Pass của ca characterization chỉ có nghĩa hành vi được quan sát đúng; không xác lập requirement mới. Các ca đầu vào/SePay bổ sung được phân loại riêng với BVA tổng tiền. Mỗi nhóm HTTP giữ nguyên request/response ở api-evidence.json và trong Postman Examples.

| ID | Layer | Status | Expected | Actual |
|---|---|---|---|---|
| BUY-baseline-fallback | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"80000","subtotal":"50000","discount":"0","shipping":"30000"} | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"30000.00","total_amount":"80000.00","amount":"80000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":1} |
| BUY-baseline-ghn-stub | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"69000","subtotal":"50000","discount":"0","shipping":"19000"} | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"19000.00","total_amount":"69000.00","amount":"69000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":2} |
| BUY-free-shipping | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"49999.99","subtotal":"50000","discount":"0.01","shipping":"0"} | {"subtotal":"50000.00","discount_amount":"0.01","shipping_fee":"0.00","total_amount":"49999.99","amount":"49999.99","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":3} |
| BUY-lower-plus-cent | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"0.01","subtotal":"50000","discount":"49999.99","shipping":"0"} | {"subtotal":"50000.00","discount_amount":"49999.99","shipping_fee":"0.00","total_amount":"0.01","amount":"0.01","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":4} |
| BUY-lower-zero | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Fail** | {"total":"0","subtotal":"50000","discount":"50000","shipping":"0"} | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"0.00","total_amount":"0.00","amount":"0.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":5} |
| BUY-lower-minus-candidate-clamped | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Fail** | {"total":"0","subtotal":"50000","discount":"50000","shipping":"0"} | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"0.00","total_amount":"0.00","amount":"0.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":6} |
| BUY-discount-below-subtotal-with-fee | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"30000.01","subtotal":"50000","discount":"49999.99","shipping":"30000"} | {"subtotal":"50000.00","discount_amount":"49999.99","shipping_fee":"30000.00","total_amount":"30000.01","amount":"30000.01","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":7} |
| BUY-discount-equal-subtotal-with-fee | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"30000","subtotal":"50000","discount":"50000","shipping":"30000"} | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"30000.00","total_amount":"30000.00","amount":"30000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":8} |
| BUY-discount-above-subtotal-with-fee | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"30000","subtotal":"50000","discount":"50000","shipping":"30000"} | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"30000.00","total_amount":"30000.00","amount":"30000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":9} |
| BUY-percent-floor-below | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"45009.99","subtotal":"50009.99","discount":"5000","shipping":"0"} | {"subtotal":"50009.99","discount_amount":"5000.00","shipping_fee":"0.00","total_amount":"45009.99","amount":"45009.99","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50009.99","orderId":10} |
| BUY-percent-floor-at | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"45009","subtotal":"50010.00","discount":"5001","shipping":"0"} | {"subtotal":"50010.00","discount_amount":"5001.00","shipping_fee":"0.00","total_amount":"45009.00","amount":"45009.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50010.00","orderId":11} |
| BUY-percent-floor-above | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"45009.01","subtotal":"50010.01","discount":"5001","shipping":"0"} | {"subtotal":"50010.01","discount_amount":"5001.00","shipping_fee":"0.00","total_amount":"45009.01","amount":"45009.01","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50010.01","orderId":12} |
| BUY-percent-100 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Fail** | {"total":"0","subtotal":"50000","discount":"50000","shipping":"0"} | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"0.00","total_amount":"0.00","amount":"0.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":13} |
| CART-baseline-fallback | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"80000","subtotal":"50000","discount":"0","shipping":"30000"} | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"30000.00","total_amount":"80000.00","amount":"80000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":14} |
| CART-baseline-ghn-stub | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"69000","subtotal":"50000","discount":"0","shipping":"19000"} | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"19000.00","total_amount":"69000.00","amount":"69000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":15} |
| CART-free-shipping | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"49999.99","subtotal":"50000","discount":"0.01","shipping":"0"} | {"subtotal":"50000.00","discount_amount":"0.01","shipping_fee":"0.00","total_amount":"49999.99","amount":"49999.99","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":16} |
| CART-lower-plus-cent | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"0.01","subtotal":"50000","discount":"49999.99","shipping":"0"} | {"subtotal":"50000.00","discount_amount":"49999.99","shipping_fee":"0.00","total_amount":"0.01","amount":"0.01","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":17} |
| CART-lower-zero | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Fail** | {"total":"0","subtotal":"50000","discount":"50000","shipping":"0"} | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"0.00","total_amount":"0.00","amount":"0.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":18} |
| CART-lower-minus-candidate-clamped | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Fail** | {"total":"0","subtotal":"50000","discount":"50000","shipping":"0"} | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"0.00","total_amount":"0.00","amount":"0.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":19} |
| CART-discount-below-subtotal-with-fee | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"30000.01","subtotal":"50000","discount":"49999.99","shipping":"30000"} | {"subtotal":"50000.00","discount_amount":"49999.99","shipping_fee":"30000.00","total_amount":"30000.01","amount":"30000.01","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":20} |
| CART-discount-equal-subtotal-with-fee | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"30000","subtotal":"50000","discount":"50000","shipping":"30000"} | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"30000.00","total_amount":"30000.00","amount":"30000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":21} |
| CART-discount-above-subtotal-with-fee | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"30000","subtotal":"50000","discount":"50000","shipping":"30000"} | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"30000.00","total_amount":"30000.00","amount":"30000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":22} |
| CART-percent-floor-below | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"45009.99","subtotal":"50009.99","discount":"5000","shipping":"0"} | {"subtotal":"50009.99","discount_amount":"5000.00","shipping_fee":"0.00","total_amount":"45009.99","amount":"45009.99","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50009.99","orderId":23} |
| CART-percent-floor-at | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"45009","subtotal":"50010.00","discount":"5001","shipping":"0"} | {"subtotal":"50010.00","discount_amount":"5001.00","shipping_fee":"0.00","total_amount":"45009.00","amount":"45009.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50010.00","orderId":24} |
| CART-percent-floor-above | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | {"total":"45009.01","subtotal":"50010.01","discount":"5001","shipping":"0"} | {"subtotal":"50010.01","discount_amount":"5001.00","shipping_fee":"0.00","total_amount":"45009.01","amount":"45009.01","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50010.01","orderId":25} |
| CART-percent-100 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Fail** | {"total":"0","subtotal":"50000","discount":"50000","shipping":"0"} | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"0.00","total_amount":"0.00","amount":"0.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":26} |
| SHIPPING-provinces | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | HTTP 200 with configured GHN geography stub; contract only, NOT live carrier data | {"ProvinceName":"Hồ Chí Minh","ProvinceID":202} |
| SHIPPING-districts?provinceId=202 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | HTTP 200 with configured GHN geography stub; contract only, NOT live carrier data | {"DistrictName":"Quận 1","DistrictID":1454} |
| SHIPPING-wards?districtId=1454 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | HTTP 200 with configured GHN geography stub; contract only, NOT live carrier data | {"WardCode":"20101","WardName":"Phường kiểm thử"} |
| BUY-zero-COD | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | Characterization: zero accepted and stored; not a new business rule | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"0.00","total_amount":"0.00","amount":"0.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":27} |
| CART-zero-COD | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | Characterization: zero accepted and stored; not a new business rule | {"subtotal":"50000.00","discount_amount":"50000.00","shipping_fee":"0.00","total_amount":"0.00","amount":"0.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":28} |
| INPUT-quantity--1 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | 400; unchanged orders/payments/stock | {"message":"quantity: Số lượng tối thiểu là 1","status":400,"timestamp":"2026-08-31T22:06:18.2354364"} |
| INPUT-quantity-0 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | 400; unchanged orders/payments/stock | {"message":"quantity: Số lượng tối thiểu là 1","status":400,"timestamp":"2026-08-31T22:06:18.2465463"} |
| INPUT-empty-cart | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | 400; no zero-item order | {"message":"cartItemIds: Phải chọn ít nhất 1 sản phẩm","status":400,"timestamp":"2026-08-31T22:06:18.2535459"} |
| INPUT-percent-over-100 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | 400; percent >100 prevented at admin API | {"message":"Giảm theo % không được vượt quá 100","status":400,"timestamp":"2026-08-31T22:06:18.263503"} |
| BUY-client-money-tampering | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | Backend computes 80000 independently | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"30000.00","total_amount":"80000.00","amount":"80000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":29} |
| CART-client-money-tampering | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | Backend computes 80000 independently | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"30000.00","total_amount":"80000.00","amount":"80000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":30} |
| SEPAY-BANK_TRANSFER-delta--1 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | PENDING; amount remains 80000 | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"30000.00","total_amount":"80000.00","amount":"80000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":31} |
| SEPAY-BANK_TRANSFER-delta-0 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | PAID; amount remains 80000 | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"30000.00","total_amount":"80000.00","amount":"80000.00","payment_status":"PAID","payment_record_status":"SUCCESS","items_subtotal":"50000.00","orderId":32} |
| SEPAY-BANK_TRANSFER-delta-1 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | PAID; amount remains 80000 | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"30000.00","total_amount":"80000.00","amount":"80000.00","payment_status":"PAID","payment_record_status":"SUCCESS","items_subtotal":"50000.00","orderId":33} |
| SEPAY-MOMO-delta--1 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | PENDING; amount remains 80000 | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"30000.00","total_amount":"80000.00","amount":"80000.00","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.00","orderId":34} |
| SEPAY-MOMO-delta-0 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | PAID; amount remains 80000 | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"30000.00","total_amount":"80000.00","amount":"80000.00","payment_status":"PAID","payment_record_status":"SUCCESS","items_subtotal":"50000.00","orderId":35} |
| SEPAY-MOMO-delta-1 | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | PAID; amount remains 80000 | {"subtotal":"50000.00","discount_amount":"0.00","shipping_fee":"30000.00","total_amount":"80000.00","amount":"80000.00","payment_status":"PAID","payment_record_status":"SUCCESS","items_subtotal":"50000.00","orderId":36} |
| BUY-negative-GHN-fault-injection | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | Observe -0.01 persistence; no business min inferred | {"subtotal":"50000.99","discount_amount":"0.00","shipping_fee":"-50001.00","total_amount":"-0.01","amount":"-0.01","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.99","orderId":37} |
| CART-negative-GHN-fault-injection | HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL | **Pass** | Observe -0.01 persistence; no business min inferred | {"subtotal":"50000.99","discount_amount":"0.00","shipping_fee":"-50001.00","total_amount":"-0.01","amount":"-0.01","payment_status":"PENDING","payment_record_status":"PENDING","items_subtotal":"50000.99","orderId":38} |
| MYSQL-DECIMAL--0.01 | MySQL storage | **Blocked** | Exact storage or overflow rejection on actual MySQL | MySQL credentials unavailable; H2 result must not substitute for MySQL. |
| MYSQL-DECIMAL-0 | MySQL storage | **Blocked** | Exact storage or overflow rejection on actual MySQL | MySQL credentials unavailable; H2 result must not substitute for MySQL. |
| MYSQL-DECIMAL-0.01 | MySQL storage | **Blocked** | Exact storage or overflow rejection on actual MySQL | MySQL credentials unavailable; H2 result must not substitute for MySQL. |
| MYSQL-DECIMAL-9999999999.98 | MySQL storage | **Blocked** | Exact storage or overflow rejection on actual MySQL | MySQL credentials unavailable; H2 result must not substitute for MySQL. |
| MYSQL-DECIMAL-9999999999.99 | MySQL storage | **Blocked** | Exact storage or overflow rejection on actual MySQL | MySQL credentials unavailable; H2 result must not substitute for MySQL. |
| MYSQL-DECIMAL-10000000000.00 | MySQL storage | **Blocked** | Exact storage or overflow rejection on actual MySQL | MySQL credentials unavailable; H2 result must not substitute for MySQL. |
| BUY-upper-9999999999.98 | System/API | **Blocked** | Assess storage boundary without unrealistic sales data | No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed. |
| BUY-upper-9999999999.99 | System/API | **Blocked** | Assess storage boundary without unrealistic sales data | No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed. |
| BUY-upper-10000000000.00 | System/API | **Blocked** | Assess storage boundary without unrealistic sales data | No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed. |
| CART-upper-9999999999.98 | System/API | **Blocked** | Assess storage boundary without unrealistic sales data | No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed. |
| CART-upper-9999999999.99 | System/API | **Blocked** | Assess storage boundary without unrealistic sales data | No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed. |
| CART-upper-10000000000.00 | System/API | **Blocked** | Assess storage boundary without unrealistic sales data | No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed. |
| LIVE-GHN | External integration | **Blocked** | Real GHN quote and carrier geography | Not contacted; deterministic GHN stub is not evidence of live carrier behavior. |
| LIVE-VNPAY | External integration | **Blocked** | Gateway accepts amount and delivers callbacks | Only local create-url and correctly signed simulated IPN/Return executed; no real payment. |

## Chi tiết dữ liệu, bước chạy và evidence

### BUY-baseline-fallback — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 1
  },
  "quantity": 1,
  "input": {
    "variantId": 2,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-baseline-fallback"
  },
  "price": "50000",
  "expected": {
    "total": "80000",
    "subtotal": "50000",
    "discount": "0",
    "shipping": "30000"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 1
  },
  "before": {
    "orders": 0,
    "stock": 1000,
    "payments": 0
  },
  "actual": {
    "id": 1,
    "orderCode": "GJH-B2039B4A",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 0,
    "shippingFee": 30000,
    "totalAmount": 80000.0,
    "promoCode": null,
    "note": "QLPT-293 BUY-baseline-fallback",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 2,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:15.3317902",
    "createdAt": "2026-08-31T22:06:15.3392683",
    "updatedAt": "2026-08-31T22:06:15.3392683"
  },
  "id": "BUY-baseline-fallback",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "response discount",
      "actual": "0"
    },
    {
      "expected": "30000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "response shipping",
      "actual": "30000"
    },
    {
      "expected": "80000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "response total",
      "actual": "8E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/orders/1 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "0"
    },
    {
      "expected": "30000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "3E+4"
    },
    {
      "expected": "8E+4",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "8E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "0",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "0.00"
    },
    {
      "expected": "30000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "30000.00"
    },
    {
      "expected": "80000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "80000.00"
    },
    {
      "expected": "80000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "DB amount",
      "actual": "80000.00"
    },
    {
      "expected": "50000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "8000000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "8000000"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":1,\"success\":true,\"orderCode\":\"GJH-B2039B4A\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":1,\"success\":true,\"orderCode\":\"GJH-B2039B4A\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "80000",
      "case": "BUY-baseline-fallback",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "80000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/shipping-fee → HTTP 200
2. POST /api/orders/buy-now → HTTP 200
3. GET /api/orders/1 → HTTP 200
4. POST /api/payment/vnpay/create-url → HTTP 200
5. GET /api/payment/vnpay/ipn?vnp_Amount=7999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2931&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B2039B4A&vnp_SecureHash=80074d26750acc58402c6202613cdc4aef5077228244da5bbd7f6d526a4e2fd2dbeef01cbb74dc30bc7787b7a121c5623e9e98300853ef60059ba807713dc763 → HTTP 200
6. GET /api/payment/vnpay/ipn?vnp_Amount=8000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2931&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B2039B4A&vnp_SecureHash=48c2ef9dd5efaec9450e3f6bc3890b8c9e90e612d32b7ad46f9e32854d63533c991d09edd50563f408a97cb27bbe4c57fc1e654e228565c5cc6cac621afd847f → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=8000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2931&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B2039B4A&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
8. GET /api/payment/vnpay/return?vnp_Amount=8000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2931&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B2039B4A&vnp_SecureHash=9543dbb20c5348289060b4e04fdb778664c90908023380cf1009737f470488b5229ea843d09e5d1504da1151e41a8a248db2d14ba0d4c90ec458436c395dabdb → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=8000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2931&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B2039B4A&vnp_SecureHash=9543dbb20c5348289060b4e04fdb778664c90908023380cf1009737f470488b5229ea843d09e5d1504da1151e41a8a248db2d14ba0d4c90ec458436c395dabdb → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=8000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2931&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B2039B4A&vnp_SecureHash=9543dbb20c5348289060b4e04fdb778664c90908023380cf1009737f470488b5229ea843d09e5d1504da1151e41a8a248db2d14ba0d4c90ec458436c395dabdb → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=8000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2931&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B2039B4A&vnp_SecureHash=9543dbb20c5348289060b4e04fdb778664c90908023380cf1009737f470488b5229ea843d09e5d1504da1151e41a8a248db2d14ba0d4c90ec458436c395dabdb → HTTP 200

### BUY-baseline-ghn-stub — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "19000.00",
    "total_amount": "69000.00",
    "amount": "69000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 2
  },
  "quantity": 1,
  "input": {
    "variantId": 3,
    "quantity": 1,
    "addressId": 2,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-baseline-ghn-stub"
  },
  "price": "50000",
  "expected": {
    "total": "69000",
    "subtotal": "50000",
    "discount": "0",
    "shipping": "19000"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "19000.00",
    "total_amount": "69000.00",
    "amount": "69000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 2
  },
  "before": {
    "orders": 1,
    "stock": 1000,
    "payments": 1
  },
  "actual": {
    "id": 2,
    "orderCode": "GJH-B36476A2",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 0,
    "shippingFee": 19000,
    "totalAmount": 69000.0,
    "promoCode": null,
    "note": "QLPT-293 BUY-baseline-ghn-stub",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 2,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 3,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:15.5972279",
    "createdAt": "2026-08-31T22:06:15.5982281",
    "updatedAt": "2026-08-31T22:06:15.5982281"
  },
  "id": "BUY-baseline-ghn-stub",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "19000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "19000"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "response discount",
      "actual": "0"
    },
    {
      "expected": "19000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "response shipping",
      "actual": "19000"
    },
    {
      "expected": "69000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "response total",
      "actual": "6.9E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/orders/2 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "0"
    },
    {
      "expected": "19000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "1.9E+4"
    },
    {
      "expected": "6.9E+4",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "6.9E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "0",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "0.00"
    },
    {
      "expected": "19000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "19000.00"
    },
    {
      "expected": "69000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "69000.00"
    },
    {
      "expected": "69000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB amount",
      "actual": "69000.00"
    },
    {
      "expected": "50000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "6900000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "6900000"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":2,\"success\":true,\"orderCode\":\"GJH-B36476A2\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":2,\"success\":true,\"orderCode\":\"GJH-B36476A2\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "69000",
      "case": "BUY-baseline-ghn-stub",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "69000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/shipping-fee → HTTP 200
2. POST /api/orders/buy-now → HTTP 200
3. GET /api/orders/2 → HTTP 200
4. POST /api/payment/vnpay/create-url → HTTP 200
5. GET /api/payment/vnpay/ipn?vnp_Amount=6899999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2932&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B36476A2&vnp_SecureHash=1506c5b447d3da7b0649d6d1622fce4ef64f73df00de3a928d2a6bd66632bcb6ef42e49126e5277ca6fed29ee7366c4b8f3964e6d9b941317a1ab4041da459cf → HTTP 200
6. GET /api/payment/vnpay/ipn?vnp_Amount=6900001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2932&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B36476A2&vnp_SecureHash=ad49bc0845f87a22dd82819b8d8d7a92c0a845504565b9cf7f85fc8ed4658e4cf30c37d486be9940d2e151e0bb056607b4e45f8bf29dfaa17e897d7ca3300a62 → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=6900000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2932&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B36476A2&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
8. GET /api/payment/vnpay/return?vnp_Amount=6900000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2932&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B36476A2&vnp_SecureHash=3450b8a3b7bb2e65b491efa23c189f66b2c105f3a4c0e082d3742aff27a9a88a75b2254bc3dff40a388b67ec5fa6440bbc247b8c50bf3bb66042268433dbbf7a → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=6900000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2932&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B36476A2&vnp_SecureHash=3450b8a3b7bb2e65b491efa23c189f66b2c105f3a4c0e082d3742aff27a9a88a75b2254bc3dff40a388b67ec5fa6440bbc247b8c50bf3bb66042268433dbbf7a → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=6900000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2932&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B36476A2&vnp_SecureHash=3450b8a3b7bb2e65b491efa23c189f66b2c105f3a4c0e082d3742aff27a9a88a75b2254bc3dff40a388b67ec5fa6440bbc247b8c50bf3bb66042268433dbbf7a → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=6900000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2932&vnp_TransactionStatus=00&vnp_TxnRef=GJH-B36476A2&vnp_SecureHash=3450b8a3b7bb2e65b491efa23c189f66b2c105f3a4c0e082d3742aff27a9a88a75b2254bc3dff40a388b67ec5fa6440bbc247b8c50bf3bb66042268433dbbf7a → HTTP 200

### BUY-free-shipping — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "0.01",
    "shipping_fee": "0.00",
    "total_amount": "49999.99",
    "amount": "49999.99",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 3
  },
  "quantity": 1,
  "input": {
    "variantId": 4,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-free-shipping",
    "promoCode": "BVA_d80504c6"
  },
  "price": "50000",
  "expected": {
    "total": "49999.99",
    "subtotal": "50000",
    "discount": "0.01",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "0.01",
    "shipping_fee": "0.00",
    "total_amount": "49999.99",
    "amount": "49999.99",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 3
  },
  "before": {
    "orders": 2,
    "stock": 1000,
    "payments": 2
  },
  "actual": {
    "id": 3,
    "orderCode": "GJH-2E23A96B",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 0.01,
    "shippingFee": 0,
    "totalAmount": 49999.99,
    "promoCode": "BVA_D80504C6",
    "note": "QLPT-293 BUY-free-shipping",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 3,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 4,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:15.7772443",
    "createdAt": "2026-08-31T22:06:15.7782455",
    "updatedAt": "2026-08-31T22:06:15.7782455"
  },
  "id": "BUY-free-shipping",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_D80504C6\",\"endsAt\":\"2026-09-02T22:06:15.6926033\",\"freeShipping\":true,\"id\":1,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_d80504c6\",\"startsAt\":\"2026-08-30T22:06:15.6926033\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":0.01}"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "0.01",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "0.01"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0.01",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "response discount",
      "actual": "0.01"
    },
    {
      "expected": "0",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "49999.99",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "response total",
      "actual": "49999.99"
    },
    {
      "expected": "50000",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET /api/orders/3 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0.01",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "0.01"
    },
    {
      "expected": "0",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "49999.99",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "49999.99"
    },
    {
      "expected": "50000",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "0.01",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "0.01"
    },
    {
      "expected": "0",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "49999.99",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "49999.99"
    },
    {
      "expected": "49999.99",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "DB amount",
      "actual": "49999.99"
    },
    {
      "expected": "50000",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "4999999",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "4999999"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":3,\"success\":true,\"orderCode\":\"GJH-2E23A96B\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":3,\"success\":true,\"orderCode\":\"GJH-2E23A96B\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "49999.99",
      "case": "BUY-free-shipping",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "49999.99"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/3 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=4999998&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2933&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2E23A96B&vnp_SecureHash=b68c7c68b0658280736a06810bef99303777b72f2b2b34c7c7084ffce2fb08b6c132abcedfd62d941c36621d1c5f42beb8a6704e6e6e28339ad95d575cf96318 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=5000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2933&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2E23A96B&vnp_SecureHash=29f81b4000b62277baf6b33c94bd5e663f5ae75501ac9d27c9428a191e48df7d90b9bda02e6c61b2c268a91fa49bc0beb4b12920fa94d2101d2a0301bc8eeee9 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=4999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2933&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2E23A96B&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=4999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2933&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2E23A96B&vnp_SecureHash=52003e6105c976d1f442efdb27cbd1c784fd48d76fa788ffb485b28860fec75b04fd22ffda82558693673623fae84e0473b0411d6a160da2167b7dfbf02841f3 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=4999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2933&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2E23A96B&vnp_SecureHash=52003e6105c976d1f442efdb27cbd1c784fd48d76fa788ffb485b28860fec75b04fd22ffda82558693673623fae84e0473b0411d6a160da2167b7dfbf02841f3 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=4999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2933&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2E23A96B&vnp_SecureHash=52003e6105c976d1f442efdb27cbd1c784fd48d76fa788ffb485b28860fec75b04fd22ffda82558693673623fae84e0473b0411d6a160da2167b7dfbf02841f3 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=4999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2933&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2E23A96B&vnp_SecureHash=52003e6105c976d1f442efdb27cbd1c784fd48d76fa788ffb485b28860fec75b04fd22ffda82558693673623fae84e0473b0411d6a160da2167b7dfbf02841f3 → HTTP 200

### BUY-lower-plus-cent — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "49999.99",
    "shipping_fee": "0.00",
    "total_amount": "0.01",
    "amount": "0.01",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 4
  },
  "quantity": 1,
  "input": {
    "variantId": 5,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-lower-plus-cent",
    "promoCode": "BVA_bb7eb7ea"
  },
  "price": "50000",
  "expected": {
    "total": "0.01",
    "subtotal": "50000",
    "discount": "49999.99",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "49999.99",
    "shipping_fee": "0.00",
    "total_amount": "0.01",
    "amount": "0.01",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 4
  },
  "before": {
    "orders": 3,
    "stock": 1000,
    "payments": 3
  },
  "actual": {
    "id": 4,
    "orderCode": "GJH-8C682955",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 49999.99,
    "shippingFee": 0,
    "totalAmount": 0.01,
    "promoCode": "BVA_BB7EB7EA",
    "note": "QLPT-293 BUY-lower-plus-cent",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 4,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 5,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:15.9217588",
    "createdAt": "2026-08-31T22:06:15.9227606",
    "updatedAt": "2026-08-31T22:06:15.9227606"
  },
  "id": "BUY-lower-plus-cent",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_BB7EB7EA\",\"endsAt\":\"2026-09-02T22:06:15.8794013\",\"freeShipping\":true,\"id\":2,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_bb7eb7ea\",\"startsAt\":\"2026-08-30T22:06:15.8794013\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":49999.99}"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "49999.99",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "49999.99"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "49999.99",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "response discount",
      "actual": "49999.99"
    },
    {
      "expected": "0",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "0.01",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "response total",
      "actual": "0.01"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/orders/4 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "49999.99",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "49999.99"
    },
    {
      "expected": "0",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "0.01",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "0.01"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "49999.99",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "49999.99"
    },
    {
      "expected": "0",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "0.01",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "0.01"
    },
    {
      "expected": "0.01",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "DB amount",
      "actual": "0.01"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "1",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "1"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":4,\"success\":true,\"orderCode\":\"GJH-8C682955\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":4,\"success\":true,\"orderCode\":\"GJH-8C682955\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "0.01",
      "case": "BUY-lower-plus-cent",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "0.01"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/4 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2934&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8C682955&vnp_SecureHash=032d013515cfb0a5eafc8115c33c0a7af081a0291b7915a475fe77205bd10458c458a656b8f3c6967a6b41d73be73fb147dab0599715a4b31440fd2d81e1dd50 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=2&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2934&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8C682955&vnp_SecureHash=03f192a1831d4e63c851c4896e165c6a9eb737c4c16a942896c9c4620a2f79b0d60596040988e0ab4f4dc1cbead2118d09de472d4b725139448bb5dc00c65c3e → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=1&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2934&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8C682955&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=1&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2934&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8C682955&vnp_SecureHash=1b2ddc6ab411cb80bc80c2d17e891d7d45946b7bd815018a1b8d64429298b45c1632fd04e6220449806edbd38bfcba6e11ba5578800590b53f623ef0f58cfb1d → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=1&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2934&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8C682955&vnp_SecureHash=1b2ddc6ab411cb80bc80c2d17e891d7d45946b7bd815018a1b8d64429298b45c1632fd04e6220449806edbd38bfcba6e11ba5578800590b53f623ef0f58cfb1d → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=1&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2934&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8C682955&vnp_SecureHash=1b2ddc6ab411cb80bc80c2d17e891d7d45946b7bd815018a1b8d64429298b45c1632fd04e6220449806edbd38bfcba6e11ba5578800590b53f623ef0f58cfb1d → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=1&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2934&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8C682955&vnp_SecureHash=1b2ddc6ab411cb80bc80c2d17e891d7d45946b7bd815018a1b8d64429298b45c1632fd04e6220449806edbd38bfcba6e11ba5578800590b53f623ef0f58cfb1d → HTTP 200

### BUY-lower-zero — Fail

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 5
  },
  "quantity": 1,
  "input": {
    "variantId": 6,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-lower-zero",
    "promoCode": "BVA_3b64f248"
  },
  "price": "50000",
  "expected": {
    "total": "0",
    "subtotal": "50000",
    "discount": "50000",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 5
  },
  "before": {
    "orders": 4,
    "stock": 1000,
    "payments": 4
  },
  "actual": {
    "id": 5,
    "orderCode": "GJH-4A71C839",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 50000.0,
    "shippingFee": 0,
    "totalAmount": 0,
    "promoCode": "BVA_3B64F248",
    "note": "QLPT-293 BUY-lower-zero",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 5,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 6,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:16.079505",
    "createdAt": "2026-08-31T22:06:16.0805012",
    "updatedAt": "2026-08-31T22:06:16.0805012"
  },
  "id": "BUY-lower-zero",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Fail",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_3B64F248\",\"endsAt\":\"2026-09-02T22:06:16.0299644\",\"freeShipping\":true,\"id\":3,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_3b64f248\",\"startsAt\":\"2026-08-30T22:06:16.0289632\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":50000}"
    },
    {
      "expected": 200,
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5E+4"
    },
    {
      "expected": 200,
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "response discount",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "response total",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "GET /api/orders/5 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "5E+4",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "50000.00"
    },
    {
      "expected": "0",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "DB amount",
      "actual": "0.00"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "0",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "0"
    },
    {
      "expected": 200,
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-lower-zero",
      "status": "Fail",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-lower-zero",
      "status": "Fail",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":5,\"success\":false,\"orderCode\":\"GJH-4A71C839\",\"message\":\"Thanh toán thất bại hoặc dữ liệu không hợp lệ\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": "0",
      "case": "BUY-lower-zero",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "0.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/5 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2935&vnp_TransactionStatus=00&vnp_TxnRef=GJH-4A71C839&vnp_SecureHash=c49097e1c9cd142140ca93b28f699980cf005c92c35ee502fb233e75499258f0fb92fdb1683f35eb0daa58a4823bc34162329014bdea4f09dade371550eae0fa → HTTP 200
8. GET /api/payment/vnpay/return?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2935&vnp_TransactionStatus=00&vnp_TxnRef=GJH-4A71C839&vnp_SecureHash=c49097e1c9cd142140ca93b28f699980cf005c92c35ee502fb233e75499258f0fb92fdb1683f35eb0daa58a4823bc34162329014bdea4f09dade371550eae0fa → HTTP 200

### BUY-lower-minus-candidate-clamped — Fail

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 6
  },
  "quantity": 1,
  "input": {
    "variantId": 7,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-lower-minus-candidate-clamped",
    "promoCode": "BVA_13883794"
  },
  "price": "50000",
  "expected": {
    "total": "0",
    "subtotal": "50000",
    "discount": "50000",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 6
  },
  "before": {
    "orders": 5,
    "stock": 1000,
    "payments": 5
  },
  "actual": {
    "id": 6,
    "orderCode": "GJH-68CDAAEF",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 50000.0,
    "shippingFee": 0,
    "totalAmount": 0,
    "promoCode": "BVA_13883794",
    "note": "QLPT-293 BUY-lower-minus-candidate-clamped",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 6,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 7,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:16.169393",
    "createdAt": "2026-08-31T22:06:16.1703923",
    "updatedAt": "2026-08-31T22:06:16.1703923"
  },
  "id": "BUY-lower-minus-candidate-clamped",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Fail",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_13883794\",\"endsAt\":\"2026-09-02T22:06:16.1304702\",\"freeShipping\":true,\"id\":4,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_13883794\",\"startsAt\":\"2026-08-30T22:06:16.1304702\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":50000.01}"
    },
    {
      "expected": 200,
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5E+4"
    },
    {
      "expected": 200,
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "response discount",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "response total",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET /api/orders/6 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "5E+4",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "50000.00"
    },
    {
      "expected": "0",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB amount",
      "actual": "0.00"
    },
    {
      "expected": "50000",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "0",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "0"
    },
    {
      "expected": 200,
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Fail",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Fail",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":6,\"success\":false,\"orderCode\":\"GJH-68CDAAEF\",\"message\":\"Thanh toán thất bại hoặc dữ liệu không hợp lệ\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": "0",
      "case": "BUY-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "0.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/6 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2936&vnp_TransactionStatus=00&vnp_TxnRef=GJH-68CDAAEF&vnp_SecureHash=5bf4290deb5dffc8e1e16fda8e1e15d9f752a868288e8bd72931001d469ba2d99e1e516364710a50350f384f0f78b1ce1ad2cf867827d2c7aed49c73bab4947b → HTTP 200
8. GET /api/payment/vnpay/return?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2936&vnp_TransactionStatus=00&vnp_TxnRef=GJH-68CDAAEF&vnp_SecureHash=5bf4290deb5dffc8e1e16fda8e1e15d9f752a868288e8bd72931001d469ba2d99e1e516364710a50350f384f0f78b1ce1ad2cf867827d2c7aed49c73bab4947b → HTTP 200

### BUY-discount-below-subtotal-with-fee — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "49999.99",
    "shipping_fee": "30000.00",
    "total_amount": "30000.01",
    "amount": "30000.01",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 7
  },
  "quantity": 1,
  "input": {
    "variantId": 8,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-discount-below-subtotal-with-fee",
    "promoCode": "BVA_9ce68395"
  },
  "price": "50000",
  "expected": {
    "total": "30000.01",
    "subtotal": "50000",
    "discount": "49999.99",
    "shipping": "30000"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "49999.99",
    "shipping_fee": "30000.00",
    "total_amount": "30000.01",
    "amount": "30000.01",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 7
  },
  "before": {
    "orders": 6,
    "stock": 1000,
    "payments": 6
  },
  "actual": {
    "id": 7,
    "orderCode": "GJH-57EC913E",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 49999.99,
    "shippingFee": 30000,
    "totalAmount": 30000.01,
    "promoCode": "BVA_9CE68395",
    "note": "QLPT-293 BUY-discount-below-subtotal-with-fee",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 7,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 8,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:16.2623813",
    "createdAt": "2026-08-31T22:06:16.2634007",
    "updatedAt": "2026-08-31T22:06:16.2634007"
  },
  "id": "BUY-discount-below-subtotal-with-fee",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_9CE68395\",\"endsAt\":\"2026-09-02T22:06:16.2226051\",\"freeShipping\":false,\"id\":5,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_9ce68395\",\"startsAt\":\"2026-08-30T22:06:16.2226051\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":49999.99}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "49999.99",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "49999.99"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "49999.99",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "response discount",
      "actual": "49999.99"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "response shipping",
      "actual": "30000"
    },
    {
      "expected": "30000.01",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "response total",
      "actual": "30000.01"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/orders/7 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "49999.99",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "49999.99"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "3E+4"
    },
    {
      "expected": "30000.01",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "30000.01"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "49999.99",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "49999.99"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "30000.00"
    },
    {
      "expected": "30000.01",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "30000.01"
    },
    {
      "expected": "30000.01",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB amount",
      "actual": "30000.01"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "3000001",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "3000001"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":7,\"success\":true,\"orderCode\":\"GJH-57EC913E\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":7,\"success\":true,\"orderCode\":\"GJH-57EC913E\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "30000.01",
      "case": "BUY-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "30000.01"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/7 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2937&vnp_TransactionStatus=00&vnp_TxnRef=GJH-57EC913E&vnp_SecureHash=580920fef58e876eb6961496beeb27d641241404a16c33cd344fba75c458b7785a93f68fc3eb0093bbff1fd5aac896db619c41c843459eade7b4b2092b252e89 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=3000002&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2937&vnp_TransactionStatus=00&vnp_TxnRef=GJH-57EC913E&vnp_SecureHash=a3d7b6c6a9e69440c0e6a0c9931e2773e25f1027f70b995a43ae1c50fa15fb1bf7b6b5e2c8f01db5af152ba5042477d6b925cf4afaf783dde596083e1f8a0b47 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2937&vnp_TransactionStatus=00&vnp_TxnRef=GJH-57EC913E&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2937&vnp_TransactionStatus=00&vnp_TxnRef=GJH-57EC913E&vnp_SecureHash=deac40131a502e6d333c5680300fcdd268c466b59682adb9af8e91bc8056d124947b0a0e23f150ee14e66b65a2ac188db59451e471d0f3d8b232d16154d755fa → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2937&vnp_TransactionStatus=00&vnp_TxnRef=GJH-57EC913E&vnp_SecureHash=deac40131a502e6d333c5680300fcdd268c466b59682adb9af8e91bc8056d124947b0a0e23f150ee14e66b65a2ac188db59451e471d0f3d8b232d16154d755fa → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2937&vnp_TransactionStatus=00&vnp_TxnRef=GJH-57EC913E&vnp_SecureHash=deac40131a502e6d333c5680300fcdd268c466b59682adb9af8e91bc8056d124947b0a0e23f150ee14e66b65a2ac188db59451e471d0f3d8b232d16154d755fa → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2937&vnp_TransactionStatus=00&vnp_TxnRef=GJH-57EC913E&vnp_SecureHash=deac40131a502e6d333c5680300fcdd268c466b59682adb9af8e91bc8056d124947b0a0e23f150ee14e66b65a2ac188db59451e471d0f3d8b232d16154d755fa → HTTP 200

### BUY-discount-equal-subtotal-with-fee — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "30000.00",
    "total_amount": "30000.00",
    "amount": "30000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 8
  },
  "quantity": 1,
  "input": {
    "variantId": 9,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-discount-equal-subtotal-with-fee",
    "promoCode": "BVA_ddbdca96"
  },
  "price": "50000",
  "expected": {
    "total": "30000",
    "subtotal": "50000",
    "discount": "50000",
    "shipping": "30000"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "30000.00",
    "total_amount": "30000.00",
    "amount": "30000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 8
  },
  "before": {
    "orders": 7,
    "stock": 1000,
    "payments": 7
  },
  "actual": {
    "id": 8,
    "orderCode": "GJH-5DBC8504",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 50000.0,
    "shippingFee": 30000,
    "totalAmount": 30000.0,
    "promoCode": "BVA_DDBDCA96",
    "note": "QLPT-293 BUY-discount-equal-subtotal-with-fee",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 8,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 9,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:16.391367",
    "createdAt": "2026-08-31T22:06:16.3923838",
    "updatedAt": "2026-08-31T22:06:16.3923838"
  },
  "id": "BUY-discount-equal-subtotal-with-fee",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_DDBDCA96\",\"endsAt\":\"2026-09-02T22:06:16.3521331\",\"freeShipping\":false,\"id\":6,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_ddbdca96\",\"startsAt\":\"2026-08-30T22:06:16.3521331\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":50000}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5E+4"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "response discount",
      "actual": "5E+4"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "response shipping",
      "actual": "30000"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "response total",
      "actual": "3E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/orders/8 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "5E+4",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+4"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "3E+4"
    },
    {
      "expected": "3E+4",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "3E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "50000.00"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "30000.00"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "30000.00"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB amount",
      "actual": "30000.00"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "3000000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "3000000"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":8,\"success\":true,\"orderCode\":\"GJH-5DBC8504\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":8,\"success\":true,\"orderCode\":\"GJH-5DBC8504\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "30000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/8 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=2999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2938&vnp_TransactionStatus=00&vnp_TxnRef=GJH-5DBC8504&vnp_SecureHash=c1eb3311728d524b62e97522c119d5035768708b2208465c9caad2f3463fefe5cfb1e72ac7140605d87ff15086ef2c4977874524614b7b8b784cbce7fbb0ced7 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2938&vnp_TransactionStatus=00&vnp_TxnRef=GJH-5DBC8504&vnp_SecureHash=9b8c0e3ce4125943fc922ab8bc58ff54f1acd9e3422185524e1f30eaafa36f448057d1f0ce1a730378dc34a654c05a9b1522f01812174fac30b909d90f4fb224 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2938&vnp_TransactionStatus=00&vnp_TxnRef=GJH-5DBC8504&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2938&vnp_TransactionStatus=00&vnp_TxnRef=GJH-5DBC8504&vnp_SecureHash=692901b575c04a9490aa83d336b31541fe196f6dec568998ae3bfe45aeed903373c29e7e646f0a190aa17b95c6f8a0bc825b3a1351ead113f24071cfefbf403c → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2938&vnp_TransactionStatus=00&vnp_TxnRef=GJH-5DBC8504&vnp_SecureHash=692901b575c04a9490aa83d336b31541fe196f6dec568998ae3bfe45aeed903373c29e7e646f0a190aa17b95c6f8a0bc825b3a1351ead113f24071cfefbf403c → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2938&vnp_TransactionStatus=00&vnp_TxnRef=GJH-5DBC8504&vnp_SecureHash=692901b575c04a9490aa83d336b31541fe196f6dec568998ae3bfe45aeed903373c29e7e646f0a190aa17b95c6f8a0bc825b3a1351ead113f24071cfefbf403c → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2938&vnp_TransactionStatus=00&vnp_TxnRef=GJH-5DBC8504&vnp_SecureHash=692901b575c04a9490aa83d336b31541fe196f6dec568998ae3bfe45aeed903373c29e7e646f0a190aa17b95c6f8a0bc825b3a1351ead113f24071cfefbf403c → HTTP 200

### BUY-discount-above-subtotal-with-fee — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "30000.00",
    "total_amount": "30000.00",
    "amount": "30000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 9
  },
  "quantity": 1,
  "input": {
    "variantId": 10,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-discount-above-subtotal-with-fee",
    "promoCode": "BVA_04175cab"
  },
  "price": "50000",
  "expected": {
    "total": "30000",
    "subtotal": "50000",
    "discount": "50000",
    "shipping": "30000"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "30000.00",
    "total_amount": "30000.00",
    "amount": "30000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 9
  },
  "before": {
    "orders": 8,
    "stock": 1000,
    "payments": 8
  },
  "actual": {
    "id": 9,
    "orderCode": "GJH-A278C1CF",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 50000.0,
    "shippingFee": 30000,
    "totalAmount": 30000.0,
    "promoCode": "BVA_04175CAB",
    "note": "QLPT-293 BUY-discount-above-subtotal-with-fee",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 9,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 10,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:16.5259759",
    "createdAt": "2026-08-31T22:06:16.5279749",
    "updatedAt": "2026-08-31T22:06:16.5279749"
  },
  "id": "BUY-discount-above-subtotal-with-fee",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_04175CAB\",\"endsAt\":\"2026-09-02T22:06:16.4861389\",\"freeShipping\":false,\"id\":7,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_04175cab\",\"startsAt\":\"2026-08-30T22:06:16.4861389\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":50000.01}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5E+4"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "response discount",
      "actual": "5E+4"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "response shipping",
      "actual": "30000"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "response total",
      "actual": "3E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/orders/9 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "5E+4",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+4"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "3E+4"
    },
    {
      "expected": "3E+4",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "3E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "50000.00"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "30000.00"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "30000.00"
    },
    {
      "expected": "30000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB amount",
      "actual": "30000.00"
    },
    {
      "expected": "50000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "3000000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "3000000"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":9,\"success\":true,\"orderCode\":\"GJH-A278C1CF\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":9,\"success\":true,\"orderCode\":\"GJH-A278C1CF\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "30000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/9 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=2999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2939&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A278C1CF&vnp_SecureHash=c19884b1439f0b65721ce77ed021a4c5135bdc0de34be676294109e39076b1c0b608c78339a35d409668c6977d7c4aaf6047479a556b859aff6e473f90b881c8 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2939&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A278C1CF&vnp_SecureHash=c4962ec87d6a7076771c168fc0c457da14eae4091f12364331e9a2c807a864df7397384ad88eadaa8cc6b12a6ae43cd0645cad898ed1271cdb935e0dfc60c3d9 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2939&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A278C1CF&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2939&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A278C1CF&vnp_SecureHash=ba7eec50040a225f561496fe47a530d1f16de050ddc6f25cb12c10adcded3c0e50b2c75ffb5fa05a2f9fecfdbb6f21b55f136efc3c0f61aec5a58c1cbd9562d7 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2939&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A278C1CF&vnp_SecureHash=ba7eec50040a225f561496fe47a530d1f16de050ddc6f25cb12c10adcded3c0e50b2c75ffb5fa05a2f9fecfdbb6f21b55f136efc3c0f61aec5a58c1cbd9562d7 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2939&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A278C1CF&vnp_SecureHash=ba7eec50040a225f561496fe47a530d1f16de050ddc6f25cb12c10adcded3c0e50b2c75ffb5fa05a2f9fecfdbb6f21b55f136efc3c0f61aec5a58c1cbd9562d7 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=2939&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A278C1CF&vnp_SecureHash=ba7eec50040a225f561496fe47a530d1f16de050ddc6f25cb12c10adcded3c0e50b2c75ffb5fa05a2f9fecfdbb6f21b55f136efc3c0f61aec5a58c1cbd9562d7 → HTTP 200

### BUY-percent-floor-below — Pass

Unit price: 50009.99; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50009.99",
    "discount_amount": "5000.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.99",
    "amount": "45009.99",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50009.99",
    "orderId": 10
  },
  "quantity": 1,
  "input": {
    "variantId": 11,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-percent-floor-below",
    "promoCode": "BVA_468b76bb"
  },
  "price": "50009.99",
  "expected": {
    "total": "45009.99",
    "subtotal": "50009.99",
    "discount": "5000",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50009.99",
    "discount_amount": "5000.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.99",
    "amount": "45009.99",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50009.99",
    "orderId": 10
  },
  "before": {
    "orders": 9,
    "stock": 1000,
    "payments": 9
  },
  "actual": {
    "id": 10,
    "orderCode": "GJH-88033543",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50009.99,
    "discountAmount": 5000,
    "shippingFee": 0,
    "totalAmount": 45009.99,
    "promoCode": "BVA_468B76BB",
    "note": "QLPT-293 BUY-percent-floor-below",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 10,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 11,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50009.99,
        "quantity": 1,
        "subtotal": 50009.99,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:16.6516468",
    "createdAt": "2026-08-31T22:06:16.6529102",
    "updatedAt": "2026-08-31T22:06:16.6529102"
  },
  "id": "BUY-percent-floor-below",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_468B76BB\",\"endsAt\":\"2026-09-02T22:06:16.6171301\",\"freeShipping\":true,\"id\":8,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_468b76bb\",\"startsAt\":\"2026-08-30T22:06:16.6171301\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"PERCENT\",\"usedCount\":0,\"value\":10}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "5000",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5000"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50009.99",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "50009.99"
    },
    {
      "expected": "5000",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "response discount",
      "actual": "5000"
    },
    {
      "expected": "0",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "45009.99",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "response total",
      "actual": "45009.99"
    },
    {
      "expected": "50009.99",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50009.99"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/orders/10 status",
      "actual": 200
    },
    {
      "expected": "50009.99",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "50009.99"
    },
    {
      "expected": "5000",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+3"
    },
    {
      "expected": "0",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "45009.99",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "45009.99"
    },
    {
      "expected": "50009.99",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50009.99"
    },
    {
      "expected": "5000",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "5000.00"
    },
    {
      "expected": "0",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "45009.99",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "45009.99"
    },
    {
      "expected": "45009.99",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "DB amount",
      "actual": "45009.99"
    },
    {
      "expected": "50009.99",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50009.99"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "4500999",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "4500999"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":10,\"success\":true,\"orderCode\":\"GJH-88033543\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":10,\"success\":true,\"orderCode\":\"GJH-88033543\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "45009.99",
      "case": "BUY-percent-floor-below",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "45009.99"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/10 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=4500998&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29310&vnp_TransactionStatus=00&vnp_TxnRef=GJH-88033543&vnp_SecureHash=449fd1bc10aad0f0c1a46634e76b00d337fb3bfe264728760f2981759d85e071b3e8f12d2ecdf29f95a34047f83e5268fc19145bf217cc67c7e819e85dbeecd3 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=4501000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29310&vnp_TransactionStatus=00&vnp_TxnRef=GJH-88033543&vnp_SecureHash=ce84057246aa305cc8911be5c7081a351346016af36e07a1283d184b892bfdcd6bb25f16a53f501cb84c15162d443f5cdc7a748f399de4118237acb86b1fd651 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=4500999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29310&vnp_TransactionStatus=00&vnp_TxnRef=GJH-88033543&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=4500999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29310&vnp_TransactionStatus=00&vnp_TxnRef=GJH-88033543&vnp_SecureHash=972f04ac0baee73986083ec94441e5ad44bb9724b8cafbad74b047def243f613b2df2c0dbe5def09fa75c3c0b1b0b07d24d48d6699e20ecb984bce6cda606828 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=4500999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29310&vnp_TransactionStatus=00&vnp_TxnRef=GJH-88033543&vnp_SecureHash=972f04ac0baee73986083ec94441e5ad44bb9724b8cafbad74b047def243f613b2df2c0dbe5def09fa75c3c0b1b0b07d24d48d6699e20ecb984bce6cda606828 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=4500999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29310&vnp_TransactionStatus=00&vnp_TxnRef=GJH-88033543&vnp_SecureHash=972f04ac0baee73986083ec94441e5ad44bb9724b8cafbad74b047def243f613b2df2c0dbe5def09fa75c3c0b1b0b07d24d48d6699e20ecb984bce6cda606828 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=4500999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29310&vnp_TransactionStatus=00&vnp_TxnRef=GJH-88033543&vnp_SecureHash=972f04ac0baee73986083ec94441e5ad44bb9724b8cafbad74b047def243f613b2df2c0dbe5def09fa75c3c0b1b0b07d24d48d6699e20ecb984bce6cda606828 → HTTP 200

### BUY-percent-floor-at — Pass

Unit price: 50010.00; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50010.00",
    "discount_amount": "5001.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.00",
    "amount": "45009.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50010.00",
    "orderId": 11
  },
  "quantity": 1,
  "input": {
    "variantId": 12,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-percent-floor-at",
    "promoCode": "BVA_36134915"
  },
  "price": "50010.00",
  "expected": {
    "total": "45009",
    "subtotal": "50010.00",
    "discount": "5001",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50010.00",
    "discount_amount": "5001.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.00",
    "amount": "45009.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50010.00",
    "orderId": 11
  },
  "before": {
    "orders": 10,
    "stock": 1000,
    "payments": 10
  },
  "actual": {
    "id": 11,
    "orderCode": "GJH-A9E59C71",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50010.0,
    "discountAmount": 5001,
    "shippingFee": 0,
    "totalAmount": 45009,
    "promoCode": "BVA_36134915",
    "note": "QLPT-293 BUY-percent-floor-at",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 11,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 12,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50010.0,
        "quantity": 1,
        "subtotal": 50010.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:16.7641705",
    "createdAt": "2026-08-31T22:06:16.765172",
    "updatedAt": "2026-08-31T22:06:16.765172"
  },
  "id": "BUY-percent-floor-at",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_36134915\",\"endsAt\":\"2026-09-02T22:06:16.7307573\",\"freeShipping\":true,\"id\":9,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_36134915\",\"startsAt\":\"2026-08-30T22:06:16.7307573\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"PERCENT\",\"usedCount\":0,\"value\":10}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "5001",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5001"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50010.00",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5.001E+4"
    },
    {
      "expected": "5001",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "response discount",
      "actual": "5001"
    },
    {
      "expected": "0",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "45009",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "response total",
      "actual": "45009"
    },
    {
      "expected": "50010.00",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50010"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/orders/11 status",
      "actual": 200
    },
    {
      "expected": "5.001E+4",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5.001E+4"
    },
    {
      "expected": "5001",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5001"
    },
    {
      "expected": "0",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "45009",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "45009"
    },
    {
      "expected": "50010.00",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50010.00"
    },
    {
      "expected": "5001",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "5001.00"
    },
    {
      "expected": "0",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "45009",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "45009.00"
    },
    {
      "expected": "45009",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "DB amount",
      "actual": "45009.00"
    },
    {
      "expected": "50010.00",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50010.00"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "4500900",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "4500900"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":11,\"success\":true,\"orderCode\":\"GJH-A9E59C71\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":11,\"success\":true,\"orderCode\":\"GJH-A9E59C71\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "45009",
      "case": "BUY-percent-floor-at",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "45009.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/11 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=4500899&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29311&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A9E59C71&vnp_SecureHash=c0ebe12e8e92cc09350dc2f668a93b3f5396b162b106abacda5f945bc0f0e223a2974efeb5b016d78336de5543c7b909592d5ba9785f12a4931eeeff783428f1 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29311&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A9E59C71&vnp_SecureHash=7a765d18ffd8a88b7c91b99f08b390a3e4e826dfd529eb8b0e233acdf02bd572f58fa6bd5d12e6033964360a95331aeac761da9d7c7e64c8b4a58bc4e58d8868 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29311&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A9E59C71&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29311&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A9E59C71&vnp_SecureHash=165ed17dde92e6a750a69423391375a08f2e8048af1fafd24109a991378d64665443ebd0b3f6422bc76efb48213e1249f17a6738aeb01c82b7ed850137d7a008 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29311&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A9E59C71&vnp_SecureHash=165ed17dde92e6a750a69423391375a08f2e8048af1fafd24109a991378d64665443ebd0b3f6422bc76efb48213e1249f17a6738aeb01c82b7ed850137d7a008 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29311&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A9E59C71&vnp_SecureHash=165ed17dde92e6a750a69423391375a08f2e8048af1fafd24109a991378d64665443ebd0b3f6422bc76efb48213e1249f17a6738aeb01c82b7ed850137d7a008 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29311&vnp_TransactionStatus=00&vnp_TxnRef=GJH-A9E59C71&vnp_SecureHash=165ed17dde92e6a750a69423391375a08f2e8048af1fafd24109a991378d64665443ebd0b3f6422bc76efb48213e1249f17a6738aeb01c82b7ed850137d7a008 → HTTP 200

### BUY-percent-floor-above — Pass

Unit price: 50010.01; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50010.01",
    "discount_amount": "5001.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.01",
    "amount": "45009.01",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50010.01",
    "orderId": 12
  },
  "quantity": 1,
  "input": {
    "variantId": 13,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-percent-floor-above",
    "promoCode": "BVA_46e15bf4"
  },
  "price": "50010.01",
  "expected": {
    "total": "45009.01",
    "subtotal": "50010.01",
    "discount": "5001",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50010.01",
    "discount_amount": "5001.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.01",
    "amount": "45009.01",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50010.01",
    "orderId": 12
  },
  "before": {
    "orders": 11,
    "stock": 1000,
    "payments": 11
  },
  "actual": {
    "id": 12,
    "orderCode": "GJH-FF733148",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50010.01,
    "discountAmount": 5001,
    "shippingFee": 0,
    "totalAmount": 45009.01,
    "promoCode": "BVA_46E15BF4",
    "note": "QLPT-293 BUY-percent-floor-above",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 12,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 13,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50010.01,
        "quantity": 1,
        "subtotal": 50010.01,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:16.8808704",
    "createdAt": "2026-08-31T22:06:16.8829934",
    "updatedAt": "2026-08-31T22:06:16.8829934"
  },
  "id": "BUY-percent-floor-above",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_46E15BF4\",\"endsAt\":\"2026-09-02T22:06:16.8455818\",\"freeShipping\":true,\"id\":10,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_46e15bf4\",\"startsAt\":\"2026-08-30T22:06:16.8445821\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"PERCENT\",\"usedCount\":0,\"value\":10}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "5001",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5001"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50010.01",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "50010.01"
    },
    {
      "expected": "5001",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "response discount",
      "actual": "5001"
    },
    {
      "expected": "0",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "45009.01",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "response total",
      "actual": "45009.01"
    },
    {
      "expected": "50010.01",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50010.01"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/orders/12 status",
      "actual": 200
    },
    {
      "expected": "50010.01",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "50010.01"
    },
    {
      "expected": "5001",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5001"
    },
    {
      "expected": "0",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "45009.01",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "45009.01"
    },
    {
      "expected": "50010.01",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50010.01"
    },
    {
      "expected": "5001",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "5001.00"
    },
    {
      "expected": "0",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "45009.01",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "45009.01"
    },
    {
      "expected": "45009.01",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "DB amount",
      "actual": "45009.01"
    },
    {
      "expected": "50010.01",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50010.01"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "4500901",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "4500901"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":12,\"success\":true,\"orderCode\":\"GJH-FF733148\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":12,\"success\":true,\"orderCode\":\"GJH-FF733148\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "45009.01",
      "case": "BUY-percent-floor-above",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "45009.01"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/12 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29312&vnp_TransactionStatus=00&vnp_TxnRef=GJH-FF733148&vnp_SecureHash=395305cfb0f9f751cfc829e6cafbb14268dad02a6d1f0ee1b9e463873a7bce2b349ba2ab2a9925831cdaf004b7158dfa69c1f9959b7d153fd49ab3956d0fe74c → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=4500902&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29312&vnp_TransactionStatus=00&vnp_TxnRef=GJH-FF733148&vnp_SecureHash=73ad95c90869204ed5203e4b6713638905b887263d1842d4c7d5a42f23d7855d5fbd4d2eff7126e9a5656f9275496a394f45fc97ff7e29565773c3704d187df4 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29312&vnp_TransactionStatus=00&vnp_TxnRef=GJH-FF733148&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29312&vnp_TransactionStatus=00&vnp_TxnRef=GJH-FF733148&vnp_SecureHash=f832c0f9b64fbf72176ecc1ca5b0743787a208d7e39fa5067880ed9e651bcad7be2cbc5850b86045d7ba78bf1759f64a3eb0cf7d3fdbcfb924f28b166a2e1004 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29312&vnp_TransactionStatus=00&vnp_TxnRef=GJH-FF733148&vnp_SecureHash=f832c0f9b64fbf72176ecc1ca5b0743787a208d7e39fa5067880ed9e651bcad7be2cbc5850b86045d7ba78bf1759f64a3eb0cf7d3fdbcfb924f28b166a2e1004 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29312&vnp_TransactionStatus=00&vnp_TxnRef=GJH-FF733148&vnp_SecureHash=f832c0f9b64fbf72176ecc1ca5b0743787a208d7e39fa5067880ed9e651bcad7be2cbc5850b86045d7ba78bf1759f64a3eb0cf7d3fdbcfb924f28b166a2e1004 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29312&vnp_TransactionStatus=00&vnp_TxnRef=GJH-FF733148&vnp_SecureHash=f832c0f9b64fbf72176ecc1ca5b0743787a208d7e39fa5067880ed9e651bcad7be2cbc5850b86045d7ba78bf1759f64a3eb0cf7d3fdbcfb924f28b166a2e1004 → HTTP 200

### BUY-percent-100 — Fail

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 13
  },
  "quantity": 1,
  "input": {
    "variantId": 14,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 BUY-percent-100",
    "promoCode": "BVA_51c564a4"
  },
  "price": "50000",
  "expected": {
    "total": "0",
    "subtotal": "50000",
    "discount": "50000",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 13
  },
  "before": {
    "orders": 12,
    "stock": 1000,
    "payments": 12
  },
  "actual": {
    "id": 13,
    "orderCode": "GJH-9111C060",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 50000,
    "shippingFee": 0,
    "totalAmount": 0,
    "promoCode": "BVA_51C564A4",
    "note": "QLPT-293 BUY-percent-100",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 13,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 14,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:16.9912725",
    "createdAt": "2026-08-31T22:06:16.9926339",
    "updatedAt": "2026-08-31T22:06:16.9926339"
  },
  "id": "BUY-percent-100",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Fail",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_51C564A4\",\"endsAt\":\"2026-09-02T22:06:16.9572284\",\"freeShipping\":true,\"id\":11,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_51c564a4\",\"startsAt\":\"2026-08-30T22:06:16.9572284\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"PERCENT\",\"usedCount\":0,\"value\":100}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "response discount",
      "actual": "50000"
    },
    {
      "expected": "0",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "response total",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "GET /api/orders/13 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "50000",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "50000.00"
    },
    {
      "expected": "0",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "DB amount",
      "actual": "0.00"
    },
    {
      "expected": "50000",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "0",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "0"
    },
    {
      "expected": 200,
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "BUY-percent-100",
      "status": "Fail",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "BUY-percent-100",
      "status": "Fail",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":13,\"success\":false,\"orderCode\":\"GJH-9111C060\",\"message\":\"Thanh toán thất bại hoặc dữ liệu không hợp lệ\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": "0",
      "case": "BUY-percent-100",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "0.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders/buy-now → HTTP 200
5. GET /api/orders/13 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29313&vnp_TransactionStatus=00&vnp_TxnRef=GJH-9111C060&vnp_SecureHash=fb25bef7ade6b12b75183a4601fac28fec08407d636ab3aa07b2d067bbca957ad472df6df526d7f5d7f986df51718ef1f5e5dd5626783382bc5fa0ebcf5f8c87 → HTTP 200
8. GET /api/payment/vnpay/return?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29313&vnp_TransactionStatus=00&vnp_TxnRef=GJH-9111C060&vnp_SecureHash=fb25bef7ade6b12b75183a4601fac28fec08407d636ab3aa07b2d067bbca957ad472df6df526d7f5d7f986df51718ef1f5e5dd5626783382bc5fa0ebcf5f8c87 → HTTP 200

### CART-baseline-fallback — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 14
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      1
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-baseline-fallback"
  },
  "price": "50000",
  "expected": {
    "total": "80000",
    "subtotal": "50000",
    "discount": "0",
    "shipping": "30000"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 14
  },
  "before": {
    "orders": 13,
    "stock": 1000,
    "payments": 13
  },
  "actual": {
    "id": 14,
    "orderCode": "GJH-6CCC1ADC",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 0,
    "shippingFee": 30000,
    "totalAmount": 80000.0,
    "promoCode": null,
    "note": "QLPT-293 CART-baseline-fallback",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 14,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 15,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.0709023",
    "createdAt": "2026-08-31T22:06:17.0719041",
    "updatedAt": "2026-08-31T22:06:17.0719041"
  },
  "id": "CART-baseline-fallback",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "response discount",
      "actual": "0"
    },
    {
      "expected": "30000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "response shipping",
      "actual": "30000"
    },
    {
      "expected": "80000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "response total",
      "actual": "8E+4"
    },
    {
      "expected": "50000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/orders/14 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "0"
    },
    {
      "expected": "30000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "3E+4"
    },
    {
      "expected": "8E+4",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "8E+4"
    },
    {
      "expected": "50000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "0",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "0.00"
    },
    {
      "expected": "30000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "30000.00"
    },
    {
      "expected": "80000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "80000.00"
    },
    {
      "expected": "80000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "DB amount",
      "actual": "80000.00"
    },
    {
      "expected": "50000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "8000000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "8000000"
    },
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":14,\"success\":true,\"orderCode\":\"GJH-6CCC1ADC\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":14,\"success\":true,\"orderCode\":\"GJH-6CCC1ADC\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "80000",
      "case": "CART-baseline-fallback",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "80000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/shipping-fee → HTTP 200
2. POST /api/orders → HTTP 200
3. GET /api/orders/14 → HTTP 200
4. POST /api/payment/vnpay/create-url → HTTP 200
5. GET /api/payment/vnpay/ipn?vnp_Amount=7999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29314&vnp_TransactionStatus=00&vnp_TxnRef=GJH-6CCC1ADC&vnp_SecureHash=a5d1a29388de1cf7b4b60266edde296f094bbd9e9c40605c4e50eac357d68f7ce2c61e7dfa4a5587da76e59d14b1327aceb2b631f1f64452226b43f4e0f1a7ca → HTTP 200
6. GET /api/payment/vnpay/ipn?vnp_Amount=8000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29314&vnp_TransactionStatus=00&vnp_TxnRef=GJH-6CCC1ADC&vnp_SecureHash=19e119a30e15bb2d63fb198b3e20c8c3158dcf7321890f47912c463d08d7a031e4d3498a7bbc397d2f3175db6536d624025e30a6b8aeb50388abd58bdea55c77 → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=8000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29314&vnp_TransactionStatus=00&vnp_TxnRef=GJH-6CCC1ADC&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
8. GET /api/payment/vnpay/return?vnp_Amount=8000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29314&vnp_TransactionStatus=00&vnp_TxnRef=GJH-6CCC1ADC&vnp_SecureHash=4ab7af5a78e6ddaff50c9f69b93bbd463854ff50462586de7ec177df0a82040395b3ffdb0abfc021ebe04a2d59e9f3039de53856aba6b7d934e9f69f2806ee51 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=8000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29314&vnp_TransactionStatus=00&vnp_TxnRef=GJH-6CCC1ADC&vnp_SecureHash=4ab7af5a78e6ddaff50c9f69b93bbd463854ff50462586de7ec177df0a82040395b3ffdb0abfc021ebe04a2d59e9f3039de53856aba6b7d934e9f69f2806ee51 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=8000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29314&vnp_TransactionStatus=00&vnp_TxnRef=GJH-6CCC1ADC&vnp_SecureHash=4ab7af5a78e6ddaff50c9f69b93bbd463854ff50462586de7ec177df0a82040395b3ffdb0abfc021ebe04a2d59e9f3039de53856aba6b7d934e9f69f2806ee51 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=8000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29314&vnp_TransactionStatus=00&vnp_TxnRef=GJH-6CCC1ADC&vnp_SecureHash=4ab7af5a78e6ddaff50c9f69b93bbd463854ff50462586de7ec177df0a82040395b3ffdb0abfc021ebe04a2d59e9f3039de53856aba6b7d934e9f69f2806ee51 → HTTP 200

### CART-baseline-ghn-stub — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "19000.00",
    "total_amount": "69000.00",
    "amount": "69000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 15
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      2
    ],
    "addressId": 2,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-baseline-ghn-stub"
  },
  "price": "50000",
  "expected": {
    "total": "69000",
    "subtotal": "50000",
    "discount": "0",
    "shipping": "19000"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "19000.00",
    "total_amount": "69000.00",
    "amount": "69000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 15
  },
  "before": {
    "orders": 14,
    "stock": 1000,
    "payments": 14
  },
  "actual": {
    "id": 15,
    "orderCode": "GJH-ED8CB4E2",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 0,
    "shippingFee": 19000,
    "totalAmount": 69000.0,
    "promoCode": null,
    "note": "QLPT-293 CART-baseline-ghn-stub",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 15,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 16,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.1583432",
    "createdAt": "2026-08-31T22:06:17.1593544",
    "updatedAt": "2026-08-31T22:06:17.1593544"
  },
  "id": "CART-baseline-ghn-stub",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "19000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "19000"
    },
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "response discount",
      "actual": "0"
    },
    {
      "expected": "19000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "response shipping",
      "actual": "19000"
    },
    {
      "expected": "69000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "response total",
      "actual": "6.9E+4"
    },
    {
      "expected": "50000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/orders/15 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "0"
    },
    {
      "expected": "19000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "1.9E+4"
    },
    {
      "expected": "6.9E+4",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "6.9E+4"
    },
    {
      "expected": "50000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "0",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "0.00"
    },
    {
      "expected": "19000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "19000.00"
    },
    {
      "expected": "69000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "69000.00"
    },
    {
      "expected": "69000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB amount",
      "actual": "69000.00"
    },
    {
      "expected": "50000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "6900000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "6900000"
    },
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":15,\"success\":true,\"orderCode\":\"GJH-ED8CB4E2\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":15,\"success\":true,\"orderCode\":\"GJH-ED8CB4E2\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "69000",
      "case": "CART-baseline-ghn-stub",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "69000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/shipping-fee → HTTP 200
2. POST /api/orders → HTTP 200
3. GET /api/orders/15 → HTTP 200
4. POST /api/payment/vnpay/create-url → HTTP 200
5. GET /api/payment/vnpay/ipn?vnp_Amount=6899999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29315&vnp_TransactionStatus=00&vnp_TxnRef=GJH-ED8CB4E2&vnp_SecureHash=15ee9d1c0af125c694dcb09b062e18e38be7ef36ef7b3989efebb4ace2eea792596a5895685efcc3652da59a2ce8d1168af659f321685b5a10c70e96861976ed → HTTP 200
6. GET /api/payment/vnpay/ipn?vnp_Amount=6900001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29315&vnp_TransactionStatus=00&vnp_TxnRef=GJH-ED8CB4E2&vnp_SecureHash=3396ee67624d5819bdca819bd42e1892e79d4f2c063c28245bc6a3bf7c29b7cb02060e3dadaeb400bb9601b3e955cd925172ba1b56eba47abe87ff8912d74cb0 → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=6900000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29315&vnp_TransactionStatus=00&vnp_TxnRef=GJH-ED8CB4E2&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
8. GET /api/payment/vnpay/return?vnp_Amount=6900000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29315&vnp_TransactionStatus=00&vnp_TxnRef=GJH-ED8CB4E2&vnp_SecureHash=f36c3f9f9412c266b6d0982965a1b5aae92c62f5bbcd6be2adcdc9e46023e18389bf40d0df541431fda6f872e14180ff8e89904ae16ac1ed9de1bc8d8065488e → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=6900000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29315&vnp_TransactionStatus=00&vnp_TxnRef=GJH-ED8CB4E2&vnp_SecureHash=f36c3f9f9412c266b6d0982965a1b5aae92c62f5bbcd6be2adcdc9e46023e18389bf40d0df541431fda6f872e14180ff8e89904ae16ac1ed9de1bc8d8065488e → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=6900000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29315&vnp_TransactionStatus=00&vnp_TxnRef=GJH-ED8CB4E2&vnp_SecureHash=f36c3f9f9412c266b6d0982965a1b5aae92c62f5bbcd6be2adcdc9e46023e18389bf40d0df541431fda6f872e14180ff8e89904ae16ac1ed9de1bc8d8065488e → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=6900000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29315&vnp_TransactionStatus=00&vnp_TxnRef=GJH-ED8CB4E2&vnp_SecureHash=f36c3f9f9412c266b6d0982965a1b5aae92c62f5bbcd6be2adcdc9e46023e18389bf40d0df541431fda6f872e14180ff8e89904ae16ac1ed9de1bc8d8065488e → HTTP 200

### CART-free-shipping — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "0.01",
    "shipping_fee": "0.00",
    "total_amount": "49999.99",
    "amount": "49999.99",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 16
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      3
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-free-shipping",
    "promoCode": "BVA_0c2e4fc9"
  },
  "price": "50000",
  "expected": {
    "total": "49999.99",
    "subtotal": "50000",
    "discount": "0.01",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "0.01",
    "shipping_fee": "0.00",
    "total_amount": "49999.99",
    "amount": "49999.99",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 16
  },
  "before": {
    "orders": 15,
    "stock": 1000,
    "payments": 15
  },
  "actual": {
    "id": 16,
    "orderCode": "GJH-8FA616F6",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 0.01,
    "shippingFee": 0,
    "totalAmount": 49999.99,
    "promoCode": "BVA_0C2E4FC9",
    "note": "QLPT-293 CART-free-shipping",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 16,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 17,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.25972",
    "createdAt": "2026-08-31T22:06:17.260717",
    "updatedAt": "2026-08-31T22:06:17.260717"
  },
  "id": "CART-free-shipping",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_0C2E4FC9\",\"endsAt\":\"2026-09-02T22:06:17.2257148\",\"freeShipping\":true,\"id\":12,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_0c2e4fc9\",\"startsAt\":\"2026-08-30T22:06:17.2257148\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":0.01}"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "0.01",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "0.01"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0.01",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "response discount",
      "actual": "0.01"
    },
    {
      "expected": "0",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "49999.99",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "response total",
      "actual": "49999.99"
    },
    {
      "expected": "50000",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET /api/orders/16 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "0.01",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "0.01"
    },
    {
      "expected": "0",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "49999.99",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "49999.99"
    },
    {
      "expected": "50000",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "0.01",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "0.01"
    },
    {
      "expected": "0",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "49999.99",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "49999.99"
    },
    {
      "expected": "49999.99",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "DB amount",
      "actual": "49999.99"
    },
    {
      "expected": "50000",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "4999999",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "4999999"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":16,\"success\":true,\"orderCode\":\"GJH-8FA616F6\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":16,\"success\":true,\"orderCode\":\"GJH-8FA616F6\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "49999.99",
      "case": "CART-free-shipping",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "49999.99"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/16 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=4999998&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29316&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8FA616F6&vnp_SecureHash=183f87d435e428a9bea04bc8f04c32c978b0f1d499bb93c10fd024498901bc94830d825b654029c80018628a98be02c82060e44fa3e03f37b6b6ff4d4edc0195 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=5000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29316&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8FA616F6&vnp_SecureHash=749c7ce7d74528f916baa944d8f40f4a7ab7069ec94e635d06a0699d326ad0107d283a3cb303fc1a14f6512ab9dacb0b9f26776831331246f862b8ce2e82c3f0 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=4999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29316&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8FA616F6&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=4999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29316&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8FA616F6&vnp_SecureHash=13ba96eb4d070c2288d7ce81dc6c8002b7425b6ceae95133390f7ef18e337123c5c53085e9b1831028f8ef8ab5dd906ac452a49480d5967ea3dd0a294aacbf17 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=4999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29316&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8FA616F6&vnp_SecureHash=13ba96eb4d070c2288d7ce81dc6c8002b7425b6ceae95133390f7ef18e337123c5c53085e9b1831028f8ef8ab5dd906ac452a49480d5967ea3dd0a294aacbf17 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=4999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29316&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8FA616F6&vnp_SecureHash=13ba96eb4d070c2288d7ce81dc6c8002b7425b6ceae95133390f7ef18e337123c5c53085e9b1831028f8ef8ab5dd906ac452a49480d5967ea3dd0a294aacbf17 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=4999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29316&vnp_TransactionStatus=00&vnp_TxnRef=GJH-8FA616F6&vnp_SecureHash=13ba96eb4d070c2288d7ce81dc6c8002b7425b6ceae95133390f7ef18e337123c5c53085e9b1831028f8ef8ab5dd906ac452a49480d5967ea3dd0a294aacbf17 → HTTP 200

### CART-lower-plus-cent — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "49999.99",
    "shipping_fee": "0.00",
    "total_amount": "0.01",
    "amount": "0.01",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 17
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      4
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-lower-plus-cent",
    "promoCode": "BVA_ec3a7f8e"
  },
  "price": "50000",
  "expected": {
    "total": "0.01",
    "subtotal": "50000",
    "discount": "49999.99",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "49999.99",
    "shipping_fee": "0.00",
    "total_amount": "0.01",
    "amount": "0.01",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 17
  },
  "before": {
    "orders": 16,
    "stock": 1000,
    "payments": 16
  },
  "actual": {
    "id": 17,
    "orderCode": "GJH-1A65EF55",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 49999.99,
    "shippingFee": 0,
    "totalAmount": 0.01,
    "promoCode": "BVA_EC3A7F8E",
    "note": "QLPT-293 CART-lower-plus-cent",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 17,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 18,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.3556209",
    "createdAt": "2026-08-31T22:06:17.3576181",
    "updatedAt": "2026-08-31T22:06:17.3576181"
  },
  "id": "CART-lower-plus-cent",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_EC3A7F8E\",\"endsAt\":\"2026-09-02T22:06:17.3257737\",\"freeShipping\":true,\"id\":13,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_ec3a7f8e\",\"startsAt\":\"2026-08-30T22:06:17.3257737\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":49999.99}"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "49999.99",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "49999.99"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "49999.99",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "response discount",
      "actual": "49999.99"
    },
    {
      "expected": "0",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "0.01",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "response total",
      "actual": "0.01"
    },
    {
      "expected": "50000",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/orders/17 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "49999.99",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "49999.99"
    },
    {
      "expected": "0",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "0.01",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "0.01"
    },
    {
      "expected": "50000",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "49999.99",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "49999.99"
    },
    {
      "expected": "0",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "0.01",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "0.01"
    },
    {
      "expected": "0.01",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "DB amount",
      "actual": "0.01"
    },
    {
      "expected": "50000",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "1",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "1"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":17,\"success\":true,\"orderCode\":\"GJH-1A65EF55\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":17,\"success\":true,\"orderCode\":\"GJH-1A65EF55\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "0.01",
      "case": "CART-lower-plus-cent",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "0.01"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/17 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29317&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1A65EF55&vnp_SecureHash=2493a0844b1ea3057087a8cb4d2de505741b811098f321e0c72044ec37c9e0c74402d6e64f86b1567c3266f8bed7feb0436eef725da008eb051e058ff0c159b5 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=2&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29317&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1A65EF55&vnp_SecureHash=341216327b979a4715af9df5ddabbbe0e7ab7732fa69e3e1d658597ab18300c9f3a915e11beb54c8a083e513fa57f435432d2132b3420407cefa2d443e6d375c → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=1&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29317&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1A65EF55&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=1&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29317&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1A65EF55&vnp_SecureHash=3f965aaecb7a1deca55b8fb9a4ccec9e8ae68c13cd5ab469bbad6a951659a15cc4761e2abefb14c051e3afe3d5caa40af25776eb66596a9802b412c994779af0 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=1&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29317&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1A65EF55&vnp_SecureHash=3f965aaecb7a1deca55b8fb9a4ccec9e8ae68c13cd5ab469bbad6a951659a15cc4761e2abefb14c051e3afe3d5caa40af25776eb66596a9802b412c994779af0 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=1&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29317&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1A65EF55&vnp_SecureHash=3f965aaecb7a1deca55b8fb9a4ccec9e8ae68c13cd5ab469bbad6a951659a15cc4761e2abefb14c051e3afe3d5caa40af25776eb66596a9802b412c994779af0 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=1&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29317&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1A65EF55&vnp_SecureHash=3f965aaecb7a1deca55b8fb9a4ccec9e8ae68c13cd5ab469bbad6a951659a15cc4761e2abefb14c051e3afe3d5caa40af25776eb66596a9802b412c994779af0 → HTTP 200

### CART-lower-zero — Fail

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 18
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      5
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-lower-zero",
    "promoCode": "BVA_0a0c13d4"
  },
  "price": "50000",
  "expected": {
    "total": "0",
    "subtotal": "50000",
    "discount": "50000",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 18
  },
  "before": {
    "orders": 17,
    "stock": 1000,
    "payments": 17
  },
  "actual": {
    "id": 18,
    "orderCode": "GJH-6CA1401E",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 50000.0,
    "shippingFee": 0,
    "totalAmount": 0,
    "promoCode": "BVA_0A0C13D4",
    "note": "QLPT-293 CART-lower-zero",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 18,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 19,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.4607655",
    "createdAt": "2026-08-31T22:06:17.4617652",
    "updatedAt": "2026-08-31T22:06:17.4617652"
  },
  "id": "CART-lower-zero",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Fail",
  "checks": [
    {
      "expected": 201,
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_0A0C13D4\",\"endsAt\":\"2026-09-02T22:06:17.4261159\",\"freeShipping\":true,\"id\":14,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_0a0c13d4\",\"startsAt\":\"2026-08-30T22:06:17.4261159\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":50000}"
    },
    {
      "expected": 200,
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5E+4"
    },
    {
      "expected": 200,
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "response discount",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "response total",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "GET /api/orders/18 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "5E+4",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "50000",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "50000.00"
    },
    {
      "expected": "0",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "DB amount",
      "actual": "0.00"
    },
    {
      "expected": "50000",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "0",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "0"
    },
    {
      "expected": 200,
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-lower-zero",
      "status": "Fail",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-lower-zero",
      "status": "Fail",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":18,\"success\":false,\"orderCode\":\"GJH-6CA1401E\",\"message\":\"Thanh toán thất bại hoặc dữ liệu không hợp lệ\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": "0",
      "case": "CART-lower-zero",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "0.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/18 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29318&vnp_TransactionStatus=00&vnp_TxnRef=GJH-6CA1401E&vnp_SecureHash=1082d7d36ccc550339e688d26f44ab29ca40a420fe55954a62d4ea7b66a8844d91b86cb1600a665e0dead671119352c344bfa3918103a8d9b936a9ba03488e09 → HTTP 200
8. GET /api/payment/vnpay/return?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29318&vnp_TransactionStatus=00&vnp_TxnRef=GJH-6CA1401E&vnp_SecureHash=1082d7d36ccc550339e688d26f44ab29ca40a420fe55954a62d4ea7b66a8844d91b86cb1600a665e0dead671119352c344bfa3918103a8d9b936a9ba03488e09 → HTTP 200

### CART-lower-minus-candidate-clamped — Fail

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 19
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      6
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-lower-minus-candidate-clamped",
    "promoCode": "BVA_19e22fcf"
  },
  "price": "50000",
  "expected": {
    "total": "0",
    "subtotal": "50000",
    "discount": "50000",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 19
  },
  "before": {
    "orders": 18,
    "stock": 1000,
    "payments": 18
  },
  "actual": {
    "id": 19,
    "orderCode": "GJH-E3376DC5",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 50000.0,
    "shippingFee": 0,
    "totalAmount": 0,
    "promoCode": "BVA_19E22FCF",
    "note": "QLPT-293 CART-lower-minus-candidate-clamped",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 19,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 20,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.5347001",
    "createdAt": "2026-08-31T22:06:17.5356961",
    "updatedAt": "2026-08-31T22:06:17.5356961"
  },
  "id": "CART-lower-minus-candidate-clamped",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Fail",
  "checks": [
    {
      "expected": 201,
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_19E22FCF\",\"endsAt\":\"2026-09-02T22:06:17.5020855\",\"freeShipping\":true,\"id\":15,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_19e22fcf\",\"startsAt\":\"2026-08-30T22:06:17.5020855\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":50000.01}"
    },
    {
      "expected": 200,
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5E+4"
    },
    {
      "expected": 200,
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "response discount",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "response total",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET /api/orders/19 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "5E+4",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "50000",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "50000.00"
    },
    {
      "expected": "0",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB amount",
      "actual": "0.00"
    },
    {
      "expected": "50000",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "0",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "0"
    },
    {
      "expected": 200,
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Fail",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Fail",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":19,\"success\":false,\"orderCode\":\"GJH-E3376DC5\",\"message\":\"Thanh toán thất bại hoặc dữ liệu không hợp lệ\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": "0",
      "case": "CART-lower-minus-candidate-clamped",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "0.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/19 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29319&vnp_TransactionStatus=00&vnp_TxnRef=GJH-E3376DC5&vnp_SecureHash=05b3efda314d2f150b8fec7065041ec9861fad3adc8576b39a02bc2521ea7a8e7e4347f3c7af62f4f5c6b3c6fb1b7ad2470a75647fdbd4b5a84e290f10599a8f → HTTP 200
8. GET /api/payment/vnpay/return?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29319&vnp_TransactionStatus=00&vnp_TxnRef=GJH-E3376DC5&vnp_SecureHash=05b3efda314d2f150b8fec7065041ec9861fad3adc8576b39a02bc2521ea7a8e7e4347f3c7af62f4f5c6b3c6fb1b7ad2470a75647fdbd4b5a84e290f10599a8f → HTTP 200

### CART-discount-below-subtotal-with-fee — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "49999.99",
    "shipping_fee": "30000.00",
    "total_amount": "30000.01",
    "amount": "30000.01",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 20
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      7
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-discount-below-subtotal-with-fee",
    "promoCode": "BVA_27db007f"
  },
  "price": "50000",
  "expected": {
    "total": "30000.01",
    "subtotal": "50000",
    "discount": "49999.99",
    "shipping": "30000"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "49999.99",
    "shipping_fee": "30000.00",
    "total_amount": "30000.01",
    "amount": "30000.01",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 20
  },
  "before": {
    "orders": 19,
    "stock": 1000,
    "payments": 19
  },
  "actual": {
    "id": 20,
    "orderCode": "GJH-E3CE38EF",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 49999.99,
    "shippingFee": 30000,
    "totalAmount": 30000.01,
    "promoCode": "BVA_27DB007F",
    "note": "QLPT-293 CART-discount-below-subtotal-with-fee",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 20,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 21,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.6062537",
    "createdAt": "2026-08-31T22:06:17.6076221",
    "updatedAt": "2026-08-31T22:06:17.6076221"
  },
  "id": "CART-discount-below-subtotal-with-fee",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_27DB007F\",\"endsAt\":\"2026-09-02T22:06:17.5727708\",\"freeShipping\":false,\"id\":16,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_27db007f\",\"startsAt\":\"2026-08-30T22:06:17.5727708\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":49999.99}"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "49999.99",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "49999.99"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "49999.99",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "response discount",
      "actual": "49999.99"
    },
    {
      "expected": "30000",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "response shipping",
      "actual": "30000"
    },
    {
      "expected": "30000.01",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "response total",
      "actual": "30000.01"
    },
    {
      "expected": "50000",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/orders/20 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "49999.99",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "49999.99"
    },
    {
      "expected": "30000",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "3E+4"
    },
    {
      "expected": "30000.01",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "30000.01"
    },
    {
      "expected": "50000",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "49999.99",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "49999.99"
    },
    {
      "expected": "30000",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "30000.00"
    },
    {
      "expected": "30000.01",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "30000.01"
    },
    {
      "expected": "30000.01",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB amount",
      "actual": "30000.01"
    },
    {
      "expected": "50000",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "3000001",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "3000001"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":20,\"success\":true,\"orderCode\":\"GJH-E3CE38EF\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":20,\"success\":true,\"orderCode\":\"GJH-E3CE38EF\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "30000.01",
      "case": "CART-discount-below-subtotal-with-fee",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "30000.01"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/20 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29320&vnp_TransactionStatus=00&vnp_TxnRef=GJH-E3CE38EF&vnp_SecureHash=0515c0c94d914fe27e939bd0755fa100a78484946cd715d0587f38783fe647969ac9141916bf08c171683c69667941990ff705685360a333e4b4f4931cef753a → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=3000002&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29320&vnp_TransactionStatus=00&vnp_TxnRef=GJH-E3CE38EF&vnp_SecureHash=b6aca462d2e71da0e2317949a278f7ed865973fb816b2ae4112ef2a274176afd73a7d02db63905c253e52a02235b8ce14036b92ecb0758fc6aa5874663587825 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29320&vnp_TransactionStatus=00&vnp_TxnRef=GJH-E3CE38EF&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29320&vnp_TransactionStatus=00&vnp_TxnRef=GJH-E3CE38EF&vnp_SecureHash=2c3ed6df3e8f4489c8f96f46f624ddc3b7842f5e0d96205bdd773f30e732860ea7111ba5713fff5f662258a0ccd92eb4b43e089aa13b17e641d3810413823757 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29320&vnp_TransactionStatus=00&vnp_TxnRef=GJH-E3CE38EF&vnp_SecureHash=2c3ed6df3e8f4489c8f96f46f624ddc3b7842f5e0d96205bdd773f30e732860ea7111ba5713fff5f662258a0ccd92eb4b43e089aa13b17e641d3810413823757 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29320&vnp_TransactionStatus=00&vnp_TxnRef=GJH-E3CE38EF&vnp_SecureHash=2c3ed6df3e8f4489c8f96f46f624ddc3b7842f5e0d96205bdd773f30e732860ea7111ba5713fff5f662258a0ccd92eb4b43e089aa13b17e641d3810413823757 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29320&vnp_TransactionStatus=00&vnp_TxnRef=GJH-E3CE38EF&vnp_SecureHash=2c3ed6df3e8f4489c8f96f46f624ddc3b7842f5e0d96205bdd773f30e732860ea7111ba5713fff5f662258a0ccd92eb4b43e089aa13b17e641d3810413823757 → HTTP 200

### CART-discount-equal-subtotal-with-fee — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "30000.00",
    "total_amount": "30000.00",
    "amount": "30000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 21
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      8
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-discount-equal-subtotal-with-fee",
    "promoCode": "BVA_dc2277e9"
  },
  "price": "50000",
  "expected": {
    "total": "30000",
    "subtotal": "50000",
    "discount": "50000",
    "shipping": "30000"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "30000.00",
    "total_amount": "30000.00",
    "amount": "30000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 21
  },
  "before": {
    "orders": 20,
    "stock": 1000,
    "payments": 20
  },
  "actual": {
    "id": 21,
    "orderCode": "GJH-53B7B1A7",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 50000.0,
    "shippingFee": 30000,
    "totalAmount": 30000.0,
    "promoCode": "BVA_DC2277E9",
    "note": "QLPT-293 CART-discount-equal-subtotal-with-fee",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 21,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 22,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.6990921",
    "createdAt": "2026-08-31T22:06:17.7000922",
    "updatedAt": "2026-08-31T22:06:17.7000922"
  },
  "id": "CART-discount-equal-subtotal-with-fee",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_DC2277E9\",\"endsAt\":\"2026-09-02T22:06:17.6723544\",\"freeShipping\":false,\"id\":17,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_dc2277e9\",\"startsAt\":\"2026-08-30T22:06:17.6723544\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":50000}"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5E+4"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "response discount",
      "actual": "5E+4"
    },
    {
      "expected": "30000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "response shipping",
      "actual": "30000"
    },
    {
      "expected": "30000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "response total",
      "actual": "3E+4"
    },
    {
      "expected": "50000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/orders/21 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "5E+4",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+4"
    },
    {
      "expected": "30000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "3E+4"
    },
    {
      "expected": "3E+4",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "3E+4"
    },
    {
      "expected": "50000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "50000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "50000.00"
    },
    {
      "expected": "30000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "30000.00"
    },
    {
      "expected": "30000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "30000.00"
    },
    {
      "expected": "30000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB amount",
      "actual": "30000.00"
    },
    {
      "expected": "50000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "3000000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "3000000"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":21,\"success\":true,\"orderCode\":\"GJH-53B7B1A7\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":21,\"success\":true,\"orderCode\":\"GJH-53B7B1A7\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-discount-equal-subtotal-with-fee",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "30000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/21 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=2999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29321&vnp_TransactionStatus=00&vnp_TxnRef=GJH-53B7B1A7&vnp_SecureHash=1170f655b30a429b4ffb3f74c18a78f297ed25f8ad45c9b5ccc6648df91b88d7094ac83b0f72beb4bbb87c8f6a45830a42b5c53b29635d1af10ee626bab9462f → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29321&vnp_TransactionStatus=00&vnp_TxnRef=GJH-53B7B1A7&vnp_SecureHash=6c632656f3d5b1f6a0f0afe4d6d0fc3f54cfc6f5a8a400e5e307e2984f3c8750c6d66bdae2b7a3e199f173f817974a4ec00ea30c2e174eb08cf90cd9eccfc109 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29321&vnp_TransactionStatus=00&vnp_TxnRef=GJH-53B7B1A7&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29321&vnp_TransactionStatus=00&vnp_TxnRef=GJH-53B7B1A7&vnp_SecureHash=de0771e59b051b3239d77fd3030bbe20be34fe961f46c43416eec1483492ea30ffcfac50c37d177198047494497b7f1960fda2d8b09e192fed2f70c818740199 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29321&vnp_TransactionStatus=00&vnp_TxnRef=GJH-53B7B1A7&vnp_SecureHash=de0771e59b051b3239d77fd3030bbe20be34fe961f46c43416eec1483492ea30ffcfac50c37d177198047494497b7f1960fda2d8b09e192fed2f70c818740199 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29321&vnp_TransactionStatus=00&vnp_TxnRef=GJH-53B7B1A7&vnp_SecureHash=de0771e59b051b3239d77fd3030bbe20be34fe961f46c43416eec1483492ea30ffcfac50c37d177198047494497b7f1960fda2d8b09e192fed2f70c818740199 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29321&vnp_TransactionStatus=00&vnp_TxnRef=GJH-53B7B1A7&vnp_SecureHash=de0771e59b051b3239d77fd3030bbe20be34fe961f46c43416eec1483492ea30ffcfac50c37d177198047494497b7f1960fda2d8b09e192fed2f70c818740199 → HTTP 200

### CART-discount-above-subtotal-with-fee — Pass

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "30000.00",
    "total_amount": "30000.00",
    "amount": "30000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 22
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      9
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-discount-above-subtotal-with-fee",
    "promoCode": "BVA_906cf0d6"
  },
  "price": "50000",
  "expected": {
    "total": "30000",
    "subtotal": "50000",
    "discount": "50000",
    "shipping": "30000"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "30000.00",
    "total_amount": "30000.00",
    "amount": "30000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 22
  },
  "before": {
    "orders": 21,
    "stock": 1000,
    "payments": 21
  },
  "actual": {
    "id": 22,
    "orderCode": "GJH-2AE7F643",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 50000.0,
    "shippingFee": 30000,
    "totalAmount": 30000.0,
    "promoCode": "BVA_906CF0D6",
    "note": "QLPT-293 CART-discount-above-subtotal-with-fee",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 22,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 23,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.7905509",
    "createdAt": "2026-08-31T22:06:17.791552",
    "updatedAt": "2026-08-31T22:06:17.791552"
  },
  "id": "CART-discount-above-subtotal-with-fee",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_906CF0D6\",\"endsAt\":\"2026-09-02T22:06:17.7615508\",\"freeShipping\":false,\"id\":18,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_906cf0d6\",\"startsAt\":\"2026-08-30T22:06:17.7615508\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"FIXED\",\"usedCount\":0,\"value\":50000.01}"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5E+4"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "response discount",
      "actual": "5E+4"
    },
    {
      "expected": "30000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "response shipping",
      "actual": "30000"
    },
    {
      "expected": "30000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "response total",
      "actual": "3E+4"
    },
    {
      "expected": "50000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/orders/22 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "5E+4",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+4"
    },
    {
      "expected": "30000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "3E+4"
    },
    {
      "expected": "3E+4",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "3E+4"
    },
    {
      "expected": "50000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "50000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "50000.00"
    },
    {
      "expected": "30000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "30000.00"
    },
    {
      "expected": "30000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "30000.00"
    },
    {
      "expected": "30000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB amount",
      "actual": "30000.00"
    },
    {
      "expected": "50000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "3000000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "3000000"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":22,\"success\":true,\"orderCode\":\"GJH-2AE7F643\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":22,\"success\":true,\"orderCode\":\"GJH-2AE7F643\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-discount-above-subtotal-with-fee",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "30000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/22 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=2999999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29322&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2AE7F643&vnp_SecureHash=69203643168a90c2c708099f58aadd82f801c14c6634fa0428211ac84e7e6ee84e4dc74bb1ced3e665306599b8ef2018de59242af0f688674449b4094916a63f → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=3000001&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29322&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2AE7F643&vnp_SecureHash=b3e8758f18073fe1524bb4c58847c044c3ae0e879385cd4cf7acc7f44547d8bc55901f10262037d244f313aede7627bdef39accb51aa6cb3e1ff064348c01534 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29322&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2AE7F643&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29322&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2AE7F643&vnp_SecureHash=1b53045b9decab6be148e14604a3b12601f65bb5fb42777a0479ed1dc17c8d1863bc5ea15a0e5fdbe26ba0176cb2fc66e6ab4e21bb88943ecca66f8bf4592986 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29322&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2AE7F643&vnp_SecureHash=1b53045b9decab6be148e14604a3b12601f65bb5fb42777a0479ed1dc17c8d1863bc5ea15a0e5fdbe26ba0176cb2fc66e6ab4e21bb88943ecca66f8bf4592986 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29322&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2AE7F643&vnp_SecureHash=1b53045b9decab6be148e14604a3b12601f65bb5fb42777a0479ed1dc17c8d1863bc5ea15a0e5fdbe26ba0176cb2fc66e6ab4e21bb88943ecca66f8bf4592986 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=3000000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29322&vnp_TransactionStatus=00&vnp_TxnRef=GJH-2AE7F643&vnp_SecureHash=1b53045b9decab6be148e14604a3b12601f65bb5fb42777a0479ed1dc17c8d1863bc5ea15a0e5fdbe26ba0176cb2fc66e6ab4e21bb88943ecca66f8bf4592986 → HTTP 200

### CART-percent-floor-below — Pass

Unit price: 50009.99; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50009.99",
    "discount_amount": "5000.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.99",
    "amount": "45009.99",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50009.99",
    "orderId": 23
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      10
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-percent-floor-below",
    "promoCode": "BVA_818042b2"
  },
  "price": "50009.99",
  "expected": {
    "total": "45009.99",
    "subtotal": "50009.99",
    "discount": "5000",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50009.99",
    "discount_amount": "5000.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.99",
    "amount": "45009.99",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50009.99",
    "orderId": 23
  },
  "before": {
    "orders": 22,
    "stock": 1000,
    "payments": 22
  },
  "actual": {
    "id": 23,
    "orderCode": "GJH-73EB8238",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50009.99,
    "discountAmount": 5000,
    "shippingFee": 0,
    "totalAmount": 45009.99,
    "promoCode": "BVA_818042B2",
    "note": "QLPT-293 CART-percent-floor-below",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 23,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 24,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50009.99,
        "quantity": 1,
        "subtotal": 50009.99,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.8812552",
    "createdAt": "2026-08-31T22:06:17.8834516",
    "updatedAt": "2026-08-31T22:06:17.8834516"
  },
  "id": "CART-percent-floor-below",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_818042B2\",\"endsAt\":\"2026-09-02T22:06:17.8481833\",\"freeShipping\":true,\"id\":19,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_818042b2\",\"startsAt\":\"2026-08-30T22:06:17.8481833\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"PERCENT\",\"usedCount\":0,\"value\":10}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "5000",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5000"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50009.99",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "50009.99"
    },
    {
      "expected": "5000",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "response discount",
      "actual": "5000"
    },
    {
      "expected": "0",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "45009.99",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "response total",
      "actual": "45009.99"
    },
    {
      "expected": "50009.99",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50009.99"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/orders/23 status",
      "actual": 200
    },
    {
      "expected": "50009.99",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "50009.99"
    },
    {
      "expected": "5000",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+3"
    },
    {
      "expected": "0",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "45009.99",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "45009.99"
    },
    {
      "expected": "50009.99",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50009.99"
    },
    {
      "expected": "5000",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "5000.00"
    },
    {
      "expected": "0",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "45009.99",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "45009.99"
    },
    {
      "expected": "45009.99",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "DB amount",
      "actual": "45009.99"
    },
    {
      "expected": "50009.99",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50009.99"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "4500999",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "4500999"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":23,\"success\":true,\"orderCode\":\"GJH-73EB8238\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":23,\"success\":true,\"orderCode\":\"GJH-73EB8238\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "45009.99",
      "case": "CART-percent-floor-below",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "45009.99"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/23 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=4500998&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29323&vnp_TransactionStatus=00&vnp_TxnRef=GJH-73EB8238&vnp_SecureHash=205db1e1d51b37f1d8ce9ffe35e18fe6611a8b01a5b64efff4ea7be3e1803c655be04b85c840a0cc775e4399e57bdd1ffa93d3e3500d5780e69c0f38811d8ba2 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=4501000&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29323&vnp_TransactionStatus=00&vnp_TxnRef=GJH-73EB8238&vnp_SecureHash=2f8e01c5f7b757c66ad0e18e9a64ca45b8c239a545737add333d3182b4013ca8cfe8bee4d3225ec12d1bb514703d1965d857364ea7b7413ed0949cf36c02502f → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=4500999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29323&vnp_TransactionStatus=00&vnp_TxnRef=GJH-73EB8238&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=4500999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29323&vnp_TransactionStatus=00&vnp_TxnRef=GJH-73EB8238&vnp_SecureHash=5c77bd8ba963f6a28502ab69aa009bdb6a8d3703060d86db671b8d672638ef605f1668454997e73e3b63758c2a271688342b0a092441cf0a9841e21623d0643a → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=4500999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29323&vnp_TransactionStatus=00&vnp_TxnRef=GJH-73EB8238&vnp_SecureHash=5c77bd8ba963f6a28502ab69aa009bdb6a8d3703060d86db671b8d672638ef605f1668454997e73e3b63758c2a271688342b0a092441cf0a9841e21623d0643a → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=4500999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29323&vnp_TransactionStatus=00&vnp_TxnRef=GJH-73EB8238&vnp_SecureHash=5c77bd8ba963f6a28502ab69aa009bdb6a8d3703060d86db671b8d672638ef605f1668454997e73e3b63758c2a271688342b0a092441cf0a9841e21623d0643a → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=4500999&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29323&vnp_TransactionStatus=00&vnp_TxnRef=GJH-73EB8238&vnp_SecureHash=5c77bd8ba963f6a28502ab69aa009bdb6a8d3703060d86db671b8d672638ef605f1668454997e73e3b63758c2a271688342b0a092441cf0a9841e21623d0643a → HTTP 200

### CART-percent-floor-at — Pass

Unit price: 50010.00; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50010.00",
    "discount_amount": "5001.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.00",
    "amount": "45009.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50010.00",
    "orderId": 24
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      11
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-percent-floor-at",
    "promoCode": "BVA_a33532cd"
  },
  "price": "50010.00",
  "expected": {
    "total": "45009",
    "subtotal": "50010.00",
    "discount": "5001",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50010.00",
    "discount_amount": "5001.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.00",
    "amount": "45009.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50010.00",
    "orderId": 24
  },
  "before": {
    "orders": 23,
    "stock": 1000,
    "payments": 23
  },
  "actual": {
    "id": 24,
    "orderCode": "GJH-601A5C81",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50010.0,
    "discountAmount": 5001,
    "shippingFee": 0,
    "totalAmount": 45009,
    "promoCode": "BVA_A33532CD",
    "note": "QLPT-293 CART-percent-floor-at",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 24,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 25,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50010.0,
        "quantity": 1,
        "subtotal": 50010.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:17.9633847",
    "createdAt": "2026-08-31T22:06:17.9643845",
    "updatedAt": "2026-08-31T22:06:17.9643845"
  },
  "id": "CART-percent-floor-at",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_A33532CD\",\"endsAt\":\"2026-09-02T22:06:17.9384704\",\"freeShipping\":true,\"id\":20,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_a33532cd\",\"startsAt\":\"2026-08-30T22:06:17.9384704\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"PERCENT\",\"usedCount\":0,\"value\":10}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "5001",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5001"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50010.00",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5.001E+4"
    },
    {
      "expected": "5001",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "response discount",
      "actual": "5001"
    },
    {
      "expected": "0",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "45009",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "response total",
      "actual": "45009"
    },
    {
      "expected": "50010.00",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50010"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/orders/24 status",
      "actual": 200
    },
    {
      "expected": "5.001E+4",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5.001E+4"
    },
    {
      "expected": "5001",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5001"
    },
    {
      "expected": "0",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "45009",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "45009"
    },
    {
      "expected": "50010.00",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50010.00"
    },
    {
      "expected": "5001",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "5001.00"
    },
    {
      "expected": "0",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "45009",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "45009.00"
    },
    {
      "expected": "45009",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "DB amount",
      "actual": "45009.00"
    },
    {
      "expected": "50010.00",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50010.00"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "4500900",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "4500900"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":24,\"success\":true,\"orderCode\":\"GJH-601A5C81\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":24,\"success\":true,\"orderCode\":\"GJH-601A5C81\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "45009",
      "case": "CART-percent-floor-at",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "45009.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/24 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=4500899&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29324&vnp_TransactionStatus=00&vnp_TxnRef=GJH-601A5C81&vnp_SecureHash=2fe646c3d25c105217a9d9471e46f9a17ef3daeb7c797939bc0716d59fcad23e4d4a35b645563e65276b318e57670fa8170405414bff9bc6f082d3fc1d801f22 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29324&vnp_TransactionStatus=00&vnp_TxnRef=GJH-601A5C81&vnp_SecureHash=b30afe556383003f1f9b331f433f9d85d12a437a97f74cf75fd3d419a5ef31a39dbe54b91f5f0c9b78631235c91d17b426fd4b42c22556d08bf78194407dfd38 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29324&vnp_TransactionStatus=00&vnp_TxnRef=GJH-601A5C81&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29324&vnp_TransactionStatus=00&vnp_TxnRef=GJH-601A5C81&vnp_SecureHash=609ef40878b241d15f4c108c6f6c41825ce506370debeb2c8f106db665c68b753bd58dffce8e0718f82046796758826038546fe8b479b1c1e56650d573cec054 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29324&vnp_TransactionStatus=00&vnp_TxnRef=GJH-601A5C81&vnp_SecureHash=609ef40878b241d15f4c108c6f6c41825ce506370debeb2c8f106db665c68b753bd58dffce8e0718f82046796758826038546fe8b479b1c1e56650d573cec054 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29324&vnp_TransactionStatus=00&vnp_TxnRef=GJH-601A5C81&vnp_SecureHash=609ef40878b241d15f4c108c6f6c41825ce506370debeb2c8f106db665c68b753bd58dffce8e0718f82046796758826038546fe8b479b1c1e56650d573cec054 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29324&vnp_TransactionStatus=00&vnp_TxnRef=GJH-601A5C81&vnp_SecureHash=609ef40878b241d15f4c108c6f6c41825ce506370debeb2c8f106db665c68b753bd58dffce8e0718f82046796758826038546fe8b479b1c1e56650d573cec054 → HTTP 200

### CART-percent-floor-above — Pass

Unit price: 50010.01; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50010.01",
    "discount_amount": "5001.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.01",
    "amount": "45009.01",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50010.01",
    "orderId": 25
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      12
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-percent-floor-above",
    "promoCode": "BVA_36b8164e"
  },
  "price": "50010.01",
  "expected": {
    "total": "45009.01",
    "subtotal": "50010.01",
    "discount": "5001",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50010.01",
    "discount_amount": "5001.00",
    "shipping_fee": "0.00",
    "total_amount": "45009.01",
    "amount": "45009.01",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50010.01",
    "orderId": 25
  },
  "before": {
    "orders": 24,
    "stock": 1000,
    "payments": 24
  },
  "actual": {
    "id": 25,
    "orderCode": "GJH-1697CAFB",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50010.01,
    "discountAmount": 5001,
    "shippingFee": 0,
    "totalAmount": 45009.01,
    "promoCode": "BVA_36B8164E",
    "note": "QLPT-293 CART-percent-floor-above",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 25,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 26,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50010.01,
        "quantity": 1,
        "subtotal": 50010.01,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:18.0434542",
    "createdAt": "2026-08-31T22:06:18.0444536",
    "updatedAt": "2026-08-31T22:06:18.0444536"
  },
  "id": "CART-percent-floor-above",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_36B8164E\",\"endsAt\":\"2026-09-02T22:06:18.0169412\",\"freeShipping\":true,\"id\":21,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_36b8164e\",\"startsAt\":\"2026-08-30T22:06:18.0169412\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"PERCENT\",\"usedCount\":0,\"value\":10}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "5001",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "5001"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50010.01",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "50010.01"
    },
    {
      "expected": "5001",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "response discount",
      "actual": "5001"
    },
    {
      "expected": "0",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "45009.01",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "response total",
      "actual": "45009.01"
    },
    {
      "expected": "50010.01",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50010.01"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/orders/25 status",
      "actual": 200
    },
    {
      "expected": "50010.01",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "50010.01"
    },
    {
      "expected": "5001",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5001"
    },
    {
      "expected": "0",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "45009.01",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "45009.01"
    },
    {
      "expected": "50010.01",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50010.01"
    },
    {
      "expected": "5001",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "5001.00"
    },
    {
      "expected": "0",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "45009.01",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "45009.01"
    },
    {
      "expected": "45009.01",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "DB amount",
      "actual": "45009.01"
    },
    {
      "expected": "50010.01",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50010.01"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "4500901",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "4500901"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "IPN mismatch -1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "04",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "IPN mismatch 1",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": "PENDING",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "mismatch leaves pending",
      "actual": "PENDING"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "97",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "invalid signature",
      "actual": "{\"RspCode\":\"97\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "success=true,confirmed=false,DB=PENDING",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "Return display only",
      "actual": "{\"orderId\":25,\"success\":true,\"orderCode\":\"GJH-1697CAFB\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":25,\"success\":true,\"orderCode\":\"GJH-1697CAFB\",\"message\":\"Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN\",\"confirmed\":true,\"responseCode\":\"00\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "45009.01",
      "case": "CART-percent-floor-above",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "45009.01"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/25 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=4500900&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29325&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1697CAFB&vnp_SecureHash=56cd99221c42ac00abce50383006c80d93d2a78eab79a15e1ea5953c519384c72c30eebd1c239f9d26cae055232fc714faa0b50a761c9081b208a5e6e60eec46 → HTTP 200
8. GET /api/payment/vnpay/ipn?vnp_Amount=4500902&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29325&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1697CAFB&vnp_SecureHash=9f1986a275d6c033c5fe251659dce740103f2155526e12770d03d28f75bd6ca8b531369f8f38058dced1dc9eaf74baaef043951ec7ba20f77a4881963e74fe02 → HTTP 200
9. GET /api/payment/vnpay/ipn?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29325&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1697CAFB&vnp_SecureHash=00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 → HTTP 200
10. GET /api/payment/vnpay/return?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29325&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1697CAFB&vnp_SecureHash=a172f1cab6f380b59ac755048e1f4ea30f7413603f239f417d51407bec66bc3b053ba3937f743b4a46e59b3173298d3cdd14fff258a35955e305d32c16375779 → HTTP 200
11. GET /api/payment/vnpay/ipn?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29325&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1697CAFB&vnp_SecureHash=a172f1cab6f380b59ac755048e1f4ea30f7413603f239f417d51407bec66bc3b053ba3937f743b4a46e59b3173298d3cdd14fff258a35955e305d32c16375779 → HTTP 200
12. GET /api/payment/vnpay/return?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29325&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1697CAFB&vnp_SecureHash=a172f1cab6f380b59ac755048e1f4ea30f7413603f239f417d51407bec66bc3b053ba3937f743b4a46e59b3173298d3cdd14fff258a35955e305d32c16375779 → HTTP 200
13. GET /api/payment/vnpay/ipn?vnp_Amount=4500901&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29325&vnp_TransactionStatus=00&vnp_TxnRef=GJH-1697CAFB&vnp_SecureHash=a172f1cab6f380b59ac755048e1f4ea30f7413603f239f417d51407bec66bc3b053ba3937f743b4a46e59b3173298d3cdd14fff258a35955e305d32c16375779 → HTTP 200

### CART-percent-100 — Fail

Unit price: 50000; quantity: 1. Cố định product, weight=500g, customer và địa chỉ tương ứng. Mỗi case dùng variant riêng để không làm đổi dữ liệu các case trước.
```json
{
  "dbAfterCreate": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 26
  },
  "quantity": 1,
  "input": {
    "cartItemIds": [
      13
    ],
    "addressId": 1,
    "paymentMethod": "VNPAY",
    "note": "QLPT-293 CART-percent-100",
    "promoCode": "BVA_fad98b7b"
  },
  "price": "50000",
  "expected": {
    "total": "0",
    "subtotal": "50000",
    "discount": "50000",
    "shipping": "0"
  },
  "dbAfterCallback": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 26
  },
  "before": {
    "orders": 25,
    "stock": 1000,
    "payments": 25
  },
  "actual": {
    "id": 26,
    "orderCode": "GJH-D114C34D",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "VNPAY",
    "subtotal": 50000.0,
    "discountAmount": 50000,
    "shippingFee": 0,
    "totalAmount": 0,
    "promoCode": "BVA_FAD98B7B",
    "note": "QLPT-293 CART-percent-100",
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 26,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 27,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": "2026-09-01T22:06:18.1382799",
    "createdAt": "2026-08-31T22:06:18.1392912",
    "updatedAt": "2026-08-31T22:06:18.1392912"
  },
  "id": "CART-percent-100",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Fail",
  "checks": [
    {
      "expected": 201,
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": "id",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "promotion created",
      "actual": "{\"code\":\"BVA_FAD98B7B\",\"endsAt\":\"2026-09-02T22:06:18.1093739\",\"freeShipping\":true,\"id\":22,\"isActive\":true,\"maxUses\":null,\"maxUsesPerUser\":null,\"minOrderValue\":0,\"name\":\"QLPT293 BVA_fad98b7b\",\"startsAt\":\"2026-08-30T22:06:18.1093739\",\"status\":\"RUNNING\",\"target\":\"PUBLIC\",\"targetUserId\":null,\"targetUserName\":null,\"targetUserPhone\":null,\"type\":\"PERCENT\",\"usedCount\":0,\"value\":100}"
    },
    {
      "expected": 200,
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "POST /api/orders/apply-promo status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "promo preview discount",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "POST /api/orders/shipping-fee status",
      "actual": 200
    },
    {
      "expected": "30000",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "base shipping quote (before promotion)",
      "actual": "30000"
    },
    {
      "expected": 200,
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "50000",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "response subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "response discount",
      "actual": "50000"
    },
    {
      "expected": "0",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "response shipping",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "response total",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "sum API order_items.subtotal",
      "actual": "50000"
    },
    {
      "expected": 200,
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "GET /api/orders/26 status",
      "actual": 200
    },
    {
      "expected": "5E+4",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "GET matches POST subtotal",
      "actual": "5E+4"
    },
    {
      "expected": "50000",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "GET matches POST discountAmount",
      "actual": "5E+4"
    },
    {
      "expected": "0",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "GET matches POST shippingFee",
      "actual": "0"
    },
    {
      "expected": "0",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "GET matches POST totalAmount",
      "actual": "0"
    },
    {
      "expected": "50000",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "DB subtotal",
      "actual": "50000.00"
    },
    {
      "expected": "50000",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "DB discount_amount",
      "actual": "50000.00"
    },
    {
      "expected": "0",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "DB shipping_fee",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "DB total_amount",
      "actual": "0.00"
    },
    {
      "expected": "0",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "DB amount",
      "actual": "0.00"
    },
    {
      "expected": "50000",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "DB items_subtotal",
      "actual": "50000.00"
    },
    {
      "expected": 200,
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "POST /api/payment/vnpay/create-url status",
      "actual": 200
    },
    {
      "expected": "0",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "VNPay vnp_Amount = DB total * 100",
      "actual": "0"
    },
    {
      "expected": 200,
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/ipn status",
      "actual": 200
    },
    {
      "expected": "00",
      "case": "CART-percent-100",
      "status": "Fail",
      "check": "exact amount accepted after URL issued",
      "actual": "{\"RspCode\":\"04\",\"Message\":\"Confirm Fail\"}"
    },
    {
      "expected": 200,
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "GET /api/payment/vnpay/return status",
      "actual": 200
    },
    {
      "expected": "confirmed=true, DB=PAID",
      "case": "CART-percent-100",
      "status": "Fail",
      "check": "exact callback completes online order",
      "actual": "{\"orderId\":26,\"success\":false,\"orderCode\":\"GJH-D114C34D\",\"message\":\"Thanh toán thất bại hoặc dữ liệu không hợp lệ\",\"confirmed\":false,\"responseCode\":\"00\"}"
    },
    {
      "expected": "0",
      "case": "CART-percent-100",
      "status": "Pass",
      "check": "payment amount preserved",
      "actual": "0.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/apply-promo → HTTP 200
3. POST /api/orders/shipping-fee → HTTP 200
4. POST /api/orders → HTTP 200
5. GET /api/orders/26 → HTTP 200
6. POST /api/payment/vnpay/create-url → HTTP 200
7. GET /api/payment/vnpay/ipn?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29326&vnp_TransactionStatus=00&vnp_TxnRef=GJH-D114C34D&vnp_SecureHash=c97bb8b4321db9d774e72860e3bd61bfd124ddf8baabab327cb17bbfa4d95f5bfdefdbcfe18e5c5507323dd703a96b38e41d4881f81f17b73cff2d95023c5fad → HTTP 200
8. GET /api/payment/vnpay/return?vnp_Amount=0&vnp_ResponseCode=00&vnp_TmnCode=BVA293&vnp_TransactionNo=29326&vnp_TransactionStatus=00&vnp_TxnRef=GJH-D114C34D&vnp_SecureHash=c97bb8b4321db9d774e72860e3bd61bfd124ddf8baabab327cb17bbfa4d95f5bfdefdbcfe18e5c5507323dd703a96b38e41d4881f81f17b73cff2d95023c5fad → HTTP 200

### SHIPPING-provinces — Pass

```json
{
  "actual": [
    {
      "ProvinceName": "Hồ Chí Minh",
      "ProvinceID": 202
    }
  ],
  "expected": "HTTP 200 with configured GHN geography stub; contract only, NOT live carrier data",
  "id": "SHIPPING-provinces",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "SHIPPING-provinces",
      "status": "Pass",
      "check": "GET /api/shipping/provinces status",
      "actual": 200
    },
    {
      "expected": "one configured carrier fixture",
      "case": "SHIPPING-provinces",
      "status": "Pass",
      "check": "geography controller forwards stub",
      "actual": "[{\"ProvinceName\":\"Hồ Chí Minh\",\"ProvinceID\":202}]"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. GET /api/shipping/provinces → HTTP 200

### SHIPPING-districts?provinceId=202 — Pass

```json
{
  "actual": [
    {
      "DistrictName": "Quận 1",
      "DistrictID": 1454
    }
  ],
  "expected": "HTTP 200 with configured GHN geography stub; contract only, NOT live carrier data",
  "id": "SHIPPING-districts?provinceId=202",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "SHIPPING-districts?provinceId=202",
      "status": "Pass",
      "check": "GET /api/shipping/districts status",
      "actual": 200
    },
    {
      "expected": "one configured carrier fixture",
      "case": "SHIPPING-districts?provinceId=202",
      "status": "Pass",
      "check": "geography controller forwards stub",
      "actual": "[{\"DistrictName\":\"Quận 1\",\"DistrictID\":1454}]"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. GET /api/shipping/districts?provinceId=202 → HTTP 200

### SHIPPING-wards?districtId=1454 — Pass

```json
{
  "actual": [
    {
      "WardCode": "20101",
      "WardName": "Phường kiểm thử"
    }
  ],
  "expected": "HTTP 200 with configured GHN geography stub; contract only, NOT live carrier data",
  "id": "SHIPPING-wards?districtId=1454",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "SHIPPING-wards?districtId=1454",
      "status": "Pass",
      "check": "GET /api/shipping/wards status",
      "actual": 200
    },
    {
      "expected": "one configured carrier fixture",
      "case": "SHIPPING-wards?districtId=1454",
      "status": "Pass",
      "check": "geography controller forwards stub",
      "actual": "[{\"WardCode\":\"20101\",\"WardName\":\"Phường kiểm thử\"}]"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. GET /api/shipping/wards?districtId=1454 → HTTP 200

### BUY-zero-COD — Pass

```json
{
  "input": {
    "variantId": 28,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "COD",
    "promoCode": "ZERO_BUY"
  },
  "expected": "Characterization: zero accepted and stored; not a new business rule",
  "db": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 27
  },
  "actual": {
    "id": 27,
    "orderCode": "GJH-CE6E4B34",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "COD",
    "subtotal": 50000.0,
    "discountAmount": 50000.0,
    "shippingFee": 0,
    "totalAmount": 0,
    "promoCode": "ZERO_BUY",
    "note": null,
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 27,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 28,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": null,
    "createdAt": "2026-08-31T22:06:18.1951546",
    "updatedAt": "2026-08-31T22:06:18.1951546"
  },
  "id": "BUY-zero-COD",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "BUY-zero-COD",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": 200,
      "case": "BUY-zero-COD",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "0",
      "case": "BUY-zero-COD",
      "status": "Pass",
      "check": "zero is accepted by Order implementation",
      "actual": "0"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders/buy-now → HTTP 200

### CART-zero-COD — Pass

```json
{
  "input": {
    "cartItemIds": [
      14
    ],
    "addressId": 1,
    "paymentMethod": "COD",
    "promoCode": "ZERO_CART"
  },
  "expected": "Characterization: zero accepted and stored; not a new business rule",
  "db": {
    "subtotal": "50000.00",
    "discount_amount": "50000.00",
    "shipping_fee": "0.00",
    "total_amount": "0.00",
    "amount": "0.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 28
  },
  "actual": {
    "id": 28,
    "orderCode": "GJH-56D3C272",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "COD",
    "subtotal": 50000.0,
    "discountAmount": 50000.0,
    "shippingFee": 0,
    "totalAmount": 0,
    "promoCode": "ZERO_CART",
    "note": null,
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 28,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 29,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": null,
    "createdAt": "2026-08-31T22:06:18.2183175",
    "updatedAt": "2026-08-31T22:06:18.2183175"
  },
  "id": "CART-zero-COD",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 201,
      "case": "CART-zero-COD",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 201
    },
    {
      "expected": 200,
      "case": "CART-zero-COD",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "0",
      "case": "CART-zero-COD",
      "status": "Pass",
      "check": "zero is accepted by Order implementation",
      "actual": "0"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 201
2. POST /api/orders → HTTP 200

### INPUT-quantity--1 — Pass

```json
{
  "after": {
    "orders": 28,
    "stock": 1000,
    "payments": 28
  },
  "expected": "400; unchanged orders/payments/stock",
  "before": {
    "orders": 28,
    "stock": 1000,
    "payments": 28
  },
  "input": {
    "variantId": 30,
    "quantity": -1,
    "addressId": 1,
    "paymentMethod": "COD"
  },
  "actual": {
    "message": "quantity: Số lượng tối thiểu là 1",
    "status": 400,
    "timestamp": "2026-08-31T22:06:18.2354364"
  },
  "id": "INPUT-quantity--1",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 400,
      "case": "INPUT-quantity--1",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 400
    },
    {
      "expected": {
        "orders": 28,
        "stock": 1000,
        "payments": 28
      },
      "case": "INPUT-quantity--1",
      "status": "Pass",
      "check": "no DB mutation",
      "actual": {
        "orders": 28,
        "stock": 1000,
        "payments": 28
      }
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/buy-now → HTTP 400

### INPUT-quantity-0 — Pass

```json
{
  "after": {
    "orders": 28,
    "stock": 1000,
    "payments": 28
  },
  "expected": "400; unchanged orders/payments/stock",
  "before": {
    "orders": 28,
    "stock": 1000,
    "payments": 28
  },
  "input": {
    "variantId": 31,
    "quantity": 0,
    "addressId": 1,
    "paymentMethod": "COD"
  },
  "actual": {
    "message": "quantity: Số lượng tối thiểu là 1",
    "status": 400,
    "timestamp": "2026-08-31T22:06:18.2465463"
  },
  "id": "INPUT-quantity-0",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 400,
      "case": "INPUT-quantity-0",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 400
    },
    {
      "expected": {
        "orders": 28,
        "stock": 1000,
        "payments": 28
      },
      "case": "INPUT-quantity-0",
      "status": "Pass",
      "check": "no DB mutation",
      "actual": {
        "orders": 28,
        "stock": 1000,
        "payments": 28
      }
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/buy-now → HTTP 400

### INPUT-empty-cart — Pass

```json
{
  "after": {
    "orders": 28,
    "stock": 1000,
    "payments": 28
  },
  "expected": "400; no zero-item order",
  "before": {
    "orders": 28,
    "stock": 1000,
    "payments": 28
  },
  "input": {
    "cartItemIds": [],
    "paymentMethod": "COD",
    "addressId": 1
  },
  "actual": {
    "message": "cartItemIds: Phải chọn ít nhất 1 sản phẩm",
    "status": 400,
    "timestamp": "2026-08-31T22:06:18.2535459"
  },
  "id": "INPUT-empty-cart",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 400,
      "case": "INPUT-empty-cart",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 400
    },
    {
      "expected": {
        "orders": 28,
        "stock": 1000,
        "payments": 28
      },
      "case": "INPUT-empty-cart",
      "status": "Pass",
      "check": "no DB mutation",
      "actual": {
        "orders": 28,
        "stock": 1000,
        "payments": 28
      }
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders → HTTP 400

### INPUT-percent-over-100 — Pass

```json
{
  "input": {
    "isActive": true,
    "endsAt": "2026-09-02T22:06:18.2565522",
    "type": "PERCENT",
    "minOrderValue": 0,
    "startsAt": "2026-08-30T22:06:18.2565522",
    "name": "QLPT293 OVER100",
    "freeShipping": true,
    "target": "PUBLIC",
    "value": 100.01,
    "code": "OVER100"
  },
  "actual": {
    "message": "Giảm theo % không được vượt quá 100",
    "status": 400,
    "timestamp": "2026-08-31T22:06:18.263503"
  },
  "expected": "400; percent >100 prevented at admin API",
  "id": "INPUT-percent-over-100",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 400,
      "case": "INPUT-percent-over-100",
      "status": "Pass",
      "check": "POST /api/admin/promotions status",
      "actual": 400
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/admin/promotions → HTTP 400

### BUY-client-money-tampering — Pass

```json
{
  "input": {
    "variantId": 32,
    "quantity": 1,
    "addressId": 1,
    "paymentMethod": "COD",
    "totalAmount": -0.01,
    "subtotal": 0,
    "discountAmount": 999999,
    "shippingFee": -50000
  },
  "expected": "Backend computes 80000 independently",
  "db": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 29
  },
  "actual": {
    "id": 29,
    "orderCode": "GJH-B0D0867C",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "COD",
    "subtotal": 50000.0,
    "discountAmount": 0,
    "shippingFee": 30000,
    "totalAmount": 80000.0,
    "promoCode": null,
    "note": null,
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 29,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 32,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": null,
    "createdAt": "2026-08-31T22:06:18.2729028",
    "updatedAt": "2026-08-31T22:06:18.2729028"
  },
  "id": "BUY-client-money-tampering",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "BUY-client-money-tampering",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "80000",
      "case": "BUY-client-money-tampering",
      "status": "Pass",
      "check": "client money ignored",
      "actual": "8E+4"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/buy-now → HTTP 200

### CART-client-money-tampering — Pass

```json
{
  "input": {
    "cartItemIds": [
      15
    ],
    "addressId": 1,
    "paymentMethod": "COD",
    "totalAmount": -0.01,
    "subtotal": 0,
    "discountAmount": 999999,
    "shippingFee": -50000
  },
  "expected": "Backend computes 80000 independently",
  "db": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 30
  },
  "actual": {
    "id": 30,
    "orderCode": "GJH-4F463A0D",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "COD",
    "subtotal": 50000.0,
    "discountAmount": 0,
    "shippingFee": 30000,
    "totalAmount": 80000.0,
    "promoCode": null,
    "note": null,
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 30,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 33,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.0,
        "quantity": 1,
        "subtotal": 50000.0,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": null,
    "createdAt": "2026-08-31T22:06:18.2883025",
    "updatedAt": "2026-08-31T22:06:18.2883025"
  },
  "id": "CART-client-money-tampering",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "CART-client-money-tampering",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "80000",
      "case": "CART-client-money-tampering",
      "status": "Pass",
      "check": "client money ignored",
      "actual": "8E+4"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders → HTTP 200

### SEPAY-BANK_TRANSFER-delta--1 — Pass

```json
{
  "input": {
    "transferType": "in",
    "transferAmount": 79999.99,
    "content": "GJH-CBD128E9",
    "referenceCode": "SEPAY-BANK_TRANSFER-delta--1"
  },
  "expected": "PENDING; amount remains 80000",
  "db": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 31
  },
  "actual": {
    "message": "OK"
  },
  "id": "SEPAY-BANK_TRANSFER-delta--1",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "SEPAY-BANK_TRANSFER-delta--1",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": 200,
      "case": "SEPAY-BANK_TRANSFER-delta--1",
      "status": "Pass",
      "check": "POST /api/webhooks/sepay status",
      "actual": 200
    },
    {
      "expected": "PENDING",
      "case": "SEPAY-BANK_TRANSFER-delta--1",
      "status": "Pass",
      "check": "SePay threshold",
      "actual": "PENDING"
    },
    {
      "expected": "80000",
      "case": "SEPAY-BANK_TRANSFER-delta--1",
      "status": "Pass",
      "check": "payment amount unchanged",
      "actual": "80000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/buy-now → HTTP 200
2. POST /api/webhooks/sepay → HTTP 200

### SEPAY-BANK_TRANSFER-delta-0 — Pass

```json
{
  "input": {
    "transferType": "in",
    "transferAmount": 80000.0,
    "content": "GJH-F8C2D8FA",
    "referenceCode": "SEPAY-BANK_TRANSFER-delta-0"
  },
  "expected": "PAID; amount remains 80000",
  "db": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 32
  },
  "actual": {
    "message": "OK"
  },
  "id": "SEPAY-BANK_TRANSFER-delta-0",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "SEPAY-BANK_TRANSFER-delta-0",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": 200,
      "case": "SEPAY-BANK_TRANSFER-delta-0",
      "status": "Pass",
      "check": "POST /api/webhooks/sepay status",
      "actual": 200
    },
    {
      "expected": "PAID",
      "case": "SEPAY-BANK_TRANSFER-delta-0",
      "status": "Pass",
      "check": "SePay threshold",
      "actual": "PAID"
    },
    {
      "expected": "80000",
      "case": "SEPAY-BANK_TRANSFER-delta-0",
      "status": "Pass",
      "check": "payment amount unchanged",
      "actual": "80000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/buy-now → HTTP 200
2. POST /api/webhooks/sepay → HTTP 200

### SEPAY-BANK_TRANSFER-delta-1 — Pass

```json
{
  "input": {
    "transferType": "in",
    "transferAmount": 80000.01,
    "content": "GJH-F31B484D",
    "referenceCode": "SEPAY-BANK_TRANSFER-delta-1"
  },
  "expected": "PAID; amount remains 80000",
  "db": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 33
  },
  "actual": {
    "message": "OK"
  },
  "id": "SEPAY-BANK_TRANSFER-delta-1",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "SEPAY-BANK_TRANSFER-delta-1",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": 200,
      "case": "SEPAY-BANK_TRANSFER-delta-1",
      "status": "Pass",
      "check": "POST /api/webhooks/sepay status",
      "actual": 200
    },
    {
      "expected": "PAID",
      "case": "SEPAY-BANK_TRANSFER-delta-1",
      "status": "Pass",
      "check": "SePay threshold",
      "actual": "PAID"
    },
    {
      "expected": "80000",
      "case": "SEPAY-BANK_TRANSFER-delta-1",
      "status": "Pass",
      "check": "payment amount unchanged",
      "actual": "80000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/buy-now → HTTP 200
2. POST /api/webhooks/sepay → HTTP 200

### SEPAY-MOMO-delta--1 — Pass

```json
{
  "input": {
    "transferType": "in",
    "transferAmount": 79999.99,
    "content": "GJH-721061D9",
    "referenceCode": "SEPAY-MOMO-delta--1"
  },
  "expected": "PENDING; amount remains 80000",
  "db": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.00",
    "orderId": 34
  },
  "actual": {
    "message": "OK"
  },
  "id": "SEPAY-MOMO-delta--1",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "SEPAY-MOMO-delta--1",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": 200,
      "case": "SEPAY-MOMO-delta--1",
      "status": "Pass",
      "check": "POST /api/webhooks/sepay status",
      "actual": 200
    },
    {
      "expected": "PENDING",
      "case": "SEPAY-MOMO-delta--1",
      "status": "Pass",
      "check": "SePay threshold",
      "actual": "PENDING"
    },
    {
      "expected": "80000",
      "case": "SEPAY-MOMO-delta--1",
      "status": "Pass",
      "check": "payment amount unchanged",
      "actual": "80000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/buy-now → HTTP 200
2. POST /api/webhooks/sepay → HTTP 200

### SEPAY-MOMO-delta-0 — Pass

```json
{
  "input": {
    "transferType": "in",
    "transferAmount": 80000.0,
    "content": "GJH-A0667747",
    "referenceCode": "SEPAY-MOMO-delta-0"
  },
  "expected": "PAID; amount remains 80000",
  "db": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 35
  },
  "actual": {
    "message": "OK"
  },
  "id": "SEPAY-MOMO-delta-0",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "SEPAY-MOMO-delta-0",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": 200,
      "case": "SEPAY-MOMO-delta-0",
      "status": "Pass",
      "check": "POST /api/webhooks/sepay status",
      "actual": 200
    },
    {
      "expected": "PAID",
      "case": "SEPAY-MOMO-delta-0",
      "status": "Pass",
      "check": "SePay threshold",
      "actual": "PAID"
    },
    {
      "expected": "80000",
      "case": "SEPAY-MOMO-delta-0",
      "status": "Pass",
      "check": "payment amount unchanged",
      "actual": "80000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/buy-now → HTTP 200
2. POST /api/webhooks/sepay → HTTP 200

### SEPAY-MOMO-delta-1 — Pass

```json
{
  "input": {
    "transferType": "in",
    "transferAmount": 80000.01,
    "content": "GJH-93A4BC74",
    "referenceCode": "SEPAY-MOMO-delta-1"
  },
  "expected": "PAID; amount remains 80000",
  "db": {
    "subtotal": "50000.00",
    "discount_amount": "0.00",
    "shipping_fee": "30000.00",
    "total_amount": "80000.00",
    "amount": "80000.00",
    "payment_status": "PAID",
    "payment_record_status": "SUCCESS",
    "items_subtotal": "50000.00",
    "orderId": 36
  },
  "actual": {
    "message": "OK"
  },
  "id": "SEPAY-MOMO-delta-1",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "SEPAY-MOMO-delta-1",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": 200,
      "case": "SEPAY-MOMO-delta-1",
      "status": "Pass",
      "check": "POST /api/webhooks/sepay status",
      "actual": 200
    },
    {
      "expected": "PAID",
      "case": "SEPAY-MOMO-delta-1",
      "status": "Pass",
      "check": "SePay threshold",
      "actual": "PAID"
    },
    {
      "expected": "80000",
      "case": "SEPAY-MOMO-delta-1",
      "status": "Pass",
      "check": "payment amount unchanged",
      "actual": "80000.00"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/buy-now → HTTP 200
2. POST /api/webhooks/sepay → HTTP 200

### BUY-negative-GHN-fault-injection — Pass

```json
{
  "note": "Negative total persistence is a conditional risk, not a confirmed normal-flow business-boundary violation",
  "db": {
    "subtotal": "50000.99",
    "discount_amount": "0.00",
    "shipping_fee": "-50001.00",
    "total_amount": "-0.01",
    "amount": "-0.01",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.99",
    "orderId": 37
  },
  "actual": {
    "id": 37,
    "orderCode": "GJH-05B1E56D",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "COD",
    "subtotal": 50000.99,
    "discountAmount": 0,
    "shippingFee": -50001,
    "totalAmount": -0.01,
    "promoCode": null,
    "note": null,
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 37,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 40,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.99,
        "quantity": 1,
        "subtotal": 50000.99,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": null,
    "createdAt": "2026-08-31T22:06:18.4107638",
    "updatedAt": "2026-08-31T22:06:18.4107638"
  },
  "layerNote": "Robustness characterization; GHN stub=-50001, price=50000.99, quantity=1; not a normal carrier response",
  "input": {
    "variantId": 40,
    "quantity": 1,
    "addressId": 2,
    "paymentMethod": "COD"
  },
  "expected": "Observe -0.01 persistence; no business min inferred",
  "id": "BUY-negative-GHN-fault-injection",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "BUY-negative-GHN-fault-injection",
      "status": "Pass",
      "check": "POST /api/orders/buy-now status",
      "actual": 200
    },
    {
      "expected": "-0.01",
      "case": "BUY-negative-GHN-fault-injection",
      "status": "Pass",
      "check": "characterize negative total from injected carrier fee",
      "actual": "-0.01"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders/buy-now → HTTP 200

### CART-negative-GHN-fault-injection — Pass

```json
{
  "note": "Negative total persistence is a conditional risk, not a confirmed normal-flow business-boundary violation",
  "db": {
    "subtotal": "50000.99",
    "discount_amount": "0.00",
    "shipping_fee": "-50001.00",
    "total_amount": "-0.01",
    "amount": "-0.01",
    "payment_status": "PENDING",
    "payment_record_status": "PENDING",
    "items_subtotal": "50000.99",
    "orderId": 38
  },
  "actual": {
    "id": 38,
    "orderCode": "GJH-3DD1A1AD",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "COD",
    "subtotal": 50000.99,
    "discountAmount": 0,
    "shippingFee": -50001,
    "totalAmount": -0.01,
    "promoCode": null,
    "note": null,
    "shippingAddress": {
      "fullName": "Khach kiem thu",
      "phone": "0900000000",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường kiểm thử",
      "detail": "Test only - do not ship"
    },
    "items": [
      {
        "id": 38,
        "productId": 1,
        "productSlug": "bva-juice",
        "variantId": 41,
        "productName": "BVA juice",
        "variantName": "",
        "imageUrl": null,
        "unitPrice": 50000.99,
        "quantity": 1,
        "subtotal": 50000.99,
        "hasReviewed": false
      }
    ],
    "cancelReason": null,
    "cancelledBy": null,
    "expiresAt": null,
    "createdAt": "2026-08-31T22:06:18.4277004",
    "updatedAt": "2026-08-31T22:06:18.4277004"
  },
  "layerNote": "Robustness characterization; GHN stub=-50001, price=50000.99, quantity=1; not a normal carrier response",
  "input": {
    "cartItemIds": [
      16
    ],
    "addressId": 2,
    "paymentMethod": "COD"
  },
  "expected": "Observe -0.01 persistence; no business min inferred",
  "id": "CART-negative-GHN-fault-injection",
  "layer": "HTTP API + H2 MySQL mode; carrier stub; NOT production MySQL",
  "status": "Pass",
  "checks": [
    {
      "expected": 200,
      "case": "CART-negative-GHN-fault-injection",
      "status": "Pass",
      "check": "POST /api/orders status",
      "actual": 200
    },
    {
      "expected": "-0.01",
      "case": "CART-negative-GHN-fault-injection",
      "status": "Pass",
      "check": "characterize negative total from injected carrier fee",
      "actual": "-0.01"
    }
  ]
}
```

Các bước HTTP đã thực thi theo thứ tự:

1. POST /api/orders → HTTP 200

### MYSQL-DECIMAL--0.01 — Blocked

```json
{
  "actual": "MySQL credentials unavailable; H2 result must not substitute for MySQL.",
  "id": "MYSQL-DECIMAL--0.01",
  "status": "Blocked",
  "input": "-0.01",
  "layer": "MySQL storage",
  "expected": "Exact storage or overflow rejection on actual MySQL"
}
```

### MYSQL-DECIMAL-0 — Blocked

```json
{
  "actual": "MySQL credentials unavailable; H2 result must not substitute for MySQL.",
  "id": "MYSQL-DECIMAL-0",
  "status": "Blocked",
  "input": "0",
  "layer": "MySQL storage",
  "expected": "Exact storage or overflow rejection on actual MySQL"
}
```

### MYSQL-DECIMAL-0.01 — Blocked

```json
{
  "actual": "MySQL credentials unavailable; H2 result must not substitute for MySQL.",
  "id": "MYSQL-DECIMAL-0.01",
  "status": "Blocked",
  "input": "0.01",
  "layer": "MySQL storage",
  "expected": "Exact storage or overflow rejection on actual MySQL"
}
```

### MYSQL-DECIMAL-9999999999.98 — Blocked

```json
{
  "actual": "MySQL credentials unavailable; H2 result must not substitute for MySQL.",
  "id": "MYSQL-DECIMAL-9999999999.98",
  "status": "Blocked",
  "input": "9999999999.98",
  "layer": "MySQL storage",
  "expected": "Exact storage or overflow rejection on actual MySQL"
}
```

### MYSQL-DECIMAL-9999999999.99 — Blocked

```json
{
  "actual": "MySQL credentials unavailable; H2 result must not substitute for MySQL.",
  "id": "MYSQL-DECIMAL-9999999999.99",
  "status": "Blocked",
  "input": "9999999999.99",
  "layer": "MySQL storage",
  "expected": "Exact storage or overflow rejection on actual MySQL"
}
```

### MYSQL-DECIMAL-10000000000.00 — Blocked

```json
{
  "actual": "MySQL credentials unavailable; H2 result must not substitute for MySQL.",
  "id": "MYSQL-DECIMAL-10000000000.00",
  "status": "Blocked",
  "input": "10000000000.00",
  "layer": "MySQL storage",
  "expected": "Exact storage or overflow rejection on actual MySQL"
}
```

### BUY-upper-9999999999.98 — Blocked

```json
{
  "id": "BUY-upper-9999999999.98",
  "expected": "Assess storage boundary without unrealistic sales data",
  "layer": "System/API",
  "status": "Blocked",
  "actual": "No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed."
}
```

### BUY-upper-9999999999.99 — Blocked

```json
{
  "id": "BUY-upper-9999999999.99",
  "expected": "Assess storage boundary without unrealistic sales data",
  "layer": "System/API",
  "status": "Blocked",
  "actual": "No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed."
}
```

### BUY-upper-10000000000.00 — Blocked

```json
{
  "id": "BUY-upper-10000000000.00",
  "expected": "Assess storage boundary without unrealistic sales data",
  "layer": "System/API",
  "status": "Blocked",
  "actual": "No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed."
}
```

### CART-upper-9999999999.98 — Blocked

```json
{
  "id": "CART-upper-9999999999.98",
  "expected": "Assess storage boundary without unrealistic sales data",
  "layer": "System/API",
  "status": "Blocked",
  "actual": "No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed."
}
```

### CART-upper-9999999999.99 — Blocked

```json
{
  "id": "CART-upper-9999999999.99",
  "expected": "Assess storage boundary without unrealistic sales data",
  "layer": "System/API",
  "status": "Blocked",
  "actual": "No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed."
}
```

### CART-upper-10000000000.00 — Blocked

```json
{
  "id": "CART-upper-10000000000.00",
  "expected": "Assess storage boundary without unrealistic sales data",
  "layer": "System/API",
  "status": "Blocked",
  "actual": "No realistic catalog/stock fixture produces this total. No huge order fabricated. Separate MySQL DECIMAL probes executed."
}
```

### LIVE-GHN — Blocked

```json
{
  "id": "LIVE-GHN",
  "expected": "Real GHN quote and carrier geography",
  "layer": "External integration",
  "status": "Blocked",
  "actual": "Not contacted; deterministic GHN stub is not evidence of live carrier behavior."
}
```

### LIVE-VNPAY — Blocked

```json
{
  "id": "LIVE-VNPAY",
  "expected": "Gateway accepts amount and delivers callbacks",
  "layer": "External integration",
  "status": "Blocked",
  "actual": "Only local create-url and correctly signed simulated IPN/Return executed; no real payment."
}
```
