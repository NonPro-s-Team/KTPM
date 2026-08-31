package com.greenjuicehub.backend.service.sepay.impl;

import com.greenjuicehub.backend.dto.sepay.request.SePayWebhookRequest;
import com.greenjuicehub.backend.entity.Order;
import com.greenjuicehub.backend.entity.Payment;
import com.greenjuicehub.backend.repository.OrderRepository;
import com.greenjuicehub.backend.repository.PaymentRepository;
import com.greenjuicehub.backend.service.sepay.ISePayWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class SePayWebhookServiceImpl implements ISePayWebhookService {
    private static final Pattern ORDER_CODE = Pattern.compile("GJH-[A-Z0-9]{8}");

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public void handlePayment(SePayWebhookRequest request) {

        // 1. Chỉ xử lý tiền vào
        if (!"in".equals(request.getTransferType()) || request.getTransferAmount() == null
                || request.getTransferAmount().signum() <= 0) {
            log.info("SePay: bỏ qua giao dịch không phải tiền vào hợp lệ");
            return;
        }

        // 2. Extract orderCode từ content
        String orderCode = extractOrderCode(request.getContent());
        if (orderCode == null) {
            log.info("SePay: không tìm thấy mã đơn hàng trong nội dung chuyển khoản");
            return;
        }

        // 3. Tìm đơn hàng
        Order order = orderRepository.findByOrderCodeForUpdate(orderCode).orElse(null);
        if (order == null) {
            log.warn("SePay: không tìm thấy đơn hàng orderCode={}", orderCode);
            return;
        }

        // 4. Đã thanh toán rồi thì bỏ qua
        if (order.getPaymentStatus() != Order.PaymentStatus.PENDING || order.getStatus() == Order.OrderStatus.CANCELLED) {
            log.info("SePay: đơn {} đã thanh toán trước đó, bỏ qua", orderCode);
            return;
        }

        // 5. Kiểm tra số tiền
        if (request.getTransferAmount().compareTo(order.getTotalAmount()) < 0) {
            log.warn("SePay: đơn {} thiếu tiền - cần {} nhưng nhận {}",
                    orderCode, order.getTotalAmount(), request.getTransferAmount());
            return;
        }

        // 6. Cập nhật Payment
        Payment payment = paymentRepository
                .findTopByOrderIdOrderByCreatedAtDesc(order.getId())
                .orElse(null);
        if (payment == null) {
            log.error("SePay: không tìm thấy payment cho đơn {}", orderCode);
            return;
        }

        //6. Check sepay đơn Momo hoặc là đơn Bank
        if (payment.getMethod() != Payment.PaymentMethod.BANK_TRANSFER
                && payment.getMethod() != Payment.PaymentMethod.MOMO) {
            log.warn("SePay: đơn {} không phải BANK_TRANSFER/MOMO, bỏ qua", orderCode);
            return;
        }

        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
        payment.setTransactionId(request.getReferenceCode());
        paymentRepository.save(payment);

        // 7. Cập nhật Order
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        orderRepository.save(order);

        log.info("SePay: xác nhận thanh toán thành công - orderCode={}, amount={}",
                orderCode, request.getTransferAmount());
    }

    // ── Helper: tìm pattern GJH-XXXXXXXX trong content ──────────────────────
    private String extractOrderCode(String content) {
        if (content == null)
            return null;
        Matcher matcher = ORDER_CODE.matcher(content.toUpperCase(Locale.ROOT));
        return matcher.find() ? matcher.group() : null;
    }
}
