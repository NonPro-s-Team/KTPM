package com.greenjuicehub.backend.service.payment.impl;

import com.greenjuicehub.backend.config.properties.VnpayProperties;
import com.greenjuicehub.backend.entity.Order;
import com.greenjuicehub.backend.entity.Payment;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.repository.OrderRepository;
import com.greenjuicehub.backend.repository.PaymentRepository;
import com.greenjuicehub.backend.service.payment.IVnpayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnpayServiceImpl implements IVnpayService {
    private static final String TXN_REF = "vnp_TxnRef";
    private static final String SECURE_HASH = "vnp_SecureHash";
    private static final String AMOUNT = "vnp_Amount";
    private static final String RESPONSE_CODE = "vnp_ResponseCode";
    private static final String TRANSACTION_NO = "vnp_TransactionNo";
    private static final String TRANSACTION_STATUS = "vnp_TransactionStatus";
    private static final String TMN_CODE = "vnp_TmnCode";
    private static final ZoneId PAYMENT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter PAYMENT_DATE = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private final VnpayProperties vnpayProperties;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public String createPaymentUrl(Long userId, Long orderId, String clientIp) {
        if (userId == null || orderId == null || orderId <= 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thông tin đơn hàng không hợp lệ");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        if (order.getUser() == null || !Objects.equals(order.getUser().getId(), userId)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
        }
        if (order.getPaymentStatus() != Order.PaymentStatus.PENDING || order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn hàng không còn chờ thanh toán");
        }
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin thanh toán"));
        if (payment.getMethod() != Payment.PaymentMethod.VNPAY) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn hàng này không dùng phương thức VNPay");
        }
        long amount = order.getTotalAmount().movePointRight(2).longValueExact();
        ZonedDateTime now = ZonedDateTime.now(PAYMENT_ZONE);
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put(TMN_CODE, vnpayProperties.getTmnCode());
        params.put(AMOUNT, String.valueOf(amount));
        params.put("vnp_CurrCode", "VND");
        params.put(TXN_REF, order.getOrderCode());
        params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnpayProperties.getReturnUrl());
        params.put("vnp_IpAddr", clientIp);
        params.put("vnp_CreateDate", now.format(PAYMENT_DATE));
        params.put("vnp_ExpireDate", now.plusMinutes(15).format(PAYMENT_DATE));
        String query = canonicalQuery(params);
        return vnpayProperties.getPayUrl() + "?" + query + "&" + SECURE_HASH + "="
                + hmacSHA512(vnpayProperties.getHashSecret(), query);
    }

    @Override
    @Transactional
    public String processIpn(Map<String, String> params) {
        if (!hasValidSignature(params)) return "97";
        Order order = orderRepository.findByOrderCodeForUpdate(params.get(TXN_REF)).orElse(null);
        if (order == null) return "01";
        if (!amountMatches(params.get(AMOUNT), order.getTotalAmount())) return "04";
        if (order.getStatus() == Order.OrderStatus.CANCELLED) return "02";
        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) return "00";
        if (order.getPaymentStatus() != Order.PaymentStatus.PENDING) return "02";
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId()).orElse(null);
        if (payment == null || payment.getMethod() != Payment.PaymentMethod.VNPAY) return "01";
        applyIpnResult(params, order, payment);
        return "00";
    }

    private void applyIpnResult(Map<String, String> params, Order order, Payment payment) {
        if (isSuccessfulTransaction(params)) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionId(params.get(TRANSACTION_NO));
            payment.setPaidAt(LocalDateTime.now(PAYMENT_ZONE));
            order.setPaymentStatus(Order.PaymentStatus.PAID);
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setNote("VNPay responseCode=" + params.get(RESPONSE_CODE));
        }
        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    /** Browser return is display-only; only the authenticated IPN changes payment state. */
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> processReturn(Map<String, String> params) {
        boolean valid = hasValidSignature(params);
        Order order = valid ? orderRepository.findByOrderCode(params.get(TXN_REF)).orElse(null) : null;
        boolean success = isValidReturn(params, order);
        Map<String, Object> result = new HashMap<>();
        result.put("success", success);
        result.put("orderCode", valid ? params.get(TXN_REF) : null);
        result.put("orderId", order != null ? order.getId() : null);
        result.put("responseCode", valid ? params.get(RESPONSE_CODE) : null);
        result.put("confirmed", success && order.getPaymentStatus() == Order.PaymentStatus.PAID);
        result.put("message", success ? "Giao dịch hợp lệ; trạng thái đơn hàng được xác nhận qua IPN"
                : "Thanh toán thất bại hoặc dữ liệu không hợp lệ");
        return result;
    }

    private boolean isValidReturn(Map<String, String> params, Order order) {
        if (order == null || order.getStatus() == Order.OrderStatus.CANCELLED || !isSuccessfulTransaction(params)
                || !amountMatches(params.get(AMOUNT), order.getTotalAmount())) return false;
        return paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId())
                .filter(payment -> payment.getMethod() == Payment.PaymentMethod.VNPAY).isPresent();
    }

    private boolean hasValidSignature(Map<String, String> params) {
        if (params == null || params.values().stream().anyMatch(Objects::isNull)) return false;
        String received = params.get(SECURE_HASH);
        if (received == null || !received.matches("[a-fA-F0-9]{128}")) return false;
        if (!Objects.equals(vnpayProperties.getTmnCode(), params.get(TMN_CODE))) return false;
        if (params.get(TXN_REF) == null || params.get(TRANSACTION_NO) == null) return false;
        Map<String, String> signed = new TreeMap<>(params);
        signed.remove(SECURE_HASH);
        signed.remove("vnp_SecureHashType");
        byte[] expected = HexFormat.of().parseHex(hmacSHA512(vnpayProperties.getHashSecret(), canonicalQuery(signed)));
        return MessageDigest.isEqual(expected, HexFormat.of().parseHex(received));
    }

    private boolean isSuccessfulTransaction(Map<String, String> params) {
        return "00".equals(params.get(RESPONSE_CODE)) && "00".equals(params.get(TRANSACTION_STATUS));
    }

    private boolean amountMatches(String amount, BigDecimal expected) {
        if (amount == null || !amount.matches("\\d{1,18}") || expected == null) return false;
        BigDecimal received = new BigDecimal(amount).movePointLeft(2);
        return received.signum() > 0 && received.compareTo(expected) == 0;
    }

    private String canonicalQuery(Map<String, String> params) {
        return new TreeMap<>(params).entrySet().stream()
                .map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII) + "="
                        + URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII))
                .collect(Collectors.joining("&"));
    }

    @Override
    public String getClientIp(HttpServletRequest request) {
        // Forwarded headers are untrusted unless an explicitly configured proxy validates them.
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Lỗi khi tạo HMAC-SHA512", e);
        }
    }
}
