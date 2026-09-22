package com.greenjuicehub.backend.service.policy.impl;

import com.greenjuicehub.backend.dto.policy.request.SavePolicyRequest;
import com.greenjuicehub.backend.dto.policy.response.PolicyResponse;
import com.greenjuicehub.backend.entity.ShippingPolicy;
import com.greenjuicehub.backend.entity.ShippingPolicy.PolicyType;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.repository.PolicyRepository;
import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit test (Mockito) cho AdminPolicyServiceImpl.update(id, request).
 * Nguon: sheet BVA (TC-BVA-PL-01..09) + EP (TC-EP-PL-01..13), PUT /api/admin/policies/{id}.
 *
 * PHAM VI SERVICE LAYER:
 *  - Cac rang buoc @NotNull / @NotBlank / @Size nam o DTO va chi duoc kich hoat khi
 *    Controller co @Valid => o day service KHONG tu validate. Vi vay:
 *      + BVA title/content: kiem tra service nhan gia tri o bien va map/luu dung.
 *        Viec chan gia tri ngoai bien (400) duoc test o AdminPolicyControllerMockMvcIntegrationTest.
 *      + TC-EP-PL-01 (type null), TC-EP-PL-03 (enum sai), TC-EP-PL-11 (id = "abc")
 *        la loi binding/validation o Controller => KHONG test o file nay.
 *      + TC-EP-PL-04 / 07 (sortOrder, isActive null): Controller tra 400, nhung service co
 *        nhanh phong thu "null => giu nguyen gia tri cu" nen test hanh vi do o day.
 */
@ExtendWith(MockitoExtension.class)
class AdminPolicyServiceImplTest {

    private static final Long POLICY_ID = 1L;

    @Mock
    private PolicyRepository policyRepository;

    @InjectMocks
    private AdminPolicyServiceImpl adminPolicyService;

    @Captor
    private ArgumentCaptor<ShippingPolicy> entityCaptor;

    // ======================================================================
    // BVA (4n+1) - TC-BVA-PL-01 .. 09
    // ======================================================================

    // ---- Nominal ---------------------------------------------------------

    @Test
    void tcBvaPl01_nominal_allFieldsTypical_updatesSuccessfully() {
        SavePolicyRequest request = nominalRequest(); // title=100, content=5000, sortOrder=1, isActive=true

        PolicyResponse response = updateOk(request);
        ShippingPolicy saved = savedEntity();

        assertThat(saved.getType()).isEqualTo(PolicyType.SHIPPING);
        assertThat(saved.getTitle()).hasSize(100);
        assertThat(saved.getContent()).hasSize(5000);
        assertThat(saved.getSortOrder()).isEqualTo(1);
        assertThat(saved.getIsActive()).isTrue();

        assertThat(response.getId()).isEqualTo(POLICY_ID);
        assertThat(response.getTitle()).hasSize(100);
        assertThat(response.getContent()).hasSize(5000);
        // giu nguyen type => khong can check UNIQUE
        verify(policyRepository, never()).existsByTypeAndIdNot(any(), any());
    }

    // ---- title: 1 <= len <= 200 -----------------------------------------

    @Test
    void tcBvaPl02_title_min_1char_updatesSuccessfully() {
        assertTitleAccepted(1);
    }

    @Test
    void tcBvaPl03_title_minPlus1_2chars_updatesSuccessfully() {
        assertTitleAccepted(2);
    }

    @Test
    void tcBvaPl04_title_maxMinus1_199chars_updatesSuccessfully() {
        assertTitleAccepted(199);
    }

    @Test
    void tcBvaPl05_title_max_200chars_updatesSuccessfully() {
        assertTitleAccepted(200);
    }

    // ---- content: 1 <= len <= 10000 -------------------------------------

    @Test
    void tcBvaPl06_content_min_1char_updatesSuccessfully() {
        assertContentAccepted(1);
    }

    @Test
    void tcBvaPl07_content_minPlus1_2chars_updatesSuccessfully() {
        assertContentAccepted(2);
    }

    @Test
    void tcBvaPl08_content_maxMinus1_9999chars_updatesSuccessfully() {
        assertContentAccepted(9999);
    }

    @Test
    void tcBvaPl09_content_max_10000chars_updatesSuccessfully() {
        assertContentAccepted(10000);
    }

    // ======================================================================
    // EP - type (TC-EP-PL-02, 12, 13)
    // TC-EP-PL-01 (null) va TC-EP-PL-03 (enum sai) -> test o Controller
    // ======================================================================

    /** Valid class: 4 gia tri enum hop le (SHIPPING / RETURN / WARRANTY / TERMS). */
    @ParameterizedTest
    @EnumSource(PolicyType.class)
    void tcEpPl02_type_validEnumValue_updatesSuccessfully(PolicyType type) {
        SavePolicyRequest request = nominalRequest();
        request.setType(type);
        // existsByTypeAndIdNot khong stub => mock tra false (khong trung UNIQUE)

        PolicyResponse response = updateOk(request);

        assertThat(savedEntity().getType()).isEqualTo(type);
        assertThat(response.getType()).isEqualTo(type);
    }

    /** Invalid class: doi type sang type da ton tai o ban ghi khac => 409 Conflict. */
    @Test
    void tcEpPl12_type_duplicateOfAnotherRecord_throwsConflict() {
        ShippingPolicy existing = existingEntity(); // id=1, type=SHIPPING
        when(policyRepository.findById(POLICY_ID)).thenReturn(Optional.of(existing));
        when(policyRepository.existsByTypeAndIdNot(PolicyType.RETURN, POLICY_ID)).thenReturn(true);

        SavePolicyRequest request = nominalRequest();
        request.setType(PolicyType.RETURN); // ban ghi id=2 da co type=RETURN

        assertAppException(() -> adminPolicyService.update(POLICY_ID, request),
                HttpStatus.CONFLICT,
                "Chính sách loại \"RETURN\" đã tồn tại.");

        verify(policyRepository, never()).save(any(ShippingPolicy.class));
        // entity khong bi sua khi bi tu choi
        assertThat(existing.getType()).isEqualTo(PolicyType.SHIPPING);
        assertThat(existing.getTitle()).isEqualTo("Old title");
    }

    /** Valid class: giu nguyen type cua chinh no => khong vi pham UNIQUE, khong goi check trung. */
    @Test
    void tcEpPl13_type_unchanged_updatesSuccessfully_withoutUniqueCheck() {
        SavePolicyRequest request = nominalRequest();
        request.setType(PolicyType.SHIPPING); // giong type hien tai cua entity

        updateOk(request);

        assertThat(savedEntity().getType()).isEqualTo(PolicyType.SHIPPING);
        verify(policyRepository, never()).existsByTypeAndIdNot(any(), any());
    }

    /** Valid class (nhanh con lai cua TC-EP-PL-13): doi sang type chua ai dung. */
    @Test
    void tcEpPl13b_type_changedToUnusedType_updatesSuccessfully() {
        when(policyRepository.findById(POLICY_ID)).thenReturn(Optional.of(existingEntity()));
        when(policyRepository.existsByTypeAndIdNot(PolicyType.WARRANTY, POLICY_ID)).thenReturn(false);
        when(policyRepository.save(any(ShippingPolicy.class))).thenAnswer(inv -> inv.getArgument(0));

        SavePolicyRequest request = nominalRequest();
        request.setType(PolicyType.WARRANTY);

        adminPolicyService.update(POLICY_ID, request);

        verify(policyRepository).existsByTypeAndIdNot(PolicyType.WARRANTY, POLICY_ID);
        verify(policyRepository).save(entityCaptor.capture());
        assertThat(entityCaptor.getValue().getType()).isEqualTo(PolicyType.WARRANTY);
    }

    // ======================================================================
    // EP - sortOrder (TC-EP-PL-04, 05, 06)
    // ======================================================================

    /**
     * TC-EP-PL-04: sortOrder null.
     * Controller: 400 (@NotNull) - xem MockMvc test.
     * Service: nhanh phong thu => KHONG ghi de, giu nguyen gia tri cu.
     */
    @Test
    void tcEpPl04_sortOrder_null_keepsOldValue() {
        SavePolicyRequest request = nominalRequest();
        request.setSortOrder(null);

        updateOk(request);

        assertThat(savedEntity().getSortOrder()).isEqualTo(5); // gia tri cu trong existingEntity()
    }

    @Test
    void tcEpPl05_sortOrder_validValue_updatesSuccessfully() {
        SavePolicyRequest request = nominalRequest();
        request.setSortOrder(1);

        updateOk(request);

        assertThat(savedEntity().getSortOrder()).isEqualTo(1);
    }

    /**
     * TC-EP-PL-06: sortOrder = -1. Code khong co @Min => service van luu.
     * CAN XAC NHAN business rule voi PO: neu sortOrder am khong hop le thi phai them @Min(0)
     * va khi do test nay phai doi thanh 400 o Controller.
     */
    @Test
    void tcEpPl06_sortOrder_negative_isCurrentlyAccepted() {
        SavePolicyRequest request = nominalRequest();
        request.setSortOrder(-1);

        updateOk(request);

        assertThat(savedEntity().getSortOrder()).isEqualTo(-1);
    }

    // ======================================================================
    // EP - isActive (TC-EP-PL-07, 08)
    // ======================================================================

    /**
     * TC-EP-PL-07: isActive null.
     * Controller: 400 (@NotNull). Service: giu nguyen gia tri cu.
     */
    @Test
    void tcEpPl07_isActive_null_keepsOldValue() {
        SavePolicyRequest request = nominalRequest();
        request.setIsActive(null);

        updateOk(request);

        assertThat(savedEntity().getIsActive()).isFalse(); // gia tri cu trong existingEntity()
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void tcEpPl08_isActive_validValue_updatesSuccessfully(boolean isActive) {
        SavePolicyRequest request = nominalRequest();
        request.setIsActive(isActive);

        PolicyResponse response = updateOk(request);

        assertThat(savedEntity().getIsActive()).isEqualTo(isActive);
        assertThat(response).hasFieldOrPropertyWithValue("isActive", isActive);
    }

    // ======================================================================
    // EP - path {id} (TC-EP-PL-09, 10)
    // TC-EP-PL-11 (id = "abc") -> loi parse path variable o Controller
    // ======================================================================

    @Test
    void tcEpPl09_id_exists_updatesAndReturnsLatestResponse() {
        SavePolicyRequest request = nominalRequest();
        request.setTitle("Tieu de moi");
        request.setContent("Noi dung moi");
        request.setSortOrder(3);
        request.setIsActive(true);

        PolicyResponse response = updateOk(request);

        verify(policyRepository).findById(POLICY_ID);
        ShippingPolicy saved = savedEntity();
        assertThat(saved.getId()).isEqualTo(POLICY_ID);
        assertThat(saved.getTitle()).isEqualTo("Tieu de moi");
        assertThat(saved.getContent()).isEqualTo("Noi dung moi");
        assertThat(saved.getSortOrder()).isEqualTo(3);
        assertThat(saved.getIsActive()).isTrue();

        assertThat(response.getId()).isEqualTo(POLICY_ID);
        assertThat(response.getTitle()).isEqualTo("Tieu de moi");
        assertThat(response.getContent()).isEqualTo("Noi dung moi");
        assertThat(response.getSortOrder()).isEqualTo(3);
    }

    @Test
    void tcEpPl10_id_notFound_throwsNotFound() {
        when(policyRepository.findById(999999L)).thenReturn(Optional.empty());

        assertAppException(() -> adminPolicyService.update(999999L, nominalRequest()),
                HttpStatus.NOT_FOUND,
                "Không tìm thấy chính sách với id: 999999");

        verify(policyRepository, never()).existsByTypeAndIdNot(any(), any());
        verify(policyRepository, never()).save(any(ShippingPolicy.class));
    }

    // ======================================================================
    // HELPERS
    // ======================================================================

    /** Ban ghi hien co trong DB: gia tri cu khac nominal de de nhan ra thay doi. */
    private ShippingPolicy existingEntity() {
        return ShippingPolicy.builder()
                .id(POLICY_ID)
                .type(PolicyType.SHIPPING)
                .title("Old title")
                .content("Old content")
                .sortOrder(5)
                .isActive(false)
                .build();
    }

    /** Request Nominal: type=SHIPPING; title=100 ky tu; content=5000 ky tu; sortOrder=1; isActive=true. */
    private SavePolicyRequest nominalRequest() {
        SavePolicyRequest request = new SavePolicyRequest();
        request.setType(PolicyType.SHIPPING);
        request.setTitle("a".repeat(100));
        request.setContent("a".repeat(5000));
        request.setSortOrder(1);
        request.setIsActive(true);
        return request;
    }

    /** Stub findById + save (tra ve chinh entity duoc luu) roi goi service.update. */
    private PolicyResponse updateOk(SavePolicyRequest request) {
        when(policyRepository.findById(POLICY_ID)).thenReturn(Optional.of(existingEntity()));
        when(policyRepository.save(any(ShippingPolicy.class))).thenAnswer(inv -> inv.getArgument(0));
        return adminPolicyService.update(POLICY_ID, request);
    }

    /** Lay entity ma service da truyen vao repository.save(). */
    private ShippingPolicy savedEntity() {
        verify(policyRepository).save(entityCaptor.capture());
        return entityCaptor.getValue();
    }

    private void assertTitleAccepted(int length) {
        SavePolicyRequest request = nominalRequest();
        request.setTitle("a".repeat(length));

        PolicyResponse response = updateOk(request);
        ShippingPolicy saved = savedEntity();

        assertThat(saved.getTitle()).hasSize(length);
        assertThat(response.getTitle()).hasSize(length);
        // cac field khac giu Nominal
        assertThat(saved.getContent()).hasSize(5000);
        assertThat(saved.getSortOrder()).isEqualTo(1);
        assertThat(saved.getIsActive()).isTrue();
        assertThat(saved.getType()).isEqualTo(PolicyType.SHIPPING);
    }

    private void assertContentAccepted(int length) {
        SavePolicyRequest request = nominalRequest();
        request.setContent("a".repeat(length));

        PolicyResponse response = updateOk(request);
        ShippingPolicy saved = savedEntity();

        assertThat(saved.getContent()).hasSize(length);
        assertThat(response.getContent()).hasSize(length);
        // cac field khac giu Nominal
        assertThat(saved.getTitle()).hasSize(100);
        assertThat(saved.getSortOrder()).isEqualTo(1);
        assertThat(saved.getIsActive()).isTrue();
        assertThat(saved.getType()).isEqualTo(PolicyType.SHIPPING);
    }

    /** AppException co getStatus() (HttpStatus) va getMessage() -> assert ca hai. */
    private static void assertAppException(ThrowingCallable call, HttpStatus status, String message) {
        assertThatThrownBy(call)
                .isInstanceOfSatisfying(AppException.class, ex -> {
                    assertThat(ex.getStatus()).isEqualTo(status);
                    assertThat(ex.getMessage()).isEqualTo(message);
                });
    }
}