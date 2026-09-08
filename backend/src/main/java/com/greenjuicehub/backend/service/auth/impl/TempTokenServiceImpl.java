package com.greenjuicehub.backend.service.auth.impl;

import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.service.auth.ITempTokenService;
import com.greenjuicehub.backend.service.auth.TokenFingerprint;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TempTokenServiceImpl implements ITempTokenService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final long EXPIRATION_MINUTES = 5;
    private static final String PREFIX = "temp_token:";

    private String keyFor(String token) {
        return PREFIX + TokenFingerprint.sha256(token);
    }

    @Override
    public String generate(Long userId, Purpose purpose) {
        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                keyFor(token),
                purpose.name() + ":" + userId,
                EXPIRATION_MINUTES, TimeUnit.MINUTES
        );
        return token;
    }

    @Override
    public Long consume(String token, Purpose... expectedPurposes) {
        String value = redisTemplate.opsForValue().getAndDelete(keyFor(token));
        if (value == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Phiên xác thực không hợp lệ hoặc đã hết hạn");
        }

        int separator = value.indexOf(':');
        if (separator <= 0) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Phiên xác thực không hợp lệ");
        }

        String purpose = value.substring(0, separator);
        boolean purposeAllowed = false;
        for (Purpose expectedPurpose : expectedPurposes) {
            if (expectedPurpose.name().equals(purpose)) {
                purposeAllowed = true;
                break;
            }
        }
        if (!purposeAllowed) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Phiên xác thực không đúng mục đích");
        }

        try {
            return Long.parseLong(value.substring(separator + 1));
        } catch (NumberFormatException ex) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Phiên xác thực không hợp lệ");
        }
    }
}
