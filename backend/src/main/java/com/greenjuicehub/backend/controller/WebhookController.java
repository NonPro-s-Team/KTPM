package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.config.properties.SePayProperties;
import com.greenjuicehub.backend.dto.sepay.request.SePayWebhookRequest;
import com.greenjuicehub.backend.service.sepay.ISePayWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final SePayProperties sePayProperties;
    private final ISePayWebhookService sePayWebhookService;

    @PostMapping("/sepay")
    public ResponseEntity<Map<String, String>> handleSePay(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody SePayWebhookRequest request
    ) {
        // 1. Xác thực API key
        if (!isAuthorized(authHeader)) {
            log.warn("SePay webhook: unauthorized request");
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        // 2. Xử lý
        sePayWebhookService.handlePayment(request);

        // 3. Luôn trả 200 để SePay không retry
        return ResponseEntity.ok(Map.of("message", "OK"));
    }

    private boolean isAuthorized(String header) {
        String key = sePayProperties.getApiKey();
        if (key == null || key.isBlank() || header == null || !header.regionMatches(true, 0, "apikey ", 0, 7)) {
            return false;
        }
        return MessageDigest.isEqual(key.getBytes(StandardCharsets.UTF_8),
                header.substring(7).getBytes(StandardCharsets.UTF_8));
    }
}
