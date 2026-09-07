package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.shipping.GhnService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShippingController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class ShippingControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private GhnService ghnService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void returnsDistrictsForProvince() throws Exception {
        when(ghnService.getDistricts(202)).thenReturn(List.of(Map.of("DistrictID", 1454, "DistrictName", "District 1")));

        mockMvc.perform(get("/api/shipping/districts?provinceId=202").with(customer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].DistrictID").value(1454));

        verify(ghnService).getDistricts(202);
    }

    @Test
    void missingProvinceIdIsBadRequest() throws Exception {
        mockMvc.perform(get("/api/shipping/districts").with(customer()))
                .andExpect(status().isBadRequest());
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor customer() {
        return authentication(new UsernamePasswordAuthenticationToken(42L, null,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }
}
