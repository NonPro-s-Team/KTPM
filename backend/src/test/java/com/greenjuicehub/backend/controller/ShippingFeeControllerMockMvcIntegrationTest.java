package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.entity.Address;
import com.greenjuicehub.backend.entity.User;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.repository.*;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.shipping.GhnService;
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
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ShippingFeeController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class ShippingFeeControllerMockMvcIntegrationTest {
    @Autowired private MockMvc mockMvc;
    @MockitoBean private GhnService ghnService;
    @MockitoBean private AddressRepository addressRepository;
    @MockitoBean private CartRepository cartRepository;
    @MockitoBean private CartItemRepository cartItemRepository;
    @MockitoBean private ProductVariantRepository productVariantRepository;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void foreignAddressIsRejectedEvenBeforeLegacyFeeFallback() throws Exception {
        when(addressRepository.findById(2L)).thenReturn(Optional.of(address(99L)));
        request("{\"addressId\":2}").andExpect(status().isNotFound());
        verifyNoInteractions(ghnService, cartRepository, cartItemRepository, productVariantRepository);
    }

    @Test
    void ownLegacyAddressRetainsFallbackFee() throws Exception {
        when(addressRepository.findById(2L)).thenReturn(Optional.of(address(42L)));
        request("{\"addressId\":2}").andExpect(status().isOk())
                .andExpect(jsonPath("$.shippingFee").value(30000));
        verifyNoInteractions(ghnService);
    }

    @Test
    void negativeQuantityIsRejectedBeforeReadingAddress() throws Exception {
        request("{\"addressId\":2,\"variantId\":3,\"quantity\":-1}")
                .andExpect(status().isBadRequest());
        verifyNoInteractions(addressRepository, ghnService);
    }

    @Test
    void missingAddressIsBadRequest() throws Exception {
        request("{}").andExpect(status().isBadRequest());
        verifyNoInteractions(addressRepository, ghnService);
    }

    private Address address(Long ownerId) {
        return Address.builder().id(2L).user(User.builder().id(ownerId).build()).build();
    }

    private org.springframework.test.web.servlet.ResultActions request(String json) throws Exception {
        return mockMvc.perform(post("/api/orders/shipping-fee")
                .with(authentication(new UsernamePasswordAuthenticationToken(42L, null,
                        List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))))
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }
}
