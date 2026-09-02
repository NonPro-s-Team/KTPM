package com.greenjuicehub.backend.service.auth;

import com.greenjuicehub.backend.config.properties.OtpProperties;
import com.greenjuicehub.backend.dto.auth.request.*;
import com.greenjuicehub.backend.dto.auth.response.AccountCheckResponse;
import com.greenjuicehub.backend.dto.auth.response.AuthResponse;
import com.greenjuicehub.backend.dto.auth.response.OtpResponse;
import com.greenjuicehub.backend.entity.OtpVerification;
import com.greenjuicehub.backend.entity.User;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.AuthMapper;
import com.greenjuicehub.backend.repository.OtpVerificationRepository;
import com.greenjuicehub.backend.repository.SocialAccountRepository;
import com.greenjuicehub.backend.repository.UserRepository;
import com.greenjuicehub.backend.service.auth.impl.AuthServiceImpl;
import com.greenjuicehub.backend.service.auth.impl.GoogleTokenVerifier;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private OtpVerificationRepository otpRepository;
    @Mock private SocialAccountRepository socialAccountRepository;
    @Mock private JwtUtil jwtUtil;
    @Mock private OtpProperties otpProperties;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private OtpLockService otpLockService;
    @Mock private ITempTokenService tempTokenService;
    @Mock private GoogleTokenVerifier googleTokenVerifier;
    @Mock private PasswordAttemptService passwordAttemptService;
    @Mock private CaptchaVerifier captchaVerifier;
    @Mock private TokenBlacklistService tokenBlacklistService;
    @Mock private AuthMapper authMapper;
    @InjectMocks private AuthServiceImpl authService;

    @BeforeEach
    void otpDefaults() {
        lenient().when(otpProperties.getMaxSendPerDay()).thenReturn(10);
        lenient().when(otpProperties.getExpirationMinutes()).thenReturn(5);
    }

    @Test
    void checkAccountWhenPhoneExistsReturnsExistingAccountResponse() {
        CheckAccountRequest request = checkAccountRequest("0901234567");
        User user = user(1L, true, true);
        AccountCheckResponse expected = AccountCheckResponse.builder().exists(true).hasPassword(true).build();
        when(userRepository.findByPhone(request.getPhone())).thenReturn(Optional.of(user));
        when(authMapper.toAccountCheckResponse(user)).thenReturn(expected);

        assertSame(expected, authService.checkAccount(request));
        verify(authMapper).toAccountCheckResponse(user);
    }

    @Test
    void checkAccountWhenPhoneIsNewReturnsNewAccountResponse() {
        CheckAccountRequest request = checkAccountRequest("0901234567");
        AccountCheckResponse expected = AccountCheckResponse.builder().exists(false).isNewUser(true).build();
        when(userRepository.findByPhone(request.getPhone())).thenReturn(Optional.empty());
        when(authMapper.toNewAccountCheckResponse()).thenReturn(expected);

        assertSame(expected, authService.checkAccount(request));
        verify(authMapper).toNewAccountCheckResponse();
    }

    @Test
    void sendOtpDuringCooldownThrowsTooManyRequests() {
        SendOtpRequest request = sendOtpRequest("0901234567", "LOGIN");
        when(otpRepository.existsByPhoneAndTypeAndIsUsedFalseAndCreatedAtAfter(
                eq(request.getPhone()), eq(OtpVerification.OtpType.LOGIN), any(LocalDateTime.class))).thenReturn(true);

        AppException error = assertThrows(AppException.class, () -> authService.sendOtp(request));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, error.getStatus());
        verify(otpRepository, never()).save(any());
    }

    @Test
    void sendOtpAtDailyLimitThrowsTooManyRequests() {
        SendOtpRequest request = sendOtpRequest("0901234567", "LOGIN");
        when(otpRepository.countByPhoneAndTypeAndCreatedAtAfter(
                eq(request.getPhone()), eq(OtpVerification.OtpType.LOGIN), any(LocalDateTime.class))).thenReturn(10);

        AppException error = assertThrows(AppException.class, () -> authService.sendOtp(request));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, error.getStatus());
        verify(otpRepository, never()).invalidateAllByPhoneAndType(any(), any());
    }

    @Test
    void sendOtpSavesSixDigitOtpAndInvalidatesPreviousCodes() {
        SendOtpRequest request = sendOtpRequest("0901234567", "REGISTER");
        OtpResponse expected = OtpResponse.builder().success(true).isNewUser(true).build();
        when(userRepository.existsByPhone(request.getPhone())).thenReturn(false);
        when(authMapper.toSendOtpResponse(eq(request.getPhone()), eq(true), eq(false), anyString()))
                .thenReturn(expected);

        assertSame(expected, authService.sendOtp(request));

        ArgumentCaptor<OtpVerification> captor = ArgumentCaptor.forClass(OtpVerification.class);
        verify(otpRepository).invalidateAllByPhoneAndType(request.getPhone(), OtpVerification.OtpType.REGISTER);
        verify(otpRepository).save(captor.capture());
        OtpVerification saved = captor.getValue();
        assertAll(
                () -> assertEquals(request.getPhone(), saved.getPhone()),
                () -> assertEquals(OtpVerification.OtpType.REGISTER, saved.getType()),
                () -> assertFalse(saved.getIsUsed()),
                () -> assertTrue(saved.getOtpCode().matches("\\d{6}")),
                () -> assertTrue(saved.getExpiresAt().isAfter(LocalDateTime.now().plusMinutes(4))));
    }

    @Test
    void sendOtpForExistingUserReportsPasswordState() {
        SendOtpRequest request = sendOtpRequest("0901234567", "LOGIN");
        User user = user(1L, true, true);
        when(userRepository.existsByPhone(request.getPhone())).thenReturn(true);
        when(userRepository.findByPhone(request.getPhone())).thenReturn(Optional.of(user));

        authService.sendOtp(request);

        verify(authMapper).toSendOtpResponse(eq(request.getPhone()), eq(false), eq(true), anyString());
    }

    @Test
    void verifyOtpWhenPhoneIsLockedThrowsTooManyRequests() {
        VerifyOtpRequest request = verifyOtpRequest("123456");
        when(otpLockService.isLocked(request.getPhone())).thenReturn(true);

        AppException error = assertThrows(AppException.class, () -> authService.verifyOtp(request));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, error.getStatus());
        verifyNoInteractions(otpRepository);
    }

    @Test
    void verifyOtpWhenNoCurrentCodeThrowsBadRequest() {
        VerifyOtpRequest request = verifyOtpRequest("123456");
        when(otpRepository.findTopByPhoneAndTypeAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                eq(request.getPhone()), eq(OtpVerification.OtpType.LOGIN), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());

        AppException error = assertThrows(AppException.class, () -> authService.verifyOtp(request));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatus());
    }

    @Test
    void verifyOtpWhenCodeIsWrongReportsRemainingAttempts() {
        VerifyOtpRequest request = verifyOtpRequest("000000");
        OtpVerification otp = OtpVerification.builder().otpCode("123456").build();
        when(otpRepository.findTopByPhoneAndTypeAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                eq(request.getPhone()), eq(OtpVerification.OtpType.LOGIN), any(LocalDateTime.class)))
                .thenReturn(Optional.of(otp));
        when(otpLockService.recordFailedAttempt(request.getPhone())).thenReturn(2);

        AppException error = assertThrows(AppException.class, () -> authService.verifyOtp(request));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatus());
        assertTrue(error.getMessage().contains("2"));
        verify(otpRepository, never()).save(any());
    }

    @Test
    void verifyOtpOnFinalWrongAttemptLocksFurtherAttempts() {
        VerifyOtpRequest request = verifyOtpRequest("000000");
        OtpVerification otp = OtpVerification.builder().otpCode("123456").build();
        when(otpRepository.findTopByPhoneAndTypeAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                eq(request.getPhone()), eq(OtpVerification.OtpType.LOGIN), any(LocalDateTime.class)))
                .thenReturn(Optional.of(otp));
        when(otpLockService.recordFailedAttempt(request.getPhone())).thenReturn(0);

        AppException error = assertThrows(AppException.class, () -> authService.verifyOtp(request));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, error.getStatus());
    }

    @Test
    void verifyCorrectOtpMarksItUsedAndReturnsTempToken() {
        VerifyOtpRequest request = verifyOtpRequest("123456");
        OtpVerification otp = OtpVerification.builder().otpCode("123456").isUsed(false).build();
        User user = user(1L, true, true);
        OtpResponse expected = OtpResponse.builder().success(true).tempToken("temp-token").build();
        when(otpRepository.findTopByPhoneAndTypeAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                eq(request.getPhone()), eq(OtpVerification.OtpType.LOGIN), any(LocalDateTime.class)))
                .thenReturn(Optional.of(otp));
        when(userRepository.existsByPhone(request.getPhone())).thenReturn(true);
        when(userRepository.findByPhone(request.getPhone())).thenReturn(Optional.of(user));
        when(tempTokenService.generate(1L)).thenReturn("temp-token");
        when(authMapper.toVerifyOtpResponse(false, true, "temp-token")).thenReturn(expected);

        assertSame(expected, authService.verifyOtp(request));
        assertTrue(otp.getIsUsed());
        assertNotNull(user.getPhoneVerifiedAt());
        verify(otpLockService).clearAttempts(request.getPhone());
        verify(otpRepository).save(otp);
    }

    @Test
    void loginWhenIdentifierDoesNotExistThrowsNotFound() {
        LoginPasswordRequest request = loginRequest("missing", "password123");

        AppException error = assertThrows(AppException.class, () -> authService.loginWithPassword(request));

        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void loginWhenAccountIsLockedStopsBeforePasswordCheck() {
        LoginPasswordRequest request = loginRequest("0901234567", "password123");
        when(userRepository.findByPhone(request.getIdentifier())).thenReturn(Optional.of(user(1L, true, true)));
        when(passwordAttemptService.isLocked(request.getIdentifier())).thenReturn(true);

        AppException error = assertThrows(AppException.class, () -> authService.loginWithPassword(request));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, error.getStatus());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void loginWithWrongPasswordRecordsFailure() {
        LoginPasswordRequest request = loginRequest("0901234567", "wrongPassword");
        User user = user(1L, true, true);
        user.setPasswordHash("hash");
        when(userRepository.findByPhone(request.getIdentifier())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), "hash")).thenReturn(false);
        when(passwordAttemptService.recordFailed(request.getIdentifier()))
                .thenReturn(new PasswordAttemptService.AttemptResult(1, false, false));

        AppException error = assertThrows(AppException.class, () -> authService.loginWithPassword(request));

        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatus());
        assertTrue(error.getMessage().contains("4"));
    }

    @Test
    void loginWhenAccountIsInactiveThrowsForbiddenAfterValidPassword() {
        LoginPasswordRequest request = loginRequest("0901234567", "password123");
        User user = user(1L, true, false);
        user.setPasswordHash("hash");
        when(userRepository.findByPhone(request.getIdentifier())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), "hash")).thenReturn(true);

        AppException error = assertThrows(AppException.class, () -> authService.loginWithPassword(request));

        assertEquals(HttpStatus.FORBIDDEN, error.getStatus());
    }

    @Test
    void loginWithValidPasswordClearsAttemptsAndReturnsTokens() {
        LoginPasswordRequest request = loginRequest("user@mail.com", "password123");
        User user = user(1L, true, true);
        user.setPasswordHash("hash");
        AuthResponse expected = AuthResponse.builder().accessToken("access").refreshToken("refresh").build();
        when(userRepository.findByEmail(request.getIdentifier())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), "hash")).thenReturn(true);
        when(jwtUtil.generateAccessToken(1L, "CUSTOMER")).thenReturn("access");
        when(jwtUtil.generateRefreshToken(1L)).thenReturn("refresh");
        when(authMapper.toAuthResponse(user, "access", "refresh")).thenReturn(expected);

        assertSame(expected, authService.loginWithPassword(request));
        verify(passwordAttemptService).clearAttempts(request.getIdentifier());
    }

    @Test
    void setPasswordForPasswordlessUserPersistsHashAndConsumesTempToken() {
        SetPasswordRequest request = new SetPasswordRequest();
        request.setTempToken("temp");
        request.setPassword("password123");
        User user = user(1L, false, true);
        when(tempTokenService.validate("temp")).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("password123")).thenReturn("hash");

        authService.setPassword(request);

        assertEquals("hash", user.getPasswordHash());
        assertTrue(user.getHasPassword());
        verify(userRepository).save(user);
        verify(tempTokenService).invalidate("temp");
    }

    @Test
    void refreshWithWrongTokenTypeThrowsUnauthorized() {
        when(jwtUtil.isTokenValid("access-token")).thenReturn(true);
        when(jwtUtil.extractType("access-token")).thenReturn("access");

        AppException error = assertThrows(AppException.class, () -> authService.refreshToken("access-token"));

        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatus());
        verify(jwtUtil, never()).extractUserId(anyString());
    }

    @Test
    void logoutValidTokenAddsItToBlacklistForRemainingLifetime() {
        when(jwtUtil.isTokenValid("access-token")).thenReturn(true);
        when(jwtUtil.getRemainingSeconds("access-token")).thenReturn(120L);

        authService.logout("access-token");

        verify(tokenBlacklistService).blacklist("access-token", 120L);
    }

    private User user(Long id, boolean hasPassword, boolean active) {
        return User.builder().id(id).hasPassword(hasPassword).isActive(active).role(User.Role.CUSTOMER).build();
    }

    private CheckAccountRequest checkAccountRequest(String phone) {
        CheckAccountRequest request = new CheckAccountRequest();
        request.setPhone(phone);
        return request;
    }

    private SendOtpRequest sendOtpRequest(String phone, String type) {
        SendOtpRequest request = new SendOtpRequest();
        request.setPhone(phone);
        request.setType(type);
        return request;
    }

    private VerifyOtpRequest verifyOtpRequest(String code) {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setPhone("0901234567");
        request.setType("LOGIN");
        request.setOtpCode(code);
        return request;
    }

    private LoginPasswordRequest loginRequest(String identifier, String password) {
        LoginPasswordRequest request = new LoginPasswordRequest();
        request.setIdentifier(identifier);
        request.setPassword(password);
        return request;
    }
}
