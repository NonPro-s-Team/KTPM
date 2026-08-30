package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.cart.request.AddToCartRequest;
import com.greenjuicehub.backend.dto.cart.response.CartResponse;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.cart.ICartService;
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

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CartController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class CartControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private ICartService cartService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void customerGetsOwnCartUsingNumericPrincipal() throws Exception {
        when(cartService.getCart(42L)).thenReturn(CartResponse.builder()
                .cartId(7L).totalItems(1).totalQuantity(2)
                .totalAmount(new BigDecimal("158000")).items(List.of()).build());

        mockMvc.perform(get("/api/cart").with(customer(42L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value(7))
                .andExpect(jsonPath("$.totalQuantity").value(2))
                .andExpect(jsonPath("$.totalAmount").value(158000));

        verify(cartService).getCart(42L);
    }

    @Test
    void addItemValidatesRequestBeforeCallingService() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":1,\"variantId\":2,\"quantity\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("quantity: Số lượng phải ít nhất là 1"));

        verify(cartService, never()).addItem(any(), any());
    }

    @Test
    void addItemForwardsAuthenticatedUserAndBody() throws Exception {
        when(cartService.addItem(eq(42L), any(AddToCartRequest.class)))
                .thenReturn(CartResponse.builder().cartId(7L).totalItems(1).build());

        mockMvc.perform(post("/api/cart/items")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":1,\"variantId\":2,\"quantity\":3}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value(7))
                .andExpect(jsonPath("$.totalItems").value(1));

        verify(cartService).addItem(eq(42L), argThat(request ->
                request.getProductId().equals(1L)
                        && request.getVariantId().equals(2L)
                        && request.getQuantity().equals(3)));
    }

    @Test
    void clearCartReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/cart").with(customer(42L)))
                .andExpect(status().isNoContent());

        verify(cartService).clearCart(42L);
    }

    @Test
    void staffCannotAccessCustomerCart() throws Exception {
        mockMvc.perform(get("/api/cart").with(authentication(
                        new UsernamePasswordAuthenticationToken(8L, null,
                                List.of(new SimpleGrantedAuthority("ROLE_STAFF"))))))
                .andExpect(status().isForbidden());

        verify(cartService, never()).getCart(any());
    }

    @Test
    void anonymousUserCannotAccessCart() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isUnauthorized());

        verify(cartService, never()).getCart(any());
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor customer(Long userId) {
        return authentication(new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }
}
