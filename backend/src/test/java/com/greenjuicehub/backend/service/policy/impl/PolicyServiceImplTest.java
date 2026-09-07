package com.greenjuicehub.backend.service.policy.impl;

import com.greenjuicehub.backend.dto.policy.response.PolicyResponse;
import com.greenjuicehub.backend.entity.ShippingPolicy;
import com.greenjuicehub.backend.entity.ShippingPolicy.PolicyType;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.repository.PolicyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PolicyServiceImplTest {

    @Mock private PolicyRepository policyRepository;

    @InjectMocks private PolicyServiceImpl policyService;

    @Test
    void getByTypeReturnsActivePolicyMappedToResponse() {
        LocalDateTime updatedAt = LocalDateTime.of(2026, 8, 20, 10, 0);
        ShippingPolicy policy = ShippingPolicy.builder()
                .id(1L).type(PolicyType.SHIPPING).title("Chính sách giao hàng")
                .content("Nội dung").sortOrder(1).isActive(true).updatedAt(updatedAt).build();

        when(policyRepository.findByTypeAndIsActiveTrue(PolicyType.SHIPPING))
                .thenReturn(Optional.of(policy));

        PolicyResponse result = policyService.getByType("shipping");

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getType()).isEqualTo(PolicyType.SHIPPING);
        assertThat(result.getTitle()).isEqualTo("Chính sách giao hàng");
        assertThat(result.getUpdatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void getByTypeIsCaseInsensitive() {
        ShippingPolicy policy = ShippingPolicy.builder()
                .id(2L).type(PolicyType.RETURN).title("Đổi trả").content("...").sortOrder(2).isActive(true).build();

        when(policyRepository.findByTypeAndIsActiveTrue(PolicyType.RETURN))
                .thenReturn(Optional.of(policy));

        assertThat(policyService.getByType("ReTuRn").getType()).isEqualTo(PolicyType.RETURN);
    }

    @Test
    void getByTypeThrowsForUnknownTypeString() {
        assertThatThrownBy(() -> policyService.getByType("INVALID_TYPE"))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Loại chính sách không hợp lệ");
    }

    @Test
    void getByTypeThrowsWhenNoActivePolicyForType() {
        when(policyRepository.findByTypeAndIsActiveTrue(PolicyType.WARRANTY))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> policyService.getByType("WARRANTY"))
                .isInstanceOf(AppException.class)
                .hasMessage("Không tìm thấy chính sách: WARRANTY");
    }

    @Test
    void getAllReturnsActivePoliciesOrderedBySortOrder() {
        ShippingPolicy p1 = ShippingPolicy.builder().id(1L).type(PolicyType.SHIPPING)
                .title("Giao hàng").content("...").sortOrder(1).isActive(true).build();
        ShippingPolicy p2 = ShippingPolicy.builder().id(2L).type(PolicyType.RETURN)
                .title("Đổi trả").content("...").sortOrder(2).isActive(true).build();

        when(policyRepository.findAllByIsActiveTrueOrderBySortOrderAsc()).thenReturn(List.of(p1, p2));

        List<PolicyResponse> result = policyService.getAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getType()).isEqualTo(PolicyType.SHIPPING);
        assertThat(result.get(1).getType()).isEqualTo(PolicyType.RETURN);
    }
}