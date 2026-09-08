package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.auth.request.*;
import com.greenjuicehub.backend.dto.auth.response.*;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.service.auth.IAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/check-account")
    public ResponseEntity<AccountCheckResponse> checkAccount(@Valid @RequestBody CheckAccountRequest request) {
        return ResponseEntity.ok(authService.checkAccount(request));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<OtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendOtp(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<OtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/login-with-otp")
    public ResponseEntity<AuthResponse> loginWithOtp(@Valid @RequestBody TempTokenRequest request) {
        return ResponseEntity.ok(authService.loginWithTempToken(request.getTempToken()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginPasswordRequest request) {
        return ResponseEntity.ok(authService.loginWithPassword(request));
    }

    @PostMapping("/set-password")
    public ResponseEntity<AuthResponse> setPassword(@Valid @RequestBody SetPasswordRequest request) {
        return ResponseEntity.ok(authService.setPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    // Cần JWT — Spring Security inject userId từ token
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal Long userId) {
        authService.changePassword(request, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        String refreshToken = extractBearerToken(bearerToken);
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            @Valid @RequestBody LogoutRequest request) {
        String accessToken = bearerToken == null ? null : extractBearerToken(bearerToken);
        authService.logout(accessToken, request.getRefreshToken());
        return ResponseEntity.ok().build();
    }

    private String extractBearerToken(String header) {
        if (header == null || header.length() <= 7
                || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Authorization header không hợp lệ");
        }

        String token = header.substring(7).trim();
        if (token.isEmpty() || token.chars().anyMatch(Character::isWhitespace)) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Authorization header không hợp lệ");
        }
        return token;
    }
}
