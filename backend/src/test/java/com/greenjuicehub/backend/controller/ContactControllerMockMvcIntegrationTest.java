package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.contact.response.ContactResponse;
import com.greenjuicehub.backend.entity.Contact.ContactStatus;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.contact.IContactService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test case nguon: Sheet "TC-BVA-CT-xx" (Boundary Value Analysis) va "TC-EP-CT-xx"
 * (Equivalence Partitioning) cho API POST /api/contacts - FR-CONTACT-01 (Gui lien he).
 *
 * Quy uoc chung cho request hop le duoc dung lam nen (baseline) khi test tung field rieng le:
 *   fullName = "Nguyen Van A"
 *   email    = "a@example.com"
 *   phone    = "0900000000"
 *   subject  = "Hoi ve don hang"
 *   message  = "Noi dung hop le"
 *
 * Field message chi co @NotBlank, KHONG co @Size => khong co test bien tren do dai (dung sheet).
 * Field phone KHONG co @Pattern => chuoi khong phai so nhung <=15 ky tu van duoc chap nhan (TC-EP-CT-09).
 */
@WebMvcTest(ContactController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class ContactControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IContactService contactService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    // ===================== Helpers =====================

    private static String repeat(String ch, int len) {
        return ch.repeat(len);
    }

    /** Sinh email co tong do dai chinh xac = totalLen, dang: local@domain.co */
    private static String emailOfLength(int totalLen) {
        String tld = ".co"; // 3 ky tu, nhan cuoi cung cua domain
        int remaining = totalLen - 1 - tld.length(); // tru '@' va ".co"
        if (remaining < 2) {
            throw new IllegalArgumentException("totalLen qua nho de tao email hop le: " + totalLen);
        }

        // Uu tien lap day local part (toi da 64), phan con lai danh cho domain (truoc .co)
        int localLen = Math.min(64, remaining - 1); // -1 de domain con it nhat 1 ky tu truoc ".co"
        int domainMainLen = remaining - localLen;

        StringBuilder domainMain = new StringBuilder();
        int left = domainMainLen;
        while (left > 0) {
            int labelLen = Math.min(63, left); // moi nhan domain toi da 63 ky tu (RFC 1035)
            if (domainMain.length() > 0) domainMain.append('.');
            domainMain.append("b".repeat(labelLen));
            left -= labelLen;
        }

        return "a".repeat(localLen) + "@" + domainMain + tld;
    }

    private void mockServiceCreatesSuccessfully() {
        when(contactService.createContact(any())).thenReturn(ContactResponse.builder()
                .id(1L).fullName("Nguyen Van A").email("a@example.com")
                .subject("Hoi ve don hang").status(ContactStatus.NEW).build());
    }

    private String requestJson(String fullName, String email, String phone,
                               String subject, String message) {
        return """
                {
                  "fullName": %s,
                  "email": %s,
                  "phone": %s,
                  "subject": %s,
                  "message": %s
                }
                """.formatted(
                jsonStr(fullName), jsonStr(email), jsonStr(phone),
                jsonStr(subject), jsonStr(message));
    }

    /** null -> gia tri JSON null (tuong duong khong truyen field); nguoc lai bao trong dau nhay kep. */
    private String jsonStr(String value) {
        if (value == null) return "null";
        return "\"" + value.replace("\"", "\\\"") + "\"";
    }

    // ===================== BVA - fullName (TC-BVA-CT-01..07) =====================
    // Rule: @NotBlank + @Size(max=100) => 1 <= len(fullName) <= 100

    @Test
    @DisplayName("TC-BVA-CT-01: fullName rong (Min-1=0) => 400 vi pham @NotBlank")
    void bvaCt01_fullNameEmpty_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("", "a@example.com", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-BVA-CT-02: fullName do dai 1 (Min) => 200")
    void bvaCt02_fullNameLength1_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 1), "a@example.com", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-03: fullName do dai 2 (Min+1) => 200")
    void bvaCt03_fullNameLength2_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 2), "a@example.com", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-04: fullName do dai 50 (Nominal) => 200")
    void bvaCt04_fullNameLength50_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 50), "a@example.com", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-05: fullName do dai 99 (Max-1) => 200")
    void bvaCt05_fullNameLength99_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 99), "a@example.com", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-06: fullName do dai 100 (Max) => 200")
    void bvaCt06_fullNameLength100_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 100), "a@example.com", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-07: fullName do dai 101 (Max+1) => 400 vuot @Size(max=100)")
    void bvaCt07_fullNameLength101_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 101), "a@example.com", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    // ===================== BVA - email (TC-BVA-CT-08..12) =====================
    // Rule: @NotBlank + @Size(max=100) + @Email => 1 <= len(email) <= 100
    // Bo diem Min/Min+1 vi @Email khien chuoi qua ngan khong the hop dinh dang.

    @Test
    @DisplayName("TC-BVA-CT-08: email rong (Min-1=0) => 400 vi pham @NotBlank")
    void bvaCt08_emailEmpty_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-BVA-CT-09: email do dai 50 (Nominal) => 200")
    void bvaCt09_emailLength50_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", emailOfLength(50), "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-10: email do dai 99 (Max-1) => 200")
    void bvaCt10_emailLength99_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", emailOfLength(99), "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-11: email do dai 100 (Max) => 200")
    void bvaCt11_emailLength100_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", emailOfLength(100), "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-12: email do dai 101 (Max+1) => 400 vuot @Size(max=100)")
    void bvaCt12_emailLength101_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", emailOfLength(101), "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    // ===================== BVA - phone (TC-BVA-CT-13..15) =====================
    // Rule: @Size(max=15), khong bat buoc => 0 <= len(phone) <= 15

    @Test
    @DisplayName("TC-BVA-CT-13: phone do dai 14 (Max-1) => 200")
    void bvaCt13_phoneLength14_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", repeat("0", 14),
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-14: phone do dai 15 (Max) => 200")
    void bvaCt14_phoneLength15_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", repeat("0", 15),
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-15: phone do dai 16 (Max+1) => 400 vuot @Size(max=15)")
    void bvaCt15_phoneLength16_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", repeat("0", 16),
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    // ===================== BVA - subject (TC-BVA-CT-16..22) =====================
    // Rule: @NotBlank + @Size(max=200) => 1 <= len(subject) <= 200

    @Test
    @DisplayName("TC-BVA-CT-16: subject rong (Min-1=0) => 400 vi pham @NotBlank")
    void bvaCt16_subjectEmpty_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                "", "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-BVA-CT-17: subject do dai 1 (Min) => 200")
    void bvaCt17_subjectLength1_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                repeat("a", 1), "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-18: subject do dai 2 (Min+1) => 200")
    void bvaCt18_subjectLength2_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                repeat("a", 2), "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-19: subject do dai 100 (Nominal) => 200")
    void bvaCt19_subjectLength100_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                repeat("a", 100), "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-20: subject do dai 199 (Max-1) => 200")
    void bvaCt20_subjectLength199_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                repeat("a", 199), "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-21: subject do dai 200 (Max) => 200")
    void bvaCt21_subjectLength200_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                repeat("a", 200), "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-CT-22: subject do dai 201 (Max+1) => 400 vuot @Size(max=200)")
    void bvaCt22_subjectLength201_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                repeat("a", 201), "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    // ===================== EP - Equivalence Partitioning (TC-EP-CT-01..12) =====================

    @Test
    @DisplayName("TC-EP-CT-01: Happy path - toan bo field hop le => 200, status=NEW")
    void epCt01_happyPath_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("NEW"));
    }

    @Test
    @DisplayName("TC-EP-CT-02: fullName rong/khoang trang => 400 - Ho ten khong duoc de trong")
    void epCt02_fullNameBlank_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(" ", "a@example.com", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("fullName: Họ tên không được để trống"));
    }

    @Test
    @DisplayName("TC-EP-CT-03: fullName vuot @Size(max=100) (101 ky tu) => 400")
    void epCt03_fullNameTooLong_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 101), "a@example.com", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-EP-CT-04: email rong => 400 - Email khong duoc de trong")
    void epCt04_emailBlank_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("email: Email không được để trống"));
    }

    @Test
    @DisplayName("TC-EP-CT-05: email sai dinh dang => 400 - Email khong hop le")
    void epCt05_emailWrongFormat_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "khong-phai-email", "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("email: Email không hợp lệ"));
    }

    @Test
    @DisplayName("TC-EP-CT-06: email vuot @Size(max=100) (101 ky tu) => 400")
    void epCt06_emailTooLong_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", emailOfLength(101), "0900000000",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-EP-CT-07: phone khong truyen (optional) => 200")
    void epCt07_phoneNull_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", null,
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-EP-CT-08: phone vuot @Size(max=15) (16 ky tu) => 400")
    void epCt08_phoneTooLong_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0123456789012345",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-EP-CT-09: phone sai dinh dang nhung <=15 ky tu => 200 " +
            "(GHI CHU: chua co @Pattern rang buoc - nghi ngo gap validate, can bao cao)")
    void epCt09_phoneWrongFormatButWithinLength_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "abc-xyz!!",
                                "Hoi ve don hang", "Noi dung hop le")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-EP-CT-10: subject rong => 400 - Chu de khong duoc de trong")
    void epCt10_subjectBlank_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                "", "Noi dung hop le")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("subject: Chủ đề không được để trống"));
    }

    @Test
    @DisplayName("TC-EP-CT-11: subject vuot @Size(max=200) (201 ky tu) => 400")
    void epCt11_subjectTooLong_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                repeat("a", 201), "Noi dung hop le")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-EP-CT-12: message rong/khoang trang => 400 - Noi dung khong duoc de trong")
    void epCt12_messageBlank_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Nguyen Van A", "a@example.com", "0900000000",
                                "Hoi ve don hang", " ")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("message: Nội dung không được để trống"));
    }
}