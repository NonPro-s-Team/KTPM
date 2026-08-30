package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.payment.IVnpayService;
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
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class PaymentControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private IVnpayService vnpayService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void createsUrlForAuthenticatedOrderOwner() throws Exception {
        when(vnpayService.getClientIp(any())).thenReturn("127.0.0.1");
        when(vnpayService.createPaymentUrl(42L, 10L, "127.0.0.1"))
                .thenReturn("https://sandbox.example/pay");

        mockMvc.perform(post("/api/payment/vnpay/create-url")
                        .with(customer(42L)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"orderId\":10}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentUrl").value("https://sandbox.example/pay"));

        verify(vnpayService).createPaymentUrl(42L, 10L, "127.0.0.1");
    }

    @Test
    void anonymousCannotCreateUrl() throws Exception {
        mockMvc.perform(post("/api/payment/vnpay/create-url")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"orderId\":10}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ipnMapsServiceResult() throws Exception {
        when(vnpayService.processIpn(any())).thenReturn("97");

        mockMvc.perform(get("/api/payment/vnpay/ipn?vnp_TxnRef=GJH-ABC12345")
                        .with(customer(42L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("97"))
                .andExpect(jsonPath("$.Message").value("Confirm Fail"));
    }

    @Test
    void returnEndpointMapsVerificationResult() throws Exception {
        when(vnpayService.processReturn(any())).thenReturn(Map.of("success", true, "orderCode", "GJH-ABC12345"));

        mockMvc.perform(get("/api/payment/vnpay/return?vnp_TxnRef=GJH-ABC12345")
                        .with(customer(42L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor customer(Long userId) {
        return authentication(new UsernamePasswordAuthenticationToken(userId, null,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }
}
