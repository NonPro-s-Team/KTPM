package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.PageResponse;
import com.greenjuicehub.backend.dto.adminOrder.request.AdminRefundRequest;
import com.greenjuicehub.backend.dto.adminProduct.response.AdminProductRowResponse;
import com.greenjuicehub.backend.dto.adminPromotion.response.PromotionUsageResponse;
import com.greenjuicehub.backend.dto.adminUser.response.AdminUserResponse;
import com.greenjuicehub.backend.dto.banner.response.BannerResponse;
import com.greenjuicehub.backend.dto.contact.response.ContactResponse;
import com.greenjuicehub.backend.dto.dashboard.response.DashboardSummaryResponse;
import com.greenjuicehub.backend.dto.dashboard.response.RevenuePointResponse;
import com.greenjuicehub.backend.dto.policy.response.PolicyResponse;
import com.greenjuicehub.backend.entity.TagDefinition;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.repository.TagDefinitionRepository;
import com.greenjuicehub.backend.service.banner.IBannerService;
import com.greenjuicehub.backend.service.contact.IAdminContactService;
import com.greenjuicehub.backend.service.dashboard.IDashboardService;
import com.greenjuicehub.backend.service.order.IAdminOrderService;
import com.greenjuicehub.backend.service.policy.IAdminPolicyService;
import com.greenjuicehub.backend.service.product.IAdminProductService;
import com.greenjuicehub.backend.service.promotion.IAdminPromotionService;
import com.greenjuicehub.backend.service.review.IReviewService;
import com.greenjuicehub.backend.service.user.IAdminUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminControllersUnitTest {

    @Mock private IBannerService bannerService;
    @Mock private IAdminContactService contactService;
    @Mock private IAdminOrderService orderService;
    @Mock private IAdminPolicyService policyService;
    @Mock private IAdminProductService productService;
    @Mock private IAdminPromotionService promotionService;
    @Mock private IReviewService reviewService;
    @Mock private TagDefinitionRepository tagRepository;
    @Mock private IAdminUserService userService;
    @Mock private IDashboardService dashboardService;

    @InjectMocks private AdminBannerController bannerController;
    @InjectMocks private AdminContactController contactController;
    @InjectMocks private AdminOrderController orderController;
    @InjectMocks private AdminPolicyController policyController;
    @InjectMocks private AdminProductController productController;
    @InjectMocks private AdminPromotionController promotionController;
    @InjectMocks private AdminReviewController reviewController;
    @InjectMocks private AdminTagController tagController;
    @InjectMocks private AdminUserController userController;
    @InjectMocks private DashboardController dashboardController;

    @Test
    void bannerControllerReturnsServiceData() {
        List<BannerResponse> expected = List.of();
        when(bannerService.getAllBanners()).thenReturn(expected);

        var response = bannerController.getAllBanners();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(expected);
        verify(bannerService).getAllBanners();
    }

    @Test
    void contactControllerConvertsPageAndForwardsFilters() {
        when(contactService.getContacts(any(), any(Pageable.class)))
                .thenReturn(Page.empty());

        var response = contactController.getContacts("NEW", Pageable.ofSize(10));

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().totalElements()).isZero();
        verify(contactService).getContacts("NEW", Pageable.ofSize(10));
    }

    @Test
    void orderControllerCreatesEmptyRefundRequestWhenBodyIsMissing() {
        var captor = ArgumentCaptor.forClass(AdminRefundRequest.class);

        orderController.refund(12L, null);

        verify(orderService).refund(org.mockito.ArgumentMatchers.eq(12L), captor.capture());
        assertThat(captor.getValue()).isNotNull();
    }

    @Test
    void policyControllerReturnsToggledPolicy() {
        PolicyResponse expected = org.mockito.Mockito.mock(PolicyResponse.class);
        when(policyService.toggleActive(3L)).thenReturn(expected);

        var response = policyController.toggleActive(3L);

        assertThat(response.getBody()).isSameAs(expected);
        verify(policyService).toggleActive(3L);
    }

    @Test
    void productControllerForwardsAllSearchParameters() {
        Page<AdminProductRowResponse> page = Page.empty();
        when(productService.getProductsForAdmin(
                "detox", 2L, true, "LOW", "green", false, 1, 25))
                .thenReturn(page);

        var response = productController.getProducts(
                "detox", 2L, true, "LOW", "green", false, 1, 25);

        PageResponse<AdminProductRowResponse> body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.content()).isEmpty();
        verify(productService).getProductsForAdmin(
                "detox", 2L, true, "LOW", "green", false, 1, 25);
    }

    @Test
    void productControllerReturnsNoContentAfterDelete() {
        var response = productController.deleteProduct(8L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(productService).deleteProduct(8L);
    }

    @Test
    void promotionControllerConvertsUsageHistoryPage() {
        Page<PromotionUsageResponse> page = Page.empty();
        when(promotionService.getUsageHistory(5L, 2, 15)).thenReturn(page);

        var response = promotionController.getUsageHistory(5L, 2, 15);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().number()).isZero();
        verify(promotionService).getUsageHistory(5L, 2, 15);
    }

    @Test
    void reviewControllerForwardsReplyContent() {
        AdminReviewController.ReplyRequest request = new AdminReviewController.ReplyRequest();
        request.setReply("Cảm ơn bạn");

        reviewController.replyReview(9L, request);

        verify(reviewService).replyReview(9L, "Cảm ơn bạn");
    }

    @Test
    void tagControllerNormalizesNameBeforeSaving() {
        when(tagRepository.existsByName("detox")).thenReturn(false);
        when(tagRepository.save(any(TagDefinition.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = tagController.create(Map.of("name", "  DeTox  "));

        ArgumentCaptor<TagDefinition> captor = ArgumentCaptor.forClass(TagDefinition.class);
        verify(tagRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("detox");
        assertThat(captor.getValue().getIsActive()).isTrue();
        assertThat(response.getBody()).isSameAs(captor.getValue());
    }

    @Test
    void tagControllerRejectsDuplicateName() {
        when(tagRepository.existsByName("detox")).thenReturn(true);

        assertThatThrownBy(() -> tagController.create(Map.of("name", "DETOX")))
                .isInstanceOf(AppException.class)
                .hasMessage("Tag đã tồn tại");
        verify(tagRepository, never()).save(any());
    }

    @Test
    void tagControllerTogglesExistingTag() {
        TagDefinition tag = TagDefinition.builder().id(4L).name("fresh").isActive(true).build();
        when(tagRepository.findById(4L)).thenReturn(Optional.of(tag));
        when(tagRepository.save(tag)).thenReturn(tag);

        var response = tagController.toggle(4L);

        assertThat(response.getBody()).isSameAs(tag);
        assertThat(tag.getIsActive()).isFalse();
        verify(tagRepository).save(tag);
    }

    @Test
    void tagControllerReportsMissingTag() {
        when(tagRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tagController.toggle(99L))
                .isInstanceOf(AppException.class)
                .hasMessage("Tag không tồn tại");
        verify(tagRepository, never()).save(any());
    }

    @Test
    void userControllerConvertsUserPage() {
        Page<AdminUserResponse> page = Page.empty();
        when(userService.getUsers(org.mockito.ArgumentMatchers.isNull(),
                org.mockito.ArgumentMatchers.eq("STAFF"),
                org.mockito.ArgumentMatchers.eq(true), any(Pageable.class)))
                .thenReturn(page);

        var response = userController.getUsers(null, "STAFF", true, 0, 20);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().content()).isEmpty();
        verify(userService).getUsers(org.mockito.ArgumentMatchers.isNull(),
                org.mockito.ArgumentMatchers.eq("STAFF"),
                org.mockito.ArgumentMatchers.eq(true), any(Pageable.class));
    }

    @Test
    void dashboardControllerReturnsSummary() {
        DashboardSummaryResponse expected = DashboardSummaryResponse.builder()
                .revenueToday(new BigDecimal("125000.00"))
                .newOrdersCount(4L)
                .build();
        when(dashboardService.getSummary()).thenReturn(expected);

        var response = dashboardController.getSummary();

        assertThat(response.getBody()).isSameAs(expected);
        verify(dashboardService).getSummary();
    }

    @Test
    void dashboardControllerForwardsChartRange() {
        List<RevenuePointResponse> expected = List.of(
                RevenuePointResponse.builder()
                        .label("24/08")
                        .revenue(new BigDecimal("99000.00"))
                        .orderCount(2L)
                        .build());
        when(dashboardService.getRevenueChart("30d")).thenReturn(expected);

        var response = dashboardController.getRevenueChart("30d");

        assertThat(response.getBody()).isSameAs(expected);
        verify(dashboardService).getRevenueChart("30d");
    }
}
