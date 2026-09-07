package com.greenjuicehub.backend.service.order;

import com.greenjuicehub.backend.dto.order.request.PlaceOrderRequest;
import com.greenjuicehub.backend.entity.*;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.OrderMapper;
import com.greenjuicehub.backend.repository.*;
import com.greenjuicehub.backend.service.order.impl.OrderServiceImpl;
import com.greenjuicehub.backend.service.shipping.GhnService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {
    @Mock OrderRepository orders;
    @Mock OrderItemRepository items;
    @Mock PaymentRepository payments;
    @Mock PromotionRepository promotions;
    @Mock PromotionUsageRepository usages;
    @Mock CartRepository carts;
    @Mock CartItemRepository cartItems;
    @Mock AddressRepository addresses;
    @Mock UserRepository users;
    @Mock OrderMapper mapper;
    @Mock ProductVariantRepository variants;
    @Mock GhnService shipping;
    @Mock ReviewRepository reviews;
    @InjectMocks OrderServiceImpl service;

    private PlaceOrderRequest request() {
        PlaceOrderRequest r = new PlaceOrderRequest();
        r.setAddressId(2L);
        r.setCartItemIds(List.of(7L));
        r.setPaymentMethod("COD");
        return r;
    }

    private ProductVariant checkout(int stock, boolean active) {
        User user = User.builder().id(42L).build();
        when(users.findById(42L)).thenReturn(Optional.of(user));
        when(addresses.findById(2L)).thenReturn(Optional.of(Address.builder().id(2L).user(user).build()));
        when(carts.findByUserId(42L)).thenReturn(Optional.of(Cart.builder().id(3L).build()));
        Product product = Product.builder().id(4L).name("Orange juice").build();
        ProductVariant variant = ProductVariant.builder().id(5L).product(product)
                .stockQty(stock).isActive(active).originalPrice(new BigDecimal("60000"))
                .salePrice(new BigDecimal("50000")).build();
        when(cartItems.findAllByCartIdWithDetails(3L)).thenReturn(List.of(
                CartItem.builder().id(7L).product(product).variant(variant).quantity(2).build()));
        return variant;
    }

    @ParameterizedTest
    @EnumSource(Payment.PaymentMethod.class)
    void checkoutPersistsTotalsPaymentAndStock(Payment.PaymentMethod method) {
        ProductVariant variant = checkout(10, true);
        when(orders.save(any())).thenAnswer(inv -> inv.getArgument(0));
        PlaceOrderRequest r = request();
        r.setPaymentMethod(method.name());
        service.placeOrder(42L, r);

        ArgumentCaptor<Order> order = ArgumentCaptor.forClass(Order.class);
        ArgumentCaptor<Payment> payment = ArgumentCaptor.forClass(Payment.class);
        verify(orders).save(order.capture());
        verify(payments).save(payment.capture());
        assertEquals(new BigDecimal("100000"), order.getValue().getSubtotal());
        assertEquals(new BigDecimal("130000"), order.getValue().getTotalAmount());
        assertEquals(Order.OrderStatus.PENDING, order.getValue().getStatus());
        assertEquals(method, payment.getValue().getMethod());
        assertEquals(order.getValue().getTotalAmount(), payment.getValue().getAmount());
        assertEquals(Payment.PaymentStatus.PENDING, payment.getValue().getStatus());
        assertEquals(8, variant.getStockQty());
        if (method == Payment.PaymentMethod.COD) assertNull(order.getValue().getExpiresAt());
        else assertNotNull(order.getValue().getExpiresAt());
        verify(variants).saveAll(List.of(variant));
        verify(items).saveAll(argThat(saved -> {
            OrderItem item = saved.iterator().next();
            return item.getQuantity() == 2 && item.getSubtotal().compareTo(new BigDecimal("100000")) == 0;
        }));
        verify(cartItems).deleteAll(argThat(selected -> selected.iterator().next().getId().equals(7L)));
        verifyNoInteractions(shipping);
    }

    @Test
    void rejectsAnotherCustomersAddressWithoutWrites() {
        when(users.findById(42L)).thenReturn(Optional.of(User.builder().id(42L).build()));
        when(addresses.findById(2L)).thenReturn(Optional.of(Address.builder()
                .user(User.builder().id(99L).build()).build()));
        assertThrows(AppException.class, () -> service.placeOrder(42L, request()));
        verifyNoInteractions(orders, payments, variants, carts);
    }

    @Test
    void rejectsInsufficientStockWithoutWrites() {
        ProductVariant variant = checkout(1, true);
        assertThrows(AppException.class, () -> service.placeOrder(42L, request()));
        assertEquals(1, variant.getStockQty());
        verifyNoInteractions(orders, payments, variants);
    }

    @Test
    void rejectsInactiveVariantWithoutWrites() {
        checkout(10, false);
        assertThrows(AppException.class, () -> service.placeOrder(42L, request()));
        verifyNoInteractions(orders, payments, variants);
    }

    @Test
    void rejectsUnselectedCartItemsWithoutWrites() {
        checkout(10, true);
        PlaceOrderRequest r = request();
        r.setCartItemIds(List.of(999L));
        assertThrows(AppException.class, () -> service.placeOrder(42L, r));
        verifyNoInteractions(orders, payments, variants);
    }

    @Test
    void rejectsInvalidPaymentMethodWithoutWrites() {
        checkout(10, true);
        PlaceOrderRequest r = request();
        r.setPaymentMethod("INVALID");
        assertThrows(AppException.class, () -> service.placeOrder(42L, r));
        verify(orders, never()).save(any());
        verifyNoInteractions(payments, variants);
    }

    @Test
    void missingOrForeignOrderCannotBeRead() {
        when(orders.findByIdAndUserId(10L, 42L)).thenReturn(Optional.empty());
        assertThrows(AppException.class, () -> service.getOrderDetail(42L, 10L));
        verifyNoInteractions(items, payments, mapper);
    }

    @Test
    void cancellingPaidOrderRestocksAndRequestsRefund() {
        Promotion promo = Promotion.builder().usedCount(1).build();
        Order order = Order.builder().id(10L).status(Order.OrderStatus.PENDING)
                .paymentStatus(Order.PaymentStatus.PAID).promotion(promo).build();
        ProductVariant variant = ProductVariant.builder().stockQty(8).build();
        Payment payment = Payment.builder().status(Payment.PaymentStatus.SUCCESS).build();
        when(orders.findByIdAndUserId(10L, 42L)).thenReturn(Optional.of(order));
        when(items.findAllByOrderIdWithDetails(10L)).thenReturn(List.of(
                OrderItem.builder().variant(variant).quantity(2).build()));
        when(payments.findTopByOrderIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.of(payment));
        when(orders.save(order)).thenReturn(order);
        service.cancelOrder(42L, 10L, "  Changed mind  ");
        assertEquals(10, variant.getStockQty());
        assertEquals(0, promo.getUsedCount());
        assertEquals(Order.OrderStatus.CANCELLED, order.getStatus());
        assertEquals(Order.PaymentStatus.REFUND_PENDING, order.getPaymentStatus());
        assertEquals(Order.CancelledBy.CUSTOMER, order.getCancelledBy());
        assertEquals("Changed mind", order.getCancelReason());
        verify(variants).saveAll(List.of(variant));
        verify(promotions).save(promo);
        verify(payments).save(payment);
    }

    @Test
    void cannotCancelShippingOrder() {
        when(orders.findByIdAndUserId(10L, 42L)).thenReturn(Optional.of(
                Order.builder().status(Order.OrderStatus.SHIPPING).build()));
        assertThrows(AppException.class, () -> service.cancelOrder(42L, 10L, "cancel"));
        verify(orders, never()).save(any());
        verifyNoInteractions(items, variants, payments);
    }

    @Test
    void confirmingCodDeliveryMarksPaymentSuccessful() {
        Order order = Order.builder().id(10L).status(Order.OrderStatus.SHIPPING)
                .paymentStatus(Order.PaymentStatus.PENDING).build();
        Payment payment = Payment.builder().method(Payment.PaymentMethod.COD)
                .status(Payment.PaymentStatus.PENDING).build();
        when(orders.findByIdAndUserId(10L, 42L)).thenReturn(Optional.of(order));
        when(payments.findTopByOrderIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.of(payment));
        when(orders.save(order)).thenReturn(order);
        service.confirmDelivered(42L, 10L);
        assertEquals(Order.OrderStatus.DELIVERED, order.getStatus());
        assertEquals(Order.PaymentStatus.PAID, order.getPaymentStatus());
        assertEquals(Payment.PaymentStatus.SUCCESS, payment.getStatus());
        assertNotNull(payment.getPaidAt());
        verify(payments).save(payment);
    }

    @Test
    void cannotConfirmPendingOrder() {
        when(orders.findByIdAndUserId(10L, 42L)).thenReturn(Optional.of(
                Order.builder().status(Order.OrderStatus.PENDING).build()));
        assertThrows(AppException.class, () -> service.confirmDelivered(42L, 10L));
        verify(orders, never()).save(any());
        verifyNoInteractions(payments);
    }
}
