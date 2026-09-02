package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.auth.request.*;
import com.greenjuicehub.backend.dto.auth.response.AccountCheckResponse;
import com.greenjuicehub.backend.dto.auth.response.AuthResponse;
import com.greenjuicehub.backend.dto.auth.response.OtpResponse;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.IAuthService;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
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
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class AuthControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private IAuthService authService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void checkAccountIsPublicAndForwardsValidatedPhone() throws Exception {
        when(authService.checkAccount(any(CheckAccountRequest.class)))
                .thenReturn(AccountCheckResponse.builder().exists(true).hasPassword(true).build());

        mockMvc.perform(post("/api/auth/check-account")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"0901234567\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true))
                .andExpect(jsonPath("$.hasPassword").value(true));

        verify(authService).checkAccount(argThat(request -> "0901234567".equals(request.getPhone())));
    }

    @Test
    void loginIsPublicAndReturnsTokens() throws Exception {
        when(authService.loginWithPassword(any(LoginPasswordRequest.class)))
                .thenReturn(AuthResponse.builder().accessToken("access-token").refreshToken("refresh-token")
                        .role("CUSTOMER").build());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"0901234567\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));

        verify(authService).loginWithPassword(argThat(request ->
                "0901234567".equals(request.getIdentifier())
                        && "password123".equals(request.getPassword())));
    }

    @Test
    void loginWithoutPasswordIsRejectedBeforeServiceCall() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"0901234567\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(authService);
    }

    @Test
    void sendOtpIsPublicAndReturnsServiceResponse() throws Exception {
        when(authService.sendOtp(any(SendOtpRequest.class)))
                .thenReturn(OtpResponse.builder().success(true).otpCode("123456").build());

        mockMvc.perform(post("/api/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"0901234567\",\"type\":\"LOGIN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.otpCode").value("123456"));

        verify(authService).sendOtp(argThat(request ->
                "0901234567".equals(request.getPhone()) && "LOGIN".equals(request.getType())));
    }

    @Test
    void verifyOtpWithInvalidTypeIsRejectedBeforeServiceCall() throws Exception {
        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"0901234567\",\"otpCode\":\"123456\",\"type\":\"INVALID\"}"))
                .andExpect(status().isBadRequest());

        verify(authService, never()).verifyOtp(any());
    }

    @Test
    void authenticatedUserCanChangePassword() throws Exception {
        mockMvc.perform(post("/api/auth/change-password")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\":\"oldPassword\",\"newPassword\":\"newPassword\"}"))
                .andExpect(status().isOk());

        verify(authService).changePassword(argThat(request ->
                "oldPassword".equals(request.getOldPassword())
                        && "newPassword".equals(request.getNewPassword())), eq(42L));
    }

    @Test
    void anonymousUserCannotChangePassword() throws Exception {
        mockMvc.perform(post("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\":\"oldPassword\",\"newPassword\":\"newPassword\"}"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(authService);
    }

    @Test
    void refreshExtractsBearerTokenAndReturnsNewTokens() throws Exception {
        allowBearerTokenThroughMvcFilter("refresh-token");
        when(authService.refreshToken("refresh-token"))
                .thenReturn(AuthResponse.builder().accessToken("new-access").refreshToken("new-refresh").build());

        mockMvc.perform(post("/api/auth/refresh")
                        .header("Authorization", "Bearer refresh-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access"));

        verify(authService).refreshToken("refresh-token");
    }

    @Test
    void logoutExtractsBearerToken() throws Exception {
        allowBearerTokenThroughMvcFilter("access-token");
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer access-token"))
                .andExpect(status().isOk());

        verify(authService).logout("access-token");
    }

    private void allowBearerTokenThroughMvcFilter(String token) {
        // MockMvc's servlet path is empty while filtering, so JwtAuthFilter cannot
        // recognize its refresh/logout exclusions. Supply a valid access identity
        // so this controller-slice test can reach the mapped handler.
        when(jwtUtil.isTokenValid(token)).thenReturn(true);
        when(jwtUtil.extractType(token)).thenReturn("access");
        when(jwtUtil.extractUserId(token)).thenReturn(42L);
        when(jwtUtil.extractRole(token)).thenReturn("CUSTOMER");
    }

    private RequestPostProcessor customer(Long userId) {
        return authentication(new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }
}
