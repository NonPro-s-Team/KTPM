package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.order.response.OrderResponse;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.order.IOrderService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class OrderControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private IOrderService orderService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void customerGetsOwnOrder() throws Exception {
        when(orderService.getOrderDetail(42L, 10L)).thenReturn(OrderResponse.builder()
                .id(10L).orderCode("GJH-ABC12345").status("PENDING").build());

        mockMvc.perform(get("/api/orders/10").with(customer(42L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.orderCode").value("GJH-ABC12345"));
    }

    @Test
    void placeOrderForwardsAuthenticatedCustomer() throws Exception {
        when(orderService.placeOrder(eq(42L), any())).thenReturn(OrderResponse.builder()
                .id(10L).orderCode("GJH-ABC12345").build());

        mockMvc.perform(post("/api/orders").with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"addressId\":2,\"cartItemIds\":[7],\"paymentMethod\":\"COD\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10));

        verify(orderService).placeOrder(eq(42L), any());
    }

    @Test
    void staffCannotUseCustomerOrders() throws Exception {
        mockMvc.perform(get("/api/orders/10").with(authentication(
                        new UsernamePasswordAuthenticationToken(8L, null,
                                List.of(new SimpleGrantedAuthority("ROLE_STAFF"))))))
                .andExpect(status().isForbidden());
        verify(orderService, never()).getOrderDetail(any(), any());
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor customer(Long userId) {
        return authentication(new UsernamePasswordAuthenticationToken(userId, null,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }

    @Test
    void emptyCartIsRejectedBeforeServiceCall() throws Exception {
        mockMvc.perform(post("/api/orders").with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"addressId\":2,\"cartItemIds\":[],\"paymentMethod\":\"COD\"}"))
                .andExpect(status().isBadRequest());
        verify(orderService, never()).placeOrder(any(), any());
    }

    @Test
    void anonymousCannotReadOrders() throws Exception {
        mockMvc.perform(get("/api/orders/10")).andExpect(status().isUnauthorized());
        verify(orderService, never()).getOrderDetail(any(), any());
    }

    @Test
    void foreignOrderMapsToNotFound() throws Exception {
        when(orderService.getOrderDetail(42L, 10L)).thenThrow(
                new com.greenjuicehub.backend.exception.AppException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Order not found"));
        mockMvc.perform(get("/api/orders/10").with(customer(42L)))
                .andExpect(status().isNotFound());
    }
}
