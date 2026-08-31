package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.service.payment.IVnpayService;
import com.greenjuicehub.backend.dto.payment.request.CreatePaymentRequest;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final IVnpayService vnpayService;

    // ─────────────────────────────────────────────────────────────────────────
    // VNPAY — TẠO URL THANH TOÁN
    // POST /api/payment/vnpay/create-url
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/vnpay/create-url")
    public ResponseEntity<Map<String, String>> createVnpayUrl(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CreatePaymentRequest body,
            HttpServletRequest request
    ) {
        Long orderId = body.getOrderId();
        String clientIp = vnpayService.getClientIp(request);
        String paymentUrl = vnpayService.createPaymentUrl(userId, orderId, clientIp);

        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VNPAY — IPN (server-to-server từ VNPay, không cần auth)
    // GET /api/payment/vnpay/ipn?vnp_TxnRef=...&vnp_SecureHash=...&...
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> params) {
        String resultCode = vnpayService.processIpn(params);
        return ResponseEntity.ok(Map.of(
                "RspCode", resultCode,
                "Message", "00".equals(resultCode) ? "Confirm Success" : "Confirm Fail"
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VNPAY — RETURN URL (browser redirect sau khi thanh toán)
    // GET /api/payment/vnpay/return?vnp_TxnRef=...&vnp_ResponseCode=...&...
    //
    // NOTE: Endpoint này không redirect trực tiếp vì FE ở Vercel (khác domain).
    // FE sẽ tự gọi endpoint này từ trang /payment/vnpay/result để verify kết quả.
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/vnpay/return")
    public ResponseEntity<Map<String, Object>> vnpayReturn(@RequestParam Map<String, String> params) {
        Map<String, Object> result = vnpayService.processReturn(params);
        return ResponseEntity.ok(result);
    }
}
