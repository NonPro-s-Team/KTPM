package com.greenjuicehub.backend.utils;

import com.greenjuicehub.backend.config.properties.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("test-only-jwt-secret-with-at-least-32-characters");
        properties.setAccessTokenExpiration(900_000L);
        properties.setRefreshTokenExpiration(86_400_000L);
        jwtUtil = new JwtUtil(properties);
    }

    @Test
    void refreshTokensIssuedInTheSameSecondRemainUnique() {
        Set<String> tokens = new HashSet<>();

        for (int i = 0; i < 100; i++) {
            tokens.add(jwtUtil.generateRefreshToken(42L));
        }

        assertEquals(100, tokens.size());
    }

    @Test
    void accessTokensIssuedInTheSameSecondRemainUnique() {
        Set<String> tokens = new HashSet<>();

        for (int i = 0; i < 100; i++) {
            tokens.add(jwtUtil.generateAccessToken(42L, "CUSTOMER"));
        }

        assertEquals(100, tokens.size());
    }
}
