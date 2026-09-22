package com.greenjuicehub.backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminPromotionCreateBvaIntegrationTest extends AdminPromotionCreateIntegrationSupport {

    @Test @DisplayName("BVA-00 | nominal code=25 name=100 value=50")
    void bva00() throws Exception { verifyBoundary(25, 100, new BigDecimal("50")); }

    @Test @DisplayName("BVA-C01 | code length=1")
    void bvaC01() throws Exception { verifyBoundary(1, 100, new BigDecimal("50")); }

    @Test @DisplayName("BVA-C02 | code length=2")
    void bvaC02() throws Exception { verifyBoundary(2, 100, new BigDecimal("50")); }

    @Test @DisplayName("BVA-C03 | code length=49")
    void bvaC03() throws Exception { verifyBoundary(49, 100, new BigDecimal("50")); }

    @Test @DisplayName("BVA-C04 | code length=50")
    void bvaC04() throws Exception { verifyBoundary(50, 100, new BigDecimal("50")); }

    @Test @DisplayName("BVA-N01 | name length=1")
    void bvaN01() throws Exception { verifyBoundary(25, 1, new BigDecimal("50")); }

    @Test @DisplayName("BVA-N02 | name length=2")
    void bvaN02() throws Exception { verifyBoundary(25, 2, new BigDecimal("50")); }

    @Test @DisplayName("BVA-N03 | name length=199")
    void bvaN03() throws Exception { verifyBoundary(25, 199, new BigDecimal("50")); }

    @Test @DisplayName("BVA-N04 | name length=200")
    void bvaN04() throws Exception { verifyBoundary(25, 200, new BigDecimal("50")); }

    @Test @DisplayName("BVA-P01 | PERCENT value=0.01")
    void bvaP01() throws Exception { verifyBoundary(25, 100, new BigDecimal("0.01")); }

    @Test @DisplayName("BVA-P02 | PERCENT value=0.02")
    void bvaP02() throws Exception { verifyBoundary(25, 100, new BigDecimal("0.02")); }

    @Test @DisplayName("BVA-P03 | PERCENT value=99.99")
    void bvaP03() throws Exception { verifyBoundary(25, 100, new BigDecimal("99.99")); }

    @Test @DisplayName("BVA-P04 | PERCENT value=100")
    void bvaP04() throws Exception { verifyBoundary(25, 100, new BigDecimal("100")); }

    private void verifyBoundary(int codeLength, int nameLength, BigDecimal value) throws Exception {
        Map<String, Object> body = body();
        String code = PromotionTestDataFactory.validCode(codeLength);
        String name = PromotionTestDataFactory.validName(nameLength);
        body.put("code", code);
        body.put("name", name);
        body.put("type", "PERCENT");
        body.put("value", value);

        create(body)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.code").value(code))
                .andExpect(jsonPath("$.name").value(name))
                .andExpect(jsonPath("$.value").value(value.doubleValue()));

        com.greenjuicehub.backend.entity.Promotion saved = promotionRepository.findByCodeIgnoreCase(code).orElseThrow();
        assertEquals(code.length(), saved.getCode().length());
        assertEquals(name.length(), saved.getName().length());
        assertEquals(0, saved.getValue().compareTo(value));
    }
}
