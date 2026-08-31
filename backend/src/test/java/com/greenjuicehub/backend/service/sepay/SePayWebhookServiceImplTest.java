package com.greenjuicehub.backend.service.sepay;

import com.greenjuicehub.backend.dto.sepay.request.SePayWebhookRequest;
import com.greenjuicehub.backend.entity.Order;
import com.greenjuicehub.backend.entity.Payment;
import com.greenjuicehub.backend.repository.OrderRepository;
import com.greenjuicehub.backend.repository.PaymentRepository;
import com.greenjuicehub.backend.service.sepay.impl.SePayWebhookServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SePayWebhookServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private PaymentRepository paymentRepository;
    private SePayWebhookServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new SePayWebhookServiceImpl(orderRepository, paymentRepository);
    }

    @Test
    void ignoresOutgoingTransfer() {
        SePayWebhookRequest request = request("out", "GJH-ABC12345", "150000");

        service.handlePayment(request);

        verify(orderRepository, never()).findByOrderCodeForUpdate("GJH-ABC12345");
    }

    @Test
    void ignoresContentWithoutOrderCode() {
        SePayWebhookRequest request = request("in", "payment without order", "150000");

        service.handlePayment(request);

        verify(orderRepository, never()).findByOrderCodeForUpdate(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void rejectsUnderpayment() {
        Order order = order(Order.PaymentStatus.PENDING);
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order));

        service.handlePayment(request("in", "pay gjh-abc12345 now", "149999"));

        verify(paymentRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(orderRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void ignoresUnsupportedPaymentMethod() {
        Order order = order(Order.PaymentStatus.PENDING);
        Payment payment = payment(order, Payment.PaymentMethod.COD);
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order));
        when(paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(11L)).thenReturn(Optional.of(payment));

        service.handlePayment(request("in", "GJH-ABC12345", "150000"));

        verify(paymentRepository, never()).save(payment);
        verify(orderRepository, never()).save(order);
    }

    @Test
    void marksBankTransferPaidAndIsIdempotent() {
        Order order = order(Order.PaymentStatus.PENDING);
        Payment payment = payment(order, Payment.PaymentMethod.BANK_TRANSFER);
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order));
        when(paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(11L)).thenReturn(Optional.of(payment));
        SePayWebhookRequest request = request("in", "Thanh toan GJH-ABC12345", "150000");

        service.handlePayment(request);

        assertEquals(Order.PaymentStatus.PAID, order.getPaymentStatus());
        assertEquals(Payment.PaymentStatus.SUCCESS, payment.getStatus());
        assertEquals("REF-1", payment.getTransactionId());
        assertNotNull(payment.getPaidAt());
        verify(paymentRepository).save(payment);
        verify(orderRepository).save(order);

        service.handlePayment(request);
        verify(paymentRepository, org.mockito.Mockito.times(1)).save(payment);
    }

    private Order order(Order.PaymentStatus status) {
        return Order.builder().id(11L).orderCode("GJH-ABC12345")
                .totalAmount(new BigDecimal("150000")).paymentStatus(status).build();
    }

    @Test
    void malformedAmountIsIgnoredBeforeDatabaseAccess() {
        SePayWebhookRequest request = request("in", "GJH-ABC12345", "0");
        service.handlePayment(request);
        request.setTransferAmount(null);
        service.handlePayment(request);
        org.mockito.Mockito.verifyNoInteractions(orderRepository, paymentRepository);
    }

    @Test
    void cancelledOrderCannotBeMarkedPaidByWebhook() {
        Order order = order(Order.PaymentStatus.PENDING);
        order.setStatus(Order.OrderStatus.CANCELLED);
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order));
        service.handlePayment(request("in", "GJH-ABC12345", "150000"));
        assertEquals(Order.PaymentStatus.PENDING, order.getPaymentStatus());
        verify(orderRepository, never()).save(order);
        org.mockito.Mockito.verifyNoInteractions(paymentRepository);
    }

    private Payment payment(Order order, Payment.PaymentMethod method) {
        return Payment.builder().id(21L).order(order).method(method)
                .amount(order.getTotalAmount()).status(Payment.PaymentStatus.PENDING).build();
    }

    private SePayWebhookRequest request(String type, String content, String amount) {
        SePayWebhookRequest request = new SePayWebhookRequest();
        request.setTransferType(type);
        request.setContent(content);
        request.setTransferAmount(new BigDecimal(amount));
        request.setReferenceCode("REF-1");
        return request;
    }
}
