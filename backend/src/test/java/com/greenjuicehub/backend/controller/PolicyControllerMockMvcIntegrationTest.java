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

@WebMvcTest(PolicyController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class PolicyControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IPolicyService policyService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void anonymousUserGetsAllActivePolicies() throws Exception {
        when(policyService.getAll()).thenReturn(List.of(
                PolicyResponse.builder().id(1L).type(PolicyType.SHIPPING).title("Giao hàng").sortOrder(1).build(),
                PolicyResponse.builder().id(2L).type(PolicyType.RETURN).title("Đổi trả").sortOrder(2).build()));

        mockMvc.perform(get("/api/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(2)))
                .andExpect(jsonPath("$[0].type").value("SHIPPING"))
                .andExpect(jsonPath("$[1].type").value("RETURN"));
    }

    @Test
    void anonymousUserGetsPolicyByType() throws Exception {
        when(policyService.getByType("shipping")).thenReturn(PolicyResponse.builder()
                .id(1L).type(PolicyType.SHIPPING).title("Chính sách giao hàng").content("Nội dung").build());

        mockMvc.perform(get("/api/policies/shipping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Chính sách giao hàng"));
    }

    @Test
    void getByTypeMapsAppExceptionToNotFound() throws Exception {
        when(policyService.getByType("unknown"))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy chính sách: unknown"));

        mockMvc.perform(get("/api/policies/unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Không tìm thấy chính sách: unknown"));
    }
}