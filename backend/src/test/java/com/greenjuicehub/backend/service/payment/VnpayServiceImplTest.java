package com.greenjuicehub.backend.service.payment;

import com.greenjuicehub.backend.config.properties.VnpayProperties;
import com.greenjuicehub.backend.entity.Order;
import com.greenjuicehub.backend.entity.Payment;
import com.greenjuicehub.backend.entity.User;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.repository.OrderRepository;
import com.greenjuicehub.backend.repository.PaymentRepository;
import com.greenjuicehub.backend.service.payment.impl.VnpayServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Map;
import java.util.HashMap;
import java.util.HexFormat;
import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@ExtendWith(MockitoExtension.class)
class VnpayServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private PaymentRepository paymentRepository;
    private VnpayServiceImpl service;

    @BeforeEach
    void setUp() {
        VnpayProperties properties = new VnpayProperties();
        properties.setTmnCode("TESTCODE");
        properties.setHashSecret("test-secret");
        properties.setPayUrl("https://sandbox.example/pay");
        properties.setReturnUrl("http://localhost/payment/vnpay/result");
        service = new VnpayServiceImpl(properties, orderRepository, paymentRepository);
    }

    @Test
    void rejectsOrderOwnedByAnotherCustomer() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order(99L)));

        assertThrows(AppException.class, () -> service.createPaymentUrl(42L, 10L, "127.0.0.1"));
    }

    @Test
    void rejectsPaidOrder() {
        Order order = order(42L);
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        assertThrows(AppException.class, () -> service.createPaymentUrl(42L, 10L, "127.0.0.1"));
    }

    @Test
    void rejectsNonVnpayPayment() {
        Order order = order(42L);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.of(
                Payment.builder().order(order).method(Payment.PaymentMethod.COD).build()));

        assertThrows(AppException.class, () -> service.createPaymentUrl(42L, 10L, "127.0.0.1"));
    }

    @Test
    void createsSignedUrlForOwnedVnpayOrder() {
        Order order = order(42L);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.of(
                Payment.builder().order(order).method(Payment.PaymentMethod.VNPAY).build()));

        String url = service.createPaymentUrl(42L, 10L, "127.0.0.1");

        assertTrue(url.startsWith("https://sandbox.example/pay?"));
        assertTrue(url.contains("vnp_TxnRef=GJH-ABC12345"));
        assertTrue(url.contains("vnp_Amount=15000000"));
        assertTrue(url.contains("vnp_SecureHash="));
    }

    @Test
    void forgedIpnCannotTouchRepositories() {
        assertEquals("97", service.processIpn(Map.of("vnp_SecureHash", "forged")));
        verifyNoInteractions(orderRepository, paymentRepository);
    }

    @Test
    void signedIpnRejectsWrongAmount() throws Exception {
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order(42L)));
        assertEquals("04", service.processIpn(signedIpn("14999900", "00")));
        verify(orderRepository, never()).save(any());
        verifyNoInteractions(paymentRepository);
    }

    @Test
    void signedSuccessIpnIsIdempotent() throws Exception {
        Order order = order(42L);
        Payment payment = Payment.builder().method(Payment.PaymentMethod.VNPAY)
                .status(Payment.PaymentStatus.PENDING).build();
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order));
        when(paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.of(payment));
        Map<String, String> callback = signedIpn("15000000", "00");
        assertEquals("00", service.processIpn(callback));
        assertEquals(Order.PaymentStatus.PAID, order.getPaymentStatus());
        assertEquals(Payment.PaymentStatus.SUCCESS, payment.getStatus());
        assertEquals("TXN123", payment.getTransactionId());
        assertNotNull(payment.getPaidAt());
        assertEquals("00", service.processIpn(callback));
        verify(orderRepository, times(1)).save(order);
        verify(paymentRepository, times(1)).save(payment);
    }

    @Test
    void declinedIpnDoesNotMarkOrderPaid() throws Exception {
        Order order = order(42L);
        Payment payment = Payment.builder().method(Payment.PaymentMethod.VNPAY).status(Payment.PaymentStatus.PENDING).build();
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order));
        when(paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.of(payment));
        assertEquals("00", service.processIpn(signedIpn("15000000", "24")));
        assertEquals(Payment.PaymentStatus.FAILED, payment.getStatus());
        assertEquals(Order.PaymentStatus.PENDING, order.getPaymentStatus());
        verify(paymentRepository).save(payment);
    }

    @Test
    void browserReturnCannotMarkOrderPaid() throws Exception {
        Order order = order(42L);
        when(orderRepository.findByOrderCode("GJH-ABC12345")).thenReturn(Optional.of(order));
        when(paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.of(
                Payment.builder().method(Payment.PaymentMethod.VNPAY).build()));
        Map<String, Object> result = service.processReturn(signedIpn("15000000", "00"));
        assertEquals(true, result.get("success"));
        assertEquals(false, result.get("confirmed"));
        assertEquals(Order.PaymentStatus.PENDING, order.getPaymentStatus());
        verify(orderRepository, never()).save(any());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void browserReturnRejectsWrongAmount() throws Exception {
        when(orderRepository.findByOrderCode("GJH-ABC12345")).thenReturn(Optional.of(order(42L)));
        assertEquals(false, service.processReturn(signedIpn("100", "00")).get("success"));
        verify(orderRepository, never()).save(any());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void forgedReturnDoesNotExposeOrderIdOrQueryDatabase() {
        Map<String, Object> result = service.processReturn(Map.of("vnp_SecureHash", "forged",
                "vnp_TxnRef", "GJH-ABC12345", "vnp_ResponseCode", "00"));
        assertEquals(false, result.get("success"));
        assertNull(result.get("orderId"));
        verifyNoInteractions(orderRepository, paymentRepository);
    }

    @Test
    void malformedSignedAmountIsRejectedWithoutException() throws Exception {
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order(42L)));
        assertEquals("04", service.processIpn(signedIpn("not-a-number", "00")));
        verify(orderRepository, never()).save(any());
        verifyNoInteractions(paymentRepository);
    }

    @Test
    void signedCallbackCannotPayCodOrder() throws Exception {
        Order order = order(42L);
        Payment payment = Payment.builder().method(Payment.PaymentMethod.COD)
                .status(Payment.PaymentStatus.PENDING).build();
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order));
        when(paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.of(payment));
        assertEquals("01", service.processIpn(signedIpn("15000000", "00")));
        assertEquals(Order.PaymentStatus.PENDING, order.getPaymentStatus());
        verify(orderRepository, never()).save(any());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void cancelledOrderCannotBecomePaid() throws Exception {
        Order order = order(42L);
        order.setStatus(Order.OrderStatus.CANCELLED);
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order));
        assertEquals("02", service.processIpn(signedIpn("15000000", "00")));
        assertEquals(Order.PaymentStatus.PENDING, order.getPaymentStatus());
        verify(orderRepository, never()).save(any());
        verifyNoInteractions(paymentRepository);
    }

    @Test
    void paidReplayStillRejectsWrongAmount() throws Exception {
        Order order = order(42L);
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order));
        assertEquals("04", service.processIpn(signedIpn("100", "00")));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void tamperedAmountCannotPassSignatureValidation() throws Exception {
        Map<String, String> callback = signedIpn("15000000", "00");
        callback.put("vnp_Amount", "100");
        assertEquals("97", service.processIpn(callback));
        verifyNoInteractions(orderRepository, paymentRepository);
    }

    @Test
    void inconsistentTransactionStatusCannotMarkPaid() throws Exception {
        Map<String, String> callback = signedIpn("15000000", "00");
        callback.put("vnp_TransactionStatus", "02");
        resign(callback);
        Order order = order(42L);
        Payment payment = Payment.builder().method(Payment.PaymentMethod.VNPAY)
                .status(Payment.PaymentStatus.PENDING).build();
        when(orderRepository.findByOrderCodeForUpdate("GJH-ABC12345")).thenReturn(Optional.of(order));
        when(paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.of(payment));
        assertEquals("00", service.processIpn(callback));
        assertEquals(Order.PaymentStatus.PENDING, order.getPaymentStatus());
        assertEquals(Payment.PaymentStatus.FAILED, payment.getStatus());
    }

    @Test
    void wrongMerchantCannotTouchDatabaseEvenWithValidHash() throws Exception {
        Map<String, String> callback = signedIpn("15000000", "00");
        callback.put("vnp_TmnCode", "OTHER");
        resign(callback);
        assertEquals("97", service.processIpn(callback));
        verifyNoInteractions(orderRepository, paymentRepository);
    }

    private void resign(Map<String, String> callback) throws Exception {
        callback.remove("vnp_SecureHash");
        String data = new java.util.TreeMap<>(callback).entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(java.util.stream.Collectors.joining("&"));
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec("test-secret".getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        callback.put("vnp_SecureHash", HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8))));
    }

    // Sign a fixed callback fixture independently of the production signing helper.
    private Map<String, String> signedIpn(String amount, String response) throws Exception {
        String payload = "vnp_Amount=" + amount + "&vnp_ResponseCode=" + response
                + "&vnp_TmnCode=TESTCODE&vnp_TransactionNo=TXN123&vnp_TransactionStatus=00&vnp_TxnRef=GJH-ABC12345";
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec("test-secret".getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        Map<String, String> callback = new HashMap<>(Map.of("vnp_Amount", amount,
                "vnp_ResponseCode", response, "vnp_TmnCode", "TESTCODE", "vnp_TransactionStatus", "00",
                "vnp_TransactionNo", "TXN123", "vnp_TxnRef", "GJH-ABC12345"));
        callback.put("vnp_SecureHash", HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8))));
        return callback;
    }

    private Order order(Long userId) {
        User user = new User();
        user.setId(userId);
        return Order.builder().id(10L).user(user).orderCode("GJH-ABC12345")
                .totalAmount(new BigDecimal("150000"))
                .status(Order.OrderStatus.PENDING).paymentStatus(Order.PaymentStatus.PENDING).build();
    }
}
