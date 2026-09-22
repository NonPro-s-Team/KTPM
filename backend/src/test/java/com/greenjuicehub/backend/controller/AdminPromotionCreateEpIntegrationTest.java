package com.greenjuicehub.backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminPromotionCreateEpIntegrationTest extends AdminPromotionCreateIntegrationSupport {

    @Test @DisplayName("EP-00 | toàn bộ dữ liệu hợp lệ")
    void ep00() throws Exception { created(body()); }

    @Test @DisplayName("EP-CODE-01 | code lowercase hợp lệ")
    void epCode01() throws Exception { Map<String, Object> body = body(); body.put("code", PromotionTestDataFactory.uniqueCode("sale").toLowerCase()); created(body); }

    @Test @DisplayName("EP-CODE-02 | code blank")
    void epCode02() throws Exception { rejected(bodyWith("code", "   ")); }

    @Test @DisplayName("EP-CODE-03 | code sai pattern")
    void epCode03() throws Exception { rejected(bodyWith("code", "SUMMER@20")); }

    @Test @DisplayName("EP-CODE-04 | code dài 51 ký tự")
    void epCode04() throws Exception { rejected(bodyWith("code", "A".repeat(51))); }

    @Test @DisplayName("EP-CODE-05 | code duplicate không phân biệt hoa thường")
    void epCode05() throws Exception {
        Map<String, Object> seed = body();
        String code = PromotionTestDataFactory.uniqueCode("DUP");
        seed.put("code", code);
        created(seed);
        rejected(bodyWith("code", code.toLowerCase()));
    }

    @Test @DisplayName("EP-NAME-01 | name blank")
    void epName01() throws Exception { rejected(bodyWith("name", "   ")); }

    @Test @DisplayName("EP-NAME-02 | name dài 201 ký tự")
    void epName02() throws Exception { rejected(bodyWith("name", "N".repeat(201))); }

    @Test @DisplayName("EP-TYPE-01 | type FIXED hợp lệ")
    void epType01() throws Exception { Map<String, Object> body = body(); body.put("type", "FIXED"); body.put("value", new BigDecimal("100000")); created(body); }

    @Test @DisplayName("EP-TYPE-02 | type null")
    void epType02() throws Exception { rejected(bodyWith("type", null)); }

    @Test @DisplayName("EP-TYPE-03 | type ngoài enum BOGO")
    void epType03() throws Exception { rejected(bodyWith("type", "BOGO")); }

    @Test @DisplayName("EP-VAL-01 | PERCENT value bằng 0")
    void epVal01() throws Exception { rejected(bodyWith("value", BigDecimal.ZERO)); }

    @Test @DisplayName("EP-VAL-02 | PERCENT value bằng 120")
    void epVal02() throws Exception { rejected(bodyWith("value", new BigDecimal("120"))); }

    @Test @DisplayName("EP-VAL-03 | value null")
    void epVal03() throws Exception { rejected(bodyWith("value", null)); }

    @Test @DisplayName("EP-VAL-04 | FIXED value dương hợp lệ")
    void epVal04() throws Exception { Map<String, Object> body = body(); body.put("type", "FIXED"); body.put("value", new BigDecimal("1000.00")); created(body); }

    @Test @DisplayName("EP-VAL-05 | FIXED value bằng 0")
    void epVal05() throws Exception { Map<String, Object> body = body(); body.put("type", "FIXED"); body.put("value", BigDecimal.ZERO); rejected(body); }

    @Test @DisplayName("EP-VAL-06 | FIXED value vượt DECIMAL(12,2)")
    void epVal06() throws Exception { Map<String, Object> body = body(); body.put("type", "FIXED"); body.put("value", new BigDecimal("10000000000.00")); rejected(body); }

    @Test @DisplayName("EP-MIN-01 | minOrderValue null")
    void epMin01() throws Exception { Map<String, Object> body = bodyWith("minOrderValue", null); created(body); assertEquals(0, promotionRepository.findByCodeIgnoreCase(String.valueOf(body.get("code"))).orElseThrow().getMinOrderValue().compareTo(BigDecimal.ZERO)); }

    @Test @DisplayName("EP-MIN-02 | minOrderValue bằng 0")
    void epMin02() throws Exception { created(bodyWith("minOrderValue", BigDecimal.ZERO)); }

    @Test @DisplayName("EP-MIN-03 | minOrderValue âm")
    void epMin03() throws Exception { rejected(bodyWith("minOrderValue", BigDecimal.ONE.negate())); }

    @Test @DisplayName("EP-MIN-04 | minOrderValue vượt DECIMAL")
    void epMin04() throws Exception { rejected(bodyWith("minOrderValue", new BigDecimal("10000000000.00"))); }

    @Test @DisplayName("EP-SHIP-01 | freeShipping true")
    void epShip01() throws Exception { created(bodyWith("freeShipping", true)); }

    @Test @DisplayName("EP-SHIP-02 | freeShipping null mặc định false")
    void epShip02() throws Exception { Map<String, Object> body = bodyWith("freeShipping", null); created(body); assertEquals(false, promotionRepository.findByCodeIgnoreCase(String.valueOf(body.get("code"))).orElseThrow().getFreeShipping()); }

    @Test @DisplayName("EP-SHIP-03 | freeShipping sai kiểu JSON")
    void epShip03() throws Exception { rejected(bodyWith("freeShipping", Map.of("bad", true))); }

    @Test @DisplayName("EP-TGT-01 | PUBLIC nhưng gửi userId")
    void epTgt01() throws Exception { Map<String, Object> body = body(); body.put("userId", customerId()); created(body); assertEquals(null, promotionRepository.findByCodeIgnoreCase(String.valueOf(body.get("code"))).orElseThrow().getUser()); }

    @Test @DisplayName("EP-TGT-02 | PERSONAL với customer hợp lệ")
    void epTgt02() throws Exception { Map<String, Object> body = body(); body.put("target", "PERSONAL"); body.put("userId", customerId()); created(body); }

    @Test @DisplayName("EP-TGT-03 | PERSONAL thiếu userId trả 400")
    void epTgt03() throws Exception { create(with(body(), "target", "PERSONAL", "userId", null)).andExpect(status().isBadRequest()); }

    @Test @DisplayName("EP-TGT-04 | PERSONAL user không tồn tại trả 404")
    void epTgt04() throws Exception { create(with(body(), "target", "PERSONAL", "userId", 999999999999L)).andExpect(status().isNotFound()); }

    @Test @DisplayName("EP-TGT-05 | target null")
    void epTgt05() throws Exception { rejected(bodyWith("target", null)); }

    @Test @DisplayName("EP-TGT-06 | target GROUP ngoài enum")
    void epTgt06() throws Exception { rejected(bodyWith("target", "GROUP")); }

    @Test @DisplayName("EP-MAX-01 | maxUses null")
    void epMax01() throws Exception { created(bodyWith("maxUses", null)); }

    @Test @DisplayName("EP-MAX-02 | maxUses bằng 0")
    void epMax02() throws Exception { rejected(bodyWith("maxUses", 0)); }

    @Test @DisplayName("EP-MAX-03 | maxUses vượt Integer")
    void epMax03() throws Exception { rejected(bodyWith("maxUses", 2147483648L)); }

    @Test @DisplayName("EP-MPU-01 | maxUsesPerUser null")
    void epMpu01() throws Exception { created(bodyWith("maxUsesPerUser", null)); }

    @Test @DisplayName("EP-MPU-02 | maxUsesPerUser bằng 0")
    void epMpu02() throws Exception { rejected(bodyWith("maxUsesPerUser", 0)); }

    @Test @DisplayName("EP-MPU-03 | maxUsesPerUser lớn hơn maxUses")
    void epMpu03() throws Exception { Map<String, Object> body = body(); body.put("maxUses", 10); body.put("maxUsesPerUser", 11); rejected(body); }

    @Test @DisplayName("EP-MPU-04 | maxUses null và perUser bằng 2")
    void epMpu04() throws Exception { Map<String, Object> body = body(); body.put("maxUses", null); body.put("maxUsesPerUser", 2); created(body); }

    @Test @DisplayName("EP-MPU-05 | maxUsesPerUser vượt Integer")
    void epMpu05() throws Exception { rejected(bodyWith("maxUsesPerUser", 2147483648L)); }

    @Test @DisplayName("EP-DATE-01 | hai ngày quá khứ đúng thứ tự")
    void epDate01() throws Exception { Map<String, Object> body = body(); LocalDateTime now = LocalDateTime.now().withNano(0); body.put("startsAt", now.minusDays(10).toString()); body.put("endsAt", now.minusDays(2).toString()); created(body); }

    @Test @DisplayName("EP-DATE-02 | start quá khứ end tương lai")
    void epDate02() throws Exception { Map<String, Object> body = body(); LocalDateTime now = LocalDateTime.now().withNano(0); body.put("startsAt", now.minusDays(1).toString()); body.put("endsAt", now.plusDays(10).toString()); created(body); }

    @Test @DisplayName("EP-DATE-03 | startsAt null")
    void epDate03() throws Exception { rejected(bodyWith("startsAt", null)); }

    @Test @DisplayName("EP-DATE-04 | endsAt null")
    void epDate04() throws Exception { rejected(bodyWith("endsAt", null)); }

    @Test @DisplayName("EP-DATE-05 | startsAt bằng endsAt")
    void epDate05() throws Exception { LocalDateTime time = LocalDateTime.now().plusDays(2).withNano(0); Map<String, Object> body = body(); body.put("startsAt", time.toString()); body.put("endsAt", time.toString()); rejected(body); }

    @Test @DisplayName("EP-DATE-06 | endsAt trước startsAt")
    void epDate06() throws Exception { Map<String, Object> body = body(); LocalDateTime now = LocalDateTime.now().withNano(0); body.put("startsAt", now.plusDays(3).toString()); body.put("endsAt", now.plusDays(2).toString()); rejected(body); }

    @Test @DisplayName("EP-DATE-07 | startsAt sai format")
    void epDate07() throws Exception { rejected(bodyWith("startsAt", "abc")); }

    @Test @DisplayName("EP-ACT-01 | isActive false")
    void epAct01() throws Exception { created(bodyWith("isActive", false)); }

    @Test @DisplayName("EP-ACT-02 | isActive null mặc định true")
    void epAct02() throws Exception { Map<String, Object> body = bodyWith("isActive", null); created(body); assertEquals(true, promotionRepository.findByCodeIgnoreCase(String.valueOf(body.get("code"))).orElseThrow().getIsActive()); }

    @Test @DisplayName("EP-ACT-03 | isActive sai kiểu JSON")
    void epAct03() throws Exception { rejected(bodyWith("isActive", Map.of("bad", true))); }

    private Map<String, Object> bodyWith(String key, Object value) { return with(body(), key, value); }

    private Map<String, Object> with(Map<String, Object> body, String key, Object value) { body.put(key, value); return body; }

    private Map<String, Object> with(Map<String, Object> body, String key, Object value, String secondKey, Object secondValue) {
        body.put(key, value); body.put(secondKey, secondValue); return body;
    }

    private void created(Map<String, Object> body) throws Exception {
        create(body).andExpect(status().isCreated()).andExpect(jsonPath("$.code").value(String.valueOf(body.get("code")).toUpperCase()));
        String expectedCode = String.valueOf(body.get("code")).toUpperCase();
        org.junit.jupiter.api.Assertions.assertTrue(promotionRepository.findByCodeIgnoreCase(expectedCode).isPresent());
    }

    private void rejected(Map<String, Object> body) throws Exception {
        int before = (int) promotionRepository.count();
        create(body).andExpect(result -> org.junit.jupiter.api.Assertions.assertTrue(
                result.getResponse().getStatus() >= 400,
                "Expected rejection but got HTTP " + result.getResponse().getStatus()));
        assertEquals(before, promotionRepository.count());
    }
}
