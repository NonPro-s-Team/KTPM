package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.order.request.GetAvailablePromosRequest;
import com.greenjuicehub.backend.dto.order.response.AvailablePromoResponse;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.promotion.IPromotionService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PromotionController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class PromotionControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IPromotionService promotionService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void customerGetsAvailablePromotionsForBuyNow() throws Exception {
        when(promotionService.getAvailablePromos(eq(42L), any(GetAvailablePromosRequest.class)))
                .thenReturn(List.of(AvailablePromoResponse.builder()
                        .code("SAVE10")
                        .name("Giảm 10%")
                        .discountType("PERCENT")
                        .discountValue(new BigDecimal("10"))
                        .minOrderValue(new BigDecimal("100000"))
                        .isEligible(true)
                        .build()));

        mockMvc.perform(post("/api/promos/available")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":5,\"quantity\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("SAVE10"))
                .andExpect(jsonPath("$[0].discountType").value("PERCENT"))
                .andExpect(jsonPath("$[0].isEligible").value(true));

        verify(promotionService).getAvailablePromos(eq(42L), argThat(request ->
                request.getVariantId().equals(5L)
                        && request.getQuantity().equals(2)
                        && request.getCartItemIds() == null));
    }

    @Test
    void customerGetsAvailablePromotionsForSelectedCartItems() throws Exception {
        when(promotionService.getAvailablePromos(eq(42L), any(GetAvailablePromosRequest.class)))
                .thenReturn(List.of());

        mockMvc.perform(post("/api/promos/available")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cartItemIds\":[3,4]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        verify(promotionService).getAvailablePromos(eq(42L), argThat(request ->
                request.getCartItemIds().equals(List.of(3L, 4L))));
    }

    @Test
    void staffCannotRequestCustomerPromotions() throws Exception {
        mockMvc.perform(post("/api/promos/available")
                        .with(authentication(new UsernamePasswordAuthenticationToken(
                                8L, null, List.of(new SimpleGrantedAuthority("ROLE_STAFF")))))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":5,\"quantity\":2}"))
                .andExpect(status().isForbidden());

        verify(promotionService, never()).getAvailablePromos(any(), any());
    }

    @Test
    void anonymousUserCannotRequestPromotions() throws Exception {
        mockMvc.perform(post("/api/promos/available")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":5,\"quantity\":2}"))
                .andExpect(status().isUnauthorized());

        verify(promotionService, never()).getAvailablePromos(any(), any());
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor customer(Long userId) {
        return authentication(new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }
}
