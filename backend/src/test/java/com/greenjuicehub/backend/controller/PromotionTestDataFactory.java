package com.greenjuicehub.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

final class PromotionTestDataFactory {

    private PromotionTestDataFactory() {
    }

    static Map<String, Object> validBody() {
        LocalDateTime startsAt = LocalDateTime.now().plusDays(1).withNano(0);
        LocalDateTime endsAt = startsAt.plusDays(10);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", uniqueCode("PROMO"));
        body.put("name", "Integration promotion");
        body.put("type", "PERCENT");
        body.put("value", new BigDecimal("50"));
        body.put("minOrderValue", new BigDecimal("100000"));
        body.put("freeShipping", false);
        body.put("target", "PUBLIC");
        body.put("userId", null);
        body.put("maxUses", 100);
        body.put("maxUsesPerUser", 2);
        body.put("startsAt", startsAt.toString());
        body.put("endsAt", endsAt.toString());
        body.put("isActive", true);
        return body;
    }

    static String uniqueCode(String prefix) {
        String suffix = UUID.randomUUID().toString().replace("-", "").toUpperCase();
        return (prefix + "_" + suffix).substring(0, Math.min(50, prefix.length() + 1 + suffix.length()));
    }

    static String validCode(int length) {
        String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder value = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            value.append(alphabet.charAt(index % alphabet.length()));
        }
        return value.toString();
    }

    static String validName(int length) {
        StringBuilder value = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            value.append((char) ('A' + index % 26));
        }
        return value.toString();
    }
}
