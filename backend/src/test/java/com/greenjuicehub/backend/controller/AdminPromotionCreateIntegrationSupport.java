package com.greenjuicehub.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenjuicehub.backend.entity.Promotion;
import com.greenjuicehub.backend.entity.User;
import com.greenjuicehub.backend.repository.PromotionRepository;
import com.greenjuicehub.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

abstract class AdminPromotionCreateIntegrationSupport {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;
    @Autowired protected PromotionRepository promotionRepository;
    @Autowired protected UserRepository userRepository;

    private Long createdCustomerId;

    @AfterEach
    void cleanPromotionData() {
        promotionRepository.deleteAll();
        if (createdCustomerId != null) {
            userRepository.deleteById(createdCustomerId);
            createdCustomerId = null;
        }
    }

    protected ResultActions create(Map<String, Object> body) throws Exception {
        return mockMvc.perform(post("/api/admin/promotions")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    protected Long customerId() {
        User customer = User.builder()
                .name("Promotion test customer")
                .phone("09" + UUID.randomUUID().toString().replace("-", "").substring(0, 8))
                .email("promotion-test-" + UUID.randomUUID() + "@example.com")
                .username("promotion-test-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8))
                .hasPassword(false)
                .role(User.Role.CUSTOMER)
                .isActive(true)
                .build();
        createdCustomerId = userRepository.save(customer).getId();
        return createdCustomerId;
    }

    protected Map<String, Object> body() {
        return PromotionTestDataFactory.validBody();
    }

    protected void assertCreatedAndStored(Map<String, Object> body) throws Exception {
        create(body).andExpect(result -> {
            if (result.getResponse().getStatus() != 201) {
                throw new AssertionError("Expected HTTP 201 but got " + result.getResponse().getStatus()
                        + ": " + result.getResponse().getContentAsString());
            }
        }).andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.id").isNumber());
        String expectedCode = String.valueOf(body.get("code")).toUpperCase();
        Promotion saved = promotionRepository.findByCodeIgnoreCase(expectedCode).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(expectedCode, saved.getCode());
    }
}
