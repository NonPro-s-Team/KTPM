package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.banner.response.BannerResponse;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.banner.IBannerService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test case nguon: Sheet "TC-BVA-BN-xx" (Boundary Value Analysis) va "TC-EP-BN-xx"
 * (Equivalence Partitioning) cho API POST /api/admin/banners - FR-ADMIN-BANNER-01 (Tao banner).
 *
 * Quy uoc chung cho request hop le (Nominal) duoc dung lam nen khi test tung field rieng le:
 *   title       = 100 ky tu
 *   description = 250 ky tu
 *   imageUrl    = 250 ky tu
 *   linkUrl     = 250 ky tu
 *   sortOrder   = 1
 *   isActive    = true
 *
 * Field description va linkUrl KHONG bat buoc (@Size, khong @NotBlank) => min hop le = 0/rong.
 * Field imageUrl KHONG co @Pattern/@URL => chuoi bat ky (khong dung dinh dang URL) van duoc
 * chap nhan neu do dai hop le (TC-EP-BN-08) - nghi ngo gap validate, ghi chu lai trong test.
 * Field sortOrder KHONG co @Min(0) => so am van duoc chap nhan (TC-EP-BN-12) - nghi ngo gap
 * validate ve nghiep vu, can xac nhan lai voi PO.
 *
 * GHI CHU VE SECURITY: /api/admin/banners KHONG nam trong danh sach permitAll cua
 * ControllerMockMvcTestSecurityConfiguration (chi /api/banners - route public - duoc permitAll),
 * nen moi request toi day deu roi vao .anyRequest().authenticated(). Ngoai ra AdminBannerController
 * con co @PreAuthorize("hasRole('ADMIN')") o cap class. Vi vay can @WithMockUser(roles = "ADMIN")
 * o cap class de gia lap mot admin da dang nhap, tranh 401/403 khong lien quan den validation
 * dang duoc test (BVA/EP tren SaveBannerRequest).
 */
@WebMvcTest(AdminBannerController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
@WithMockUser(roles = "ADMIN")
class AdminBannerControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IBannerService bannerService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    // ===================== Helpers =====================

    private static String repeat(String ch, int len) {
        return ch.repeat(len);
    }

    private void mockServiceCreatesSuccessfully() {
        when(bannerService.createBanner(any())).thenReturn(BannerResponse.builder()
                .id(1L).title("Sale he").description("Uu dai mua he")
                .imageUrl("https://cdn.test/1.png").linkUrl("https://shop.test")
                .sortOrder(1).isActive(true).build());
    }

    private String requestJson(String title, String description, String imageUrl,
                               String linkUrl, Integer sortOrder, Boolean isActive) {
        return """
                {
                  "title": %s,
                  "description": %s,
                  "imageUrl": %s,
                  "linkUrl": %s,
                  "sortOrder": %s,
                  "isActive": %s
                }
                """.formatted(
                jsonStr(title), jsonStr(description), jsonStr(imageUrl),
                jsonStr(linkUrl), jsonRaw(sortOrder), jsonRaw(isActive));
    }

    /** null -> gia tri JSON null (tuong duong khong truyen field); nguoc lai bao trong dau nhay kep. */
    private String jsonStr(String value) {
        if (value == null) return "null";
        return "\"" + value.replace("\"", "\\\"") + "\"";
    }

    /** Dung cho field khong phai String (Integer, Boolean) - khong bao trong dau nhay kep. */
    private String jsonRaw(Object value) {
        return value == null ? "null" : String.valueOf(value);
    }

    /** Request Nominal day du, dung lam nen khi override tung field. */
    private String nominalRequestWith(String titleOverride, String descriptionOverride,
                                      String imageUrlOverride, String linkUrlOverride,
                                      Integer sortOrderOverride, Boolean isActiveOverride) {
        return requestJson(
                titleOverride != null ? titleOverride : repeat("a", 100),
                descriptionOverride != null ? descriptionOverride : repeat("a", 250),
                imageUrlOverride != null ? imageUrlOverride : repeat("a", 250),
                linkUrlOverride != null ? linkUrlOverride : repeat("a", 250),
                sortOrderOverride != null ? sortOrderOverride : 1,
                isActiveOverride != null ? isActiveOverride : Boolean.TRUE);
    }

    // ===================== BVA - Boundary Value Analysis =====================

    @Test
    @DisplayName("TC-BVA-BN-01: Nominal - tat ca field o gia tri dien hinh => 200")
    void bvaBn01_allFieldsNominal_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, null, null, null, null)))
                .andExpect(status().isOk());
    }

    // ---- title: @NotBlank + @Size(max=200) => 1 <= len(title) <= 200 ----

    @Test
    @DisplayName("TC-BVA-BN-02: title do dai 1 (Min) => 200")
    void bvaBn02_titleLength1_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(repeat("a", 1), null, null, null, null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-03: title do dai 2 (Min+1) => 200")
    void bvaBn03_titleLength2_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(repeat("a", 2), null, null, null, null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-04: title do dai 199 (Max-1) => 200")
    void bvaBn04_titleLength199_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(repeat("a", 199), null, null, null, null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-05: title do dai 200 (Max) => 200")
    void bvaBn05_titleLength200_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(repeat("a", 200), null, null, null, null, null)))
                .andExpect(status().isOk());
    }

    // ---- description: @Size(max=500), khong bat buoc => 0 <= len(description) <= 500 ----

    @Test
    @DisplayName("TC-BVA-BN-06: description rong (Min=0) => 200")
    void bvaBn06_descriptionEmpty_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, "", null, null, null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-07: description do dai 1 (Min+1) => 200")
    void bvaBn07_descriptionLength1_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, repeat("a", 1), null, null, null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-08: description do dai 499 (Max-1) => 200")
    void bvaBn08_descriptionLength499_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, repeat("a", 499), null, null, null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-09: description do dai 500 (Max) => 200")
    void bvaBn09_descriptionLength500_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, repeat("a", 500), null, null, null, null)))
                .andExpect(status().isOk());
    }

    // ---- imageUrl: @NotBlank + @Size(max=500) => 1 <= len(imageUrl) <= 500 ----

    @Test
    @DisplayName("TC-BVA-BN-10: imageUrl do dai 1 (Min) => 200")
    void bvaBn10_imageUrlLength1_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, repeat("a", 1), null, null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-11: imageUrl do dai 2 (Min+1) => 200")
    void bvaBn11_imageUrlLength2_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, repeat("a", 2), null, null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-12: imageUrl do dai 499 (Max-1) => 200")
    void bvaBn12_imageUrlLength499_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, repeat("a", 499), null, null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-13: imageUrl do dai 500 (Max) => 200")
    void bvaBn13_imageUrlLength500_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, repeat("a", 500), null, null, null)))
                .andExpect(status().isOk());
    }

    // ---- linkUrl: @Size(max=500), khong bat buoc => 0 <= len(linkUrl) <= 500 ----

    @Test
    @DisplayName("TC-BVA-BN-14: linkUrl rong (Min=0) => 200")
    void bvaBn14_linkUrlEmpty_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, null, "", null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-15: linkUrl do dai 1 (Min+1) => 200")
    void bvaBn15_linkUrlLength1_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, null, repeat("a", 1), null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-16: linkUrl do dai 499 (Max-1) => 200")
    void bvaBn16_linkUrlLength499_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, null, repeat("a", 499), null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-BVA-BN-17: linkUrl do dai 500 (Max) => 200")
    void bvaBn17_linkUrlLength500_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, null, repeat("a", 500), null, null)))
                .andExpect(status().isOk());
    }

    // ===================== EP - Equivalence Partitioning =====================

    @Test
    @DisplayName("TC-EP-BN-01: Happy path - toan bo field hop le => 200")
    void epBn01_happyPath_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Sale he", "...", "https://cdn.test/1.png",
                                "https://shop.test", 1, true)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Sale he"));
    }

    @Test
    @DisplayName("TC-EP-BN-02: title rong => 400 - Tieu de khong duoc de trong")
    void epBn02_titleBlank_returns400() throws Exception {
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith("", null, null, null, null, null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("title: Tiêu đề không được để trống"));
    }

    @Test
    @DisplayName("TC-EP-BN-03: title vuot @Size(max=200) (201 ky tu) => 400")
    void epBn03_titleTooLong_returns400() throws Exception {
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(repeat("a", 201), null, null, null, null, null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("title: Tiêu đề tối đa 200 ký tự"));
    }

    @Test
    @DisplayName("TC-EP-BN-04: description khong truyen (optional, null) => 200")
    void epBn04_descriptionNull_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 100), null, repeat("a", 250),
                                repeat("a", 250), 1, true)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-EP-BN-05: description vuot @Size(max=500) (501 ky tu) => 400")
    void epBn05_descriptionTooLong_returns400() throws Exception {
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, repeat("a", 501), null, null, null, null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("description: Mô tả tối đa 500 ký tự"));
    }

    @Test
    @DisplayName("TC-EP-BN-06: imageUrl rong => 400 - URL anh khong duoc de trong")
    void epBn06_imageUrlBlank_returns400() throws Exception {
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, "", null, null, null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("imageUrl: URL ảnh không được để trống"));
    }

    @Test
    @DisplayName("TC-EP-BN-07: imageUrl vuot @Size(max=500) (501 ky tu) => 400")
    void epBn07_imageUrlTooLong_returns400() throws Exception {
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, repeat("a", 501), null, null, null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("imageUrl: URL ảnh tối đa 500 ký tự"));
    }

    @Test
    @DisplayName("TC-EP-BN-08: imageUrl khong dung dinh dang URL that nhung do dai hop le => 200 " +
            "(GHI CHU: chua co @Pattern/@URL rang buoc - nghi ngo gap validate, can bao cao)")
    void epBn08_imageUrlWrongFormatButValidLength_returns200() throws Exception {
        // Ky vong ly thuyet: 400 (khong phai URL hop le). Thuc te code CHUA co @Pattern/@URL
        // rang buoc dinh dang tren imageUrl - day la test mo ta HANH VI THUC TE hien tai,
        // khong phai hanh vi mong muon. Can bao cao lai voi team de xac nhan co bo sung
        // validate hay khong.
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, "day-khong-phai-url", null, null, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-EP-BN-09: linkUrl khong truyen (optional, null) => 200")
    void epBn09_linkUrlNull_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 100), repeat("a", 250), repeat("a", 250),
                                null, 1, true)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-EP-BN-10: linkUrl vuot @Size(max=500) (501 ky tu) => 400")
    void epBn10_linkUrlTooLong_returns400() throws Exception {
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, null, repeat("a", 501), null, null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("linkUrl: URL liên kết tối đa 500 ký tự"));
    }

    @Test
    @DisplayName("TC-EP-BN-11: sortOrder null => 400 - Thu tu khong duoc de trong")
    void epBn11_sortOrderNull_returns400() throws Exception {
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 100), repeat("a", 250), repeat("a", 250),
                                repeat("a", 250), null, true)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("sortOrder: Thứ tự không được để trống"));
    }

    @Test
    @DisplayName("TC-EP-BN-12: sortOrder am (-1) => 200 " +
            "(GHI CHU: chua co @Min(0) - can hoi lai PO ve nghiep vu)")
    void epBn12_sortOrderNegative_returns200() throws Exception {
        // Thuc te: 200 OK (code khong chan so am). Can hoi lai nghiep vu: sortOrder am co
        // hop ly khong, hay day la gap validate can bo sung @Min(0) vao SaveBannerRequest.
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, null, null, -1, null)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-EP-BN-13: isActive null => 400 - Trang thai khong duoc de trong")
    void epBn13_isActiveNull_returns400() throws Exception {
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(repeat("a", 100), repeat("a", 250), repeat("a", 250),
                                repeat("a", 250), 1, null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("isActive: Trạng thái không được để trống"));
    }

    @Test
    @DisplayName("TC-EP-BN-14a: isActive = true => 200")
    void epBn14a_isActiveTrue_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, null, null, null, true)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-EP-BN-14b: isActive = false => 200")
    void epBn14b_isActiveFalse_returns200() throws Exception {
        mockServiceCreatesSuccessfully();
        mockMvc.perform(post("/api/admin/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nominalRequestWith(null, null, null, null, null, false)))
                .andExpect(status().isOk());
    }
}