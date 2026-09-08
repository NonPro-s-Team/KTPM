package com.greenjuicehub.backend.service.auth;

import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.service.auth.impl.TempTokenServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpStatus;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TokenStorageSecurityTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;
    @Mock
    private ValueOperations<String, String> tempValues;
    @Mock
    private StringRedisTemplate stringRedisTemplate;
    @Mock
    private ValueOperations<String, String> blacklistValues;

    private TempTokenServiceImpl tempTokenService;
    private TokenBlacklistService blacklistService;

    @BeforeEach
    void setUp() {
        tempTokenService = new TempTokenServiceImpl(redisTemplate);
        blacklistService = new TokenBlacklistService(stringRedisTemplate);
    }

    @Test
    void generatedTempTokenIsNotExposedInItsRedisKey() {
        when(redisTemplate.opsForValue()).thenReturn(tempValues);

        String token = tempTokenService.generate(42L, ITempTokenService.Purpose.LOGIN);

        ArgumentCaptor<String> key = ArgumentCaptor.forClass(String.class);
        verify(tempValues).set(key.capture(), org.mockito.ArgumentMatchers.eq("LOGIN:42"),
                org.mockito.ArgumentMatchers.eq(5L), org.mockito.ArgumentMatchers.eq(TimeUnit.MINUTES));
        assertEquals("temp_token:" + TokenFingerprint.sha256(token), key.getValue());
        assertFalse(key.getValue().contains(token));
    }

    @Test
    void tempTokenIsAtomicallyConsumedForItsExpectedPurpose() {
        String token = "one-time-token";
        String key = "temp_token:" + TokenFingerprint.sha256(token);
        when(redisTemplate.opsForValue()).thenReturn(tempValues);
        when(tempValues.getAndDelete(key)).thenReturn("RESET_PASSWORD:42");

        Long userId = tempTokenService.consume(token, ITempTokenService.Purpose.RESET_PASSWORD);

        assertEquals(42L, userId);
        verify(tempValues).getAndDelete(key);
    }

    @Test
    void tempTokenCannotBeUsedForAnotherPurpose() {
        String token = "purpose-bound-token";
        String key = "temp_token:" + TokenFingerprint.sha256(token);
        when(redisTemplate.opsForValue()).thenReturn(tempValues);
        when(tempValues.getAndDelete(key)).thenReturn("LOGIN:42");

        AppException error = assertThrows(AppException.class, () ->
                tempTokenService.consume(token, ITempTokenService.Purpose.RESET_PASSWORD));

        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatus());
        verify(tempValues).getAndDelete(key);
    }

    @Test
    void blacklistedJwtIsStoredByFingerprintAndExactTtl() {
        String token = "signed.jwt.value";
        when(stringRedisTemplate.opsForValue()).thenReturn(blacklistValues);

        blacklistService.blacklist(token, 90L);

        ArgumentCaptor<String> key = ArgumentCaptor.forClass(String.class);
        verify(blacklistValues).set(key.capture(), org.mockito.ArgumentMatchers.eq("1"),
                org.mockito.ArgumentMatchers.eq(Duration.ofSeconds(90)));
        assertEquals("blacklist:" + TokenFingerprint.sha256(token), key.getValue());
        assertFalse(key.getValue().contains(token));
    }

    @Test
    void refreshTokenClaimUsesAtomicSetIfAbsentWithExactTtl() {
        String token = "single-use.refresh.token";
        when(stringRedisTemplate.opsForValue()).thenReturn(blacklistValues);
        when(blacklistValues.setIfAbsent(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.eq("1"),
                org.mockito.ArgumentMatchers.eq(Duration.ofSeconds(90))))
                .thenReturn(true);

        boolean claimed = blacklistService.blacklistIfAbsent(token, 90L);

        ArgumentCaptor<String> key = ArgumentCaptor.forClass(String.class);
        verify(blacklistValues).setIfAbsent(key.capture(),
                org.mockito.ArgumentMatchers.eq("1"),
                org.mockito.ArgumentMatchers.eq(Duration.ofSeconds(90)));
        assertTrue(claimed);
        assertEquals("blacklist:" + TokenFingerprint.sha256(token), key.getValue());
        assertFalse(key.getValue().contains(token));
    }
}
