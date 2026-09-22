package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.policy.request.SavePolicyRequest;
import com.greenjuicehub.backend.dto.policy.response.PolicyResponse;
import com.greenjuicehub.backend.entity.ShippingPolicy.PolicyType;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.policy.IAdminPolicyService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test case dua tren sheet BVA (TC-BVA-PL-01..09) + EP (TC-EP-PL-01..13)
 * cho AdminPolicyController - PUT /api/admin/policies/{id} (FR-ADMIN-POLICY-01).
 *
 * Service duoc mock; test nay kiem tra tang Controller: @Valid + JSON binding + path variable
 * binding + GlobalExceptionHandler. Khi request khong hop le thi service KHONG duoc goi.
 *
 * Message ky vong duoc doi chieu voi GlobalExceptionHandler:
 *  - MethodArgumentNotValidException     -> "<field>: <default message>"  (nen dung containsString)
 *  - MethodArgumentTypeMismatchException -> "Tham số '<name>' nhận giá trị không hợp lệ"
 *  - AppException                        -> status + message cua chinh AppException
 *  - HttpMessageNotReadableException     -> 2 nhanh (xem tcEpPl03)
 *
 * Body JSON duoc ghep bang String (helper body(...)) de khong phu thuoc phien ban Jackson;
 * tham so null => bo qua field do trong JSON ("khong truyen").
 *
 * Phan quyen: Controller co @PreAuthorize("hasRole('ADMIN')") va test security config bat
 * @EnableMethodSecurity => mac dinh ca class chay voi @WithMockUser(roles = "ADMIN");
 * test nao can role khac thi ghi de bang @WithMockUser / @WithAnonymousUser o cap method.
 * Luu y thu tu xu ly: @Valid chay TRUOC @PreAuthorize (argument resolution truoc khi goi method),
 * nen test 403 phai gui body hop le.
 *
 * Cuoi file co 8 test EXTRA (TC-EXTRA-PL-xx) - khong nam trong sheet 4n+1,
 * co the xoa hoac them vao sheet.
 */
@WebMvcTest(AdminPolicyController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
@WithMockUser(roles = "ADMIN")
class AdminPolicyControllerMockMvcIntegrationTest {

    private static final Long POLICY_ID = 1L;
    private static final String TITLE_NOMINAL = "a".repeat(100);
    private static final String CONTENT_NOMINAL = "a".repeat(5000);

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IAdminPolicyService adminPolicyService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    // ======================================================================
    // BVA (4n+1) - TC-BVA-PL-01 .. 09 (deu ky vong 200 OK)
    // ======================================================================

    @Test
    void tcBvaPl01_nominal_allFieldsTypical_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", TITLE_NOMINAL, CONTENT_NOMINAL, 1, true));

        assertThat(sent.getType()).isEqualTo(PolicyType.SHIPPING);
        assertThat(sent.getTitle()).hasSize(100);
        assertThat(sent.getContent()).hasSize(5000);
        assertThat(sent.getSortOrder()).isEqualTo(1);
        assertThat(sent.getIsActive()).isTrue();
    }

    // ---- title: 1 <= len <= 200 -----------------------------------------

    @Test
    void tcBvaPl02_title_min_1char_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", "a".repeat(1), CONTENT_NOMINAL, 1, true));
        assertThat(sent.getTitle()).hasSize(1);
    }

    @Test
    void tcBvaPl03_title_minPlus1_2chars_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", "a".repeat(2), CONTENT_NOMINAL, 1, true));
        assertThat(sent.getTitle()).hasSize(2);
    }

    @Test
    void tcBvaPl04_title_maxMinus1_199chars_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", "a".repeat(199), CONTENT_NOMINAL, 1, true));
        assertThat(sent.getTitle()).hasSize(199);
    }

    @Test
    void tcBvaPl05_title_max_200chars_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", "a".repeat(200), CONTENT_NOMINAL, 1, true));
        assertThat(sent.getTitle()).hasSize(200);
    }

    // ---- content: 1 <= len <= 10000 -------------------------------------

    @Test
    void tcBvaPl06_content_min_1char_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", TITLE_NOMINAL, "a".repeat(1), 1, true));
        assertThat(sent.getContent()).hasSize(1);
    }

    @Test
    void tcBvaPl07_content_minPlus1_2chars_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", TITLE_NOMINAL, "a".repeat(2), 1, true));
        assertThat(sent.getContent()).hasSize(2);
    }

    @Test
    void tcBvaPl08_content_maxMinus1_9999chars_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", TITLE_NOMINAL, "a".repeat(9999), 1, true));
        assertThat(sent.getContent()).hasSize(9999);
    }

    @Test
    void tcBvaPl09_content_max_10000chars_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", TITLE_NOMINAL, "a".repeat(10000), 1, true));
        assertThat(sent.getContent()).hasSize(10000);
    }

    // ======================================================================
    // EP - type (TC-EP-PL-01, 02, 03)
    // ======================================================================

    /** Invalid class: type null / khong truyen => 400 (@NotNull). */
    @Test
    void tcEpPl01_type_null_returns400() throws Exception {
        expectBadRequest(
                body(null, TITLE_NOMINAL, CONTENT_NOMINAL, 1, true),
                "Loại chính sách không được để trống");
    }

    /** Valid class: 4 gia tri enum hop le => 200. */
    @ParameterizedTest
    @EnumSource(PolicyType.class)
    void tcEpPl02_type_validEnumValue_returns200(PolicyType type) throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body(type.name(), TITLE_NOMINAL, CONTENT_NOMINAL, 1, true));
        assertThat(sent.getType()).isEqualTo(type);
    }

    /**
     * Invalid class: chuoi khong thuoc enum => 400 (loi deserialize JSON).
     *
     * GlobalExceptionHandler.handleUnreadableBody co 2 nhanh cho HttpMessageNotReadableException:
     *  (1) cause la com.fasterxml.jackson.databind.exc.InvalidFormatException (Jackson 2) + target la enum
     *      -> "Giá trị 'INVALID_TYPE' không hợp lệ cho trường 'type'. Giá trị cho phép: [...]"
     *  (2) cac truong hop con lai (bao gom Jackson 3 - package tools.jackson.*, vi handler chi
     *      instanceof Jackson 2) -> "Dữ liệu JSON không hợp lệ hoặc không đọc được".
     * Test chap nhan ca 2 message de khong phu thuoc phien ban Jackson dang dung.
     * Neu du an dung Jackson 3 thi nhanh (1) cua handler khong bao gio chay -> nen xem lai handler.
     */
    @Test
    void tcEpPl03_type_notInEnum_returns400() throws Exception {
        performUpdate(POLICY_ID, body("INVALID_TYPE", TITLE_NOMINAL, CONTENT_NOMINAL, 1, true))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(anyOf(
                        containsString("Giá trị 'INVALID_TYPE' không hợp lệ cho trường 'type'"),
                        containsString("Dữ liệu JSON không hợp lệ hoặc không đọc được"))));

        verifyNoInteractions(adminPolicyService);
    }

    // ======================================================================
    // EP - sortOrder (TC-EP-PL-04, 05, 06)
    // ======================================================================

    @Test
    void tcEpPl04_sortOrder_null_returns400() throws Exception {
        expectBadRequest(
                body("SHIPPING", TITLE_NOMINAL, CONTENT_NOMINAL, null, true),
                "Thứ tự không được để trống");
    }

    @Test
    void tcEpPl05_sortOrder_validValue_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", TITLE_NOMINAL, CONTENT_NOMINAL, 1, true));
        assertThat(sent.getSortOrder()).isEqualTo(1);
    }

    /**
     * TC-EP-PL-06: sortOrder = -1. Hien DTO khong co @Min => 200 OK.
     * CAN XAC NHAN business rule voi PO; neu khong hop le thi them @Min(0) va doi test nay thanh 400.
     */
    @Test
    void tcEpPl06_sortOrder_negative_isCurrentlyAccepted_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", TITLE_NOMINAL, CONTENT_NOMINAL, -1, true));
        assertThat(sent.getSortOrder()).isEqualTo(-1);
    }

    // ======================================================================
    // EP - isActive (TC-EP-PL-07, 08)
    // ======================================================================

    @Test
    void tcEpPl07_isActive_null_returns400() throws Exception {
        expectBadRequest(
                body("SHIPPING", TITLE_NOMINAL, CONTENT_NOMINAL, 1, null),
                "Trạng thái không được để trống");
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void tcEpPl08_isActive_validValue_returns200(boolean isActive) throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", TITLE_NOMINAL, CONTENT_NOMINAL, 1, isActive));
        assertThat(sent.getIsActive()).isEqualTo(isActive);
    }

    // ======================================================================
    // EP - path {id} (TC-EP-PL-09, 10, 11)
    // ======================================================================

    @Test
    void tcEpPl09_id_exists_returns200WithLatestResponse() throws Exception {
        when(adminPolicyService.update(eq(POLICY_ID), any(SavePolicyRequest.class)))
                .thenReturn(PolicyResponse.builder()
                        .id(POLICY_ID)
                        .type(PolicyType.SHIPPING)
                        .title("Chính sách vận chuyển")
                        .content("Nội dung mới")
                        .sortOrder(1)
                        .isActive(true)
                        .build());

        performUpdate(POLICY_ID, body("SHIPPING", TITLE_NOMINAL, CONTENT_NOMINAL, 1, true))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.type").value("SHIPPING"))
                .andExpect(jsonPath("$.title").value("Chính sách vận chuyển"))
                .andExpect(jsonPath("$.content").value("Nội dung mới"));
    }

    @Test
    void tcEpPl10_id_notFound_returns404() throws Exception {
        when(adminPolicyService.update(eq(999999L), any(SavePolicyRequest.class)))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy chính sách với id: 999999"));

        performUpdate(999999L, body("SHIPPING", TITLE_NOMINAL, CONTENT_NOMINAL, 1, true))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Không tìm thấy chính sách với id: 999999"));
    }

    /** MethodArgumentTypeMismatchException -> handleTypeMismatch: "Tham số 'id' nhận giá trị không hợp lệ". */
    @Test
    void tcEpPl11_id_notNumeric_returns400() throws Exception {
        performUpdate("abc", body("SHIPPING", TITLE_NOMINAL, CONTENT_NOMINAL, 1, true))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(containsString("Tham số 'id' nhận giá trị không hợp lệ")));

        verifyNoInteractions(adminPolicyService);
    }

    // ======================================================================
    // EP - UNIQUE constraint tren type (TC-EP-PL-12, 13)
    // ======================================================================

    /** Invalid class: doi type trung voi ban ghi khac => service nem 409, handler map ra 409. */
    @Test
    void tcEpPl12_type_duplicateOfAnotherRecord_returns409() throws Exception {
        when(adminPolicyService.update(eq(POLICY_ID), any(SavePolicyRequest.class)))
                .thenThrow(new AppException(HttpStatus.CONFLICT,
                        "Chính sách loại \"RETURN\" đã tồn tại."));

        performUpdate(POLICY_ID, body("RETURN", TITLE_NOMINAL, CONTENT_NOMINAL, 1, true))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Chính sách loại \"RETURN\" đã tồn tại."));
    }

    /** Valid class: giu nguyen type => 200. */
    @Test
    void tcEpPl13_type_unchanged_returns200() throws Exception {
        SavePolicyRequest sent = performUpdateExpectOk(
                body("SHIPPING", TITLE_NOMINAL, CONTENT_NOMINAL, 1, true));
        assertThat(sent.getType()).isEqualTo(PolicyType.SHIPPING);
    }

    // ======================================================================
    // HELPERS
    // ======================================================================

    /**
     * Ghep JSON body. Tham so null => khong dua field vao JSON (mo phong "khong truyen / null").
     * type nhan String de gui duoc ca gia tri khong hop le (vd "INVALID_TYPE").
     * Cac gia tri title/content trong test chi gom ky tu 'a' nen khong can escape.
     */
    private static String body(String type, String title, String content,
                               Integer sortOrder, Boolean isActive) {
        List<String> fields = new ArrayList<>();
        if (type != null)      fields.add("\"type\":\"" + type + "\"");
        if (title != null)     fields.add("\"title\":\"" + title + "\"");
        if (content != null)   fields.add("\"content\":\"" + content + "\"");
        if (sortOrder != null) fields.add("\"sortOrder\":" + sortOrder);
        if (isActive != null)  fields.add("\"isActive\":" + isActive);
        return "{" + String.join(",", fields) + "}";
    }

    private ResultActions performUpdate(Object id, String body) throws Exception {
        return mockMvc.perform(put("/api/admin/policies/{id}", id)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    /** Gui request hop le, expect 200 va tra ve request ma service nhan duoc de assert them. */
    private SavePolicyRequest performUpdateExpectOk(String body) throws Exception {
        when(adminPolicyService.update(eq(POLICY_ID), any(SavePolicyRequest.class)))
                .thenReturn(PolicyResponse.builder()
                        .id(POLICY_ID)
                        .type(PolicyType.SHIPPING)
                        .title("ok")
                        .content("ok")
                        .sortOrder(1)
                        .isActive(true)
                        .build());

        performUpdate(POLICY_ID, body)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("SHIPPING"));

        ArgumentCaptor<SavePolicyRequest> captor = ArgumentCaptor.forClass(SavePolicyRequest.class);
        verify(adminPolicyService).update(eq(POLICY_ID), captor.capture());
        return captor.getValue();
    }

    /** Gui request khong hop le, expect 400 + message chua doan mong doi + service khong bi goi. */
    private void expectBadRequest(String body, String expectedMessagePart) throws Exception {
        performUpdate(POLICY_ID, body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(containsString(expectedMessagePart)));

        verifyNoInteractions(adminPolicyService);
    }
}