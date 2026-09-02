package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.dashboard.response.DashboardSummaryResponse;
import com.greenjuicehub.backend.entity.TagDefinition;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.repository.TagDefinitionRepository;
import com.greenjuicehub.backend.service.banner.IBannerService;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.contact.IAdminContactService;
import com.greenjuicehub.backend.service.dashboard.IDashboardService;
import com.greenjuicehub.backend.service.order.IAdminOrderService;
import com.greenjuicehub.backend.service.policy.IAdminPolicyService;
import com.greenjuicehub.backend.service.product.IAdminProductService;
import com.greenjuicehub.backend.service.promotion.IAdminPromotionService;
import com.greenjuicehub.backend.service.review.IReviewService;
import com.greenjuicehub.backend.service.user.IAdminUserService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        AdminBannerController.class,
        AdminContactController.class,
        AdminOrderController.class,
        AdminPolicyController.class,
        AdminProductController.class,
        AdminPromotionController.class,
        AdminReviewController.class,
        AdminTagController.class,
        AdminUserController.class,
        DashboardController.class
})
@Import({GlobalExceptionHandler.class,
        AdminDashboardMockMvcIntegrationTest.TestSecurityConfiguration.class})
@ActiveProfiles("test")
class AdminDashboardMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IBannerService bannerService;
    @MockitoBean private IAdminContactService contactService;
    @MockitoBean private IAdminOrderService orderService;
    @MockitoBean private IAdminPolicyService policyService;
    @MockitoBean private IAdminProductService productService;
    @MockitoBean private IAdminPromotionService promotionService;
    @MockitoBean private IReviewService reviewService;
    @MockitoBean private TagDefinitionRepository tagRepository;
    @MockitoBean private IAdminUserService userService;
    @MockitoBean private IDashboardService dashboardService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfiguration {

        @Bean
        SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .httpBasic(Customizer.withDefaults())
                    .build();
        }
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanReachRepresentativeEndpointOfEveryAdminController() throws Exception {
        when(bannerService.getAllBanners()).thenReturn(List.of());
        when(orderService.getWeeklyOrderCounts()).thenReturn(Map.of());
        when(policyService.getAllForAdmin()).thenReturn(List.of());
        when(productService.getAllCategoriesForAdmin()).thenReturn(List.of());
        when(tagRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of());
        when(dashboardService.getRevenueChart("7d")).thenReturn(List.of());

        mockMvc.perform(get("/api/admin/banners")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/contacts/stats")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/orders/weekly-counts")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/policies")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/products/categories")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/promotions/1")).andExpect(status().isOk());
        mockMvc.perform(patch("/api/admin/reviews/1/toggle")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/tags")).andExpect(status().isOk());
        mockMvc.perform(patch("/api/admin/users/1/toggle-active")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/dashboard/revenue-chart")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void dashboardAllowsStaffAndUsesDefaultChartRange() throws Exception {
        when(dashboardService.getRevenueChart("7d")).thenReturn(List.of());

        mockMvc.perform(get("/api/admin/dashboard/revenue-chart"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        verify(dashboardService).getRevenueChart("7d");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void dashboardSerializesSummaryReturnedByService() throws Exception {
        when(dashboardService.getSummary()).thenReturn(DashboardSummaryResponse.builder()
                .revenueToday(new BigDecimal("125000.00"))
                .revenueThisWeek(new BigDecimal("700000.00"))
                .revenueThisMonth(new BigDecimal("2500000.00"))
                .newOrdersCount(4L)
                .lowStockVariantsCount(3L)
                .pendingReviewsCount(2L)
                .build());

        mockMvc.perform(get("/api/admin/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revenueToday").value(125000.00))
                .andExpect(jsonPath("$.newOrdersCount").value(4))
                .andExpect(jsonPath("$.lowStockVariantsCount").value(3))
                .andExpect(jsonPath("$.pendingReviewsCount").value(2));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void dashboardRejectsCustomer() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/summary"))
                .andExpect(status().isForbidden());

        verify(dashboardService, never()).getSummary();
    }

    @Test
    void adminTagRejectsAnonymousUser() throws Exception {
        mockMvc.perform(get("/api/admin/tags"))
                .andExpect(status().isUnauthorized());

        verify(tagRepository, never()).findAllByOrderBySortOrderAsc();
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void adminTagRejectsCustomer() throws Exception {
        mockMvc.perform(get("/api/admin/tags"))
                .andExpect(status().isForbidden());

        verify(tagRepository, never()).findAllByOrderBySortOrderAsc();
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void adminTagRejectsStaff() throws Exception {
        mockMvc.perform(post("/api/admin/tags")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"detox\"}"))
                .andExpect(status().isForbidden());

        verify(tagRepository, never()).existsByName(any());
        verify(tagRepository, never()).save(any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminTagReturnsTagsForAdmin() throws Exception {
        when(tagRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(
                TagDefinition.builder()
                        .id(1L)
                        .name("detox")
                        .isActive(true)
                        .sortOrder(0)
                        .build()));

        mockMvc.perform(get("/api/admin/tags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("detox"))
                .andExpect(jsonPath("$[0].isActive").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminTagReturnsConflictForDuplicateName() throws Exception {
        when(tagRepository.existsByName("detox")).thenReturn(true);

        mockMvc.perform(post("/api/admin/tags")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"  DeTox  \"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Tag đã tồn tại"));

        verify(tagRepository, never()).save(any());
    }
}
