package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.config.properties.SePayProperties;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.sepay.ISePayWebhookService;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WebhookController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class WebhookControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private ISePayWebhookService webhookService;
    @MockitoBean private SePayProperties sePayProperties;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void rejectsMissingApiKey() throws Exception {
        when(sePayProperties.getApiKey()).thenReturn("secret");

        mockMvc.perform(post("/api/webhooks/sepay").with(customer())
                        .contentType(MediaType.APPLICATION_JSON).content(validBody()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized"));

        verify(webhookService, never()).handlePayment(any());
    }

    @Test
    void acceptsValidApiKey() throws Exception {
        when(sePayProperties.getApiKey()).thenReturn("secret");

        mockMvc.perform(post("/api/webhooks/sepay").with(customer())
                        .header("Authorization", "apikey secret")
                        .contentType(MediaType.APPLICATION_JSON).content(validBody()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("OK"));

        verify(webhookService).handlePayment(any());
    }

    @Test
    void apiKeyIsCaseSensitive() throws Exception {
        when(sePayProperties.getApiKey()).thenReturn("secret");
        mockMvc.perform(post("/api/webhooks/sepay").with(customer())
                        .header("Authorization", "apikey SECRET")
                        .contentType(MediaType.APPLICATION_JSON).content(validBody()))
                .andExpect(status().isUnauthorized());
        verify(webhookService, never()).handlePayment(any());
    }

    @Test
    void missingServerKeyFailsClosed() throws Exception {
        mockMvc.perform(post("/api/webhooks/sepay").with(customer())
                        .header("Authorization", "apikey null")
                        .contentType(MediaType.APPLICATION_JSON).content(validBody()))
                .andExpect(status().isUnauthorized());
        verify(webhookService, never()).handlePayment(any());
    }

    @Test
    void missingAmountIsBadRequest() throws Exception {
        mockMvc.perform(post("/api/webhooks/sepay").with(customer())
                        .header("Authorization", "apikey secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"transferType\":\"in\",\"content\":\"GJH-ABC12345\"}"))
                .andExpect(status().isBadRequest());
        verify(webhookService, never()).handlePayment(any());
    }

    private String validBody() {
        return "{\"transferType\":\"in\",\"transferAmount\":150000,\"content\":\"GJH-ABC12345\"}";
    }

    @Test
    void rejectsWrongApiKeyBeforeProcessingPayment() throws Exception {
        when(sePayProperties.getApiKey()).thenReturn("secret");
        mockMvc.perform(post("/api/webhooks/sepay").with(customer())
                        .header("Authorization", "apikey wrong")
                        .contentType(MediaType.APPLICATION_JSON).content(validBody()))
                .andExpect(status().isUnauthorized());
        verify(webhookService, never()).handlePayment(any());
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor customer() {
        return authentication(new UsernamePasswordAuthenticationToken(42L, null,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }
}
