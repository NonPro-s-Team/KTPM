package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.policy.response.PolicyResponse;
import com.greenjuicehub.backend.entity.ShippingPolicy.PolicyType;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.policy.IPolicyService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test case dua tren sheet EP cho PolicyController (FR-POLICY-01).
 * Endpoint GET /api/policies va GET /api/policies/{type} khong co truong nao
 * co the chia bien (do dai, so...) nen chi ap dung Equivalence Partitioning,
 * khong co Boundary Value Analysis.
 *
 * Nguon: TC-EP-PL-01 .. TC-EP-PL-08
 */
@WebMvcTest(PolicyController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class PolicyControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IPolicyService policyService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    // ======================================================================
    // TC-EP-PL-01: GET /api/policies (khong co input) - Valid Class
    // ======================================================================

    @Test
    void tcEpPl01_getAll_returnsOnlyActivePolicies() throws Exception {
        when(policyService.getAll()).thenReturn(List.of(
                PolicyResponse.builder().id(1L).type(PolicyType.SHIPPING).title("Giao hàng").sortOrder(1).build(),
                PolicyResponse.builder().id(2L).type(PolicyType.RETURN).title("Đổi trả").sortOrder(2).build()));

        mockMvc.perform(get("/api/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(2)))
                .andExpect(jsonPath("$[0].type").value("SHIPPING"))
                .andExpect(jsonPath("$[1].type").value("RETURN"));
    }

    // ======================================================================
    // TC-EP-PL-02 .. 05: GET /api/policies/{type} - Valid Class (4 loai hop le)
    // ======================================================================

    @Test
    void tcEpPl02_getByType_shipping_returns200() throws Exception {
        when(policyService.getByType("SHIPPING")).thenReturn(PolicyResponse.builder()
                .id(1L).type(PolicyType.SHIPPING).title("Chính sách vận chuyển").content("Nội dung").build());

        mockMvc.perform(get("/api/policies/SHIPPING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("SHIPPING"))
                .andExpect(jsonPath("$.title").value("Chính sách vận chuyển"));
    }

    @Test
    void tcEpPl03_getByType_return_returns200() throws Exception {
        when(policyService.getByType("RETURN")).thenReturn(PolicyResponse.builder()
                .id(2L).type(PolicyType.RETURN).title("Chính sách đổi trả").content("Nội dung").build());

        mockMvc.perform(get("/api/policies/RETURN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("RETURN"))
                .andExpect(jsonPath("$.title").value("Chính sách đổi trả"));
    }

    @Test
    void tcEpPl04_getByType_warranty_returns200() throws Exception {
        when(policyService.getByType("WARRANTY")).thenReturn(PolicyResponse.builder()
                .id(3L).type(PolicyType.WARRANTY).title("Chính sách bảo hành").content("Nội dung").build());

        mockMvc.perform(get("/api/policies/WARRANTY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("WARRANTY"))
                .andExpect(jsonPath("$.title").value("Chính sách bảo hành"));
    }

    @Test
    void tcEpPl05_getByType_terms_returns200() throws Exception {
        when(policyService.getByType("TERMS")).thenReturn(PolicyResponse.builder()
                .id(4L).type(PolicyType.TERMS).title("Điều khoản").content("Nội dung").build());

        mockMvc.perform(get("/api/policies/TERMS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("TERMS"))
                .andExpect(jsonPath("$.title").value("Điều khoản"));
    }

    // ======================================================================
    // TC-EP-PL-06: type chu thuong / lan - Valid Class (case-insensitive)
    // ======================================================================

    @Test
    void tcEpPl06_getByType_lowercase_isCaseInsensitive_returns200() throws Exception {
        // Controller chuyen path variable nguyen ban xuong service; chinh
        // PolicyServiceImpl.parseType() moi la noi .toUpperCase() truoc khi
        // parse enum. Mock dung theo input goc "shipping" ma controller truyen xuong.
        when(policyService.getByType("shipping")).thenReturn(PolicyResponse.builder()
                .id(1L).type(PolicyType.SHIPPING).title("Chính sách vận chuyển").content("Nội dung").build());

        mockMvc.perform(get("/api/policies/shipping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("SHIPPING"));
    }

    // ======================================================================
    // TC-EP-PL-07: type khong khop enum nao - Invalid Class - Unknown Type
    // ======================================================================

    @Test
    void tcEpPl07_getByType_unknownType_returns400() throws Exception {
        when(policyService.getByType("SHIPPING2"))
                .thenThrow(new AppException(HttpStatus.BAD_REQUEST,
                        "Loại chính sách không hợp lệ: SHIPPING2. Hợp lệ: SHIPPING, RETURN, WARRANTY, TERMS"));

        mockMvc.perform(get("/api/policies/SHIPPING2"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(
                        "Loại chính sách không hợp lệ: SHIPPING2. Hợp lệ: SHIPPING, RETURN, WARRANTY, TERMS"));
    }

    // ======================================================================
    // TC-EP-PL-08: type hop le nhung khong co ban ghi active - Invalid Class
    // - Valid Type but Inactive/Not Found
    // ======================================================================

    @Test
    void tcEpPl08_getByType_validTypeButInactive_returns404() throws Exception {
        when(policyService.getByType("WARRANTY"))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy chính sách: WARRANTY"));

        mockMvc.perform(get("/api/policies/WARRANTY"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Không tìm thấy chính sách: WARRANTY"));
    }
}