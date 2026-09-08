package com.greenjuicehub.backend.service.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final StringRedisTemplate redis;
    private static final String PREFIX = "blacklist:";

    public void blacklist(String token, long ttlSeconds) {
        if (ttlSeconds > 0) {
            redis.opsForValue().set(keyFor(token), "1", Duration.ofSeconds(ttlSeconds));
        }
    }

    /**
     * Atomically claims a token for one-time use and keeps the claim until the
     * token expires. This closes the check-then-set race during refresh-token
     * rotation.
     */
    public boolean blacklistIfAbsent(String token, long ttlSeconds) {
        if (ttlSeconds <= 0) {
            return false;
        }
        return Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(
                keyFor(token), "1", Duration.ofSeconds(ttlSeconds)));
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redis.hasKey(keyFor(token)));
    }

    private String keyFor(String token) {
        return PREFIX + TokenFingerprint.sha256(token);
    }
}
