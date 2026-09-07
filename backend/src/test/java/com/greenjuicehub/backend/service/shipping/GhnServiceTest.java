package com.greenjuicehub.backend.service.shipping;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenjuicehub.backend.config.properties.GhnProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GhnServiceTest {

    @Mock private RestTemplate restTemplate;
    private GhnService service;

    @BeforeEach
    void setUp() {
        GhnProperties properties = new GhnProperties();
        properties.setBaseUrl("https://ghn.example");
        properties.setToken("token");
        properties.setShopId(123);
        properties.setFromDistrictId(1442);
        properties.setFromWardCode("20101");
        service = new GhnService(properties, restTemplate, new ObjectMapper());
    }

    @Test
    void returnsFeeFromSuccessfulGhnResponse() {
        when(restTemplate.exchange(any(String.class), any(), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"code\":200,\"data\":{\"total\":42000}}"));

        assertEquals(new BigDecimal("42000"), service.calculateShippingFee(1454, "21211", 500));
    }

    @Test
    void fallsBackToThirtyThousandWhenGhnFails() {
        when(restTemplate.exchange(any(String.class), any(), any(), eq(String.class)))
                .thenThrow(new RuntimeException("timeout"));

        assertEquals(new BigDecimal("30000"), service.calculateShippingFee(1454, "21211", 500));
    }

    @Test
    void fallsBackWhenResponseIsMalformed() {
        when(restTemplate.exchange(any(String.class), any(), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("not-json"));

        assertEquals(new BigDecimal("30000"), service.calculateShippingFee(1454, "21211", 500));
    }
}
