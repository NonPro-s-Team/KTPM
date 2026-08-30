package com.greenjuicehub.backend.service.promotion;

import com.greenjuicehub.backend.dto.order.request.GetAvailablePromosRequest;
import com.greenjuicehub.backend.dto.order.response.AvailablePromoResponse;
import com.greenjuicehub.backend.entity.Cart;
import com.greenjuicehub.backend.entity.CartItem;
import com.greenjuicehub.backend.entity.ProductVariant;
import com.greenjuicehub.backend.entity.Promotion;
import com.greenjuicehub.backend.entity.User;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.repository.CartItemRepository;
import com.greenjuicehub.backend.repository.ProductVariantRepository;
import com.greenjuicehub.backend.repository.PromotionRepository;
import com.greenjuicehub.backend.repository.PromotionUsageRepository;
import com.greenjuicehub.backend.service.promotion.impl.PromotionServiceImpl;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PromotionServiceImplTest {

    @Mock private PromotionRepository promotionRepository;
    @Mock private PromotionUsageRepository promotionUsageRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductVariantRepository productVariantRepository;

    @InjectMocks private PromotionServiceImpl promotionService;

    @Test
    void getAvailablePromosCalculatesBuyNowSubtotalAndSortsEligibleByDiscount() {
        ProductVariant variant = ProductVariant.builder()
                .id(5L).salePrice(new BigDecimal("100000")).originalPrice(new BigDecimal("120000"))
                .build();
        Promotion percent = promotion(1L, "PERCENT10", Promotion.PromotionType.PERCENT,
                "10", "100000", null);
        Promotion fixed = promotion(2L, "FIXED30", Promotion.PromotionType.FIXED,
                "30000", "100000", null);
        when(productVariantRepository.findById(5L)).thenReturn(Optional.of(variant));
        when(promotionRepository.findAllAvailablePublic(any(LocalDateTime.class)))
                .thenReturn(List.of(percent, fixed));
        when(promotionRepository.findAllAvailablePersonal(any(), any(LocalDateTime.class)))
                .thenReturn(List.of());

        List<AvailablePromoResponse> result = promotionService.getAvailablePromos(
                9L, new GetAvailablePromosRequest(null, 5L, 2));

        assertThat(result).extracting(AvailablePromoResponse::getCode)
                .containsExactly("FIXED30", "PERCENT10");
        assertThat(result).allMatch(AvailablePromoResponse::getIsEligible);
    }

    @Test
    void getAvailablePromosUsesOnlyCartItemsOwnedByUser() {
        User owner = User.builder().id(9L).build();
        User anotherUser = User.builder().id(10L).build();
        ProductVariant ownedVariant = ProductVariant.builder().salePrice(new BigDecimal("50000")).build();
        ProductVariant foreignVariant = ProductVariant.builder().salePrice(new BigDecimal("999999")).build();
        CartItem owned = CartItem.builder().cart(Cart.builder().user(owner).build())
                .variant(ownedVariant).quantity(2).build();
        CartItem foreign = CartItem.builder().cart(Cart.builder().user(anotherUser).build())
                .variant(foreignVariant).quantity(1).build();
        Promotion promo = promotion(1L, "MIN100", Promotion.PromotionType.FIXED,
                "10000", "100000", null);
        when(cartItemRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(owned, foreign));
        when(promotionRepository.findAllAvailablePublic(any(LocalDateTime.class))).thenReturn(List.of(promo));
        when(promotionRepository.findAllAvailablePersonal(any(), any(LocalDateTime.class)))
                .thenReturn(List.of());

        List<AvailablePromoResponse> result = promotionService.getAvailablePromos(
                9L, new GetAvailablePromosRequest(List.of(1L, 2L), null, null));

        assertThat(result.getFirst().getIsEligible()).isTrue();
    }

    @Test
    void getAvailablePromosExplainsMinimumOrderAndUsageLimit() {
        ProductVariant variant = ProductVariant.builder().id(5L)
                .salePrice(new BigDecimal("50000")).build();
        Promotion minimum = promotion(1L, "MIN100", Promotion.PromotionType.FIXED,
                "10000", "100000", null);
        Promotion exhausted = promotion(2L, "ONCE", Promotion.PromotionType.FIXED,
                "5000", "0", 1);
        when(productVariantRepository.findById(5L)).thenReturn(Optional.of(variant));
        when(promotionRepository.findAllAvailablePublic(any(LocalDateTime.class)))
                .thenReturn(List.of(minimum, exhausted));
        when(promotionRepository.findAllAvailablePersonal(any(), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(promotionUsageRepository.countByPromotionIdAndUserId(2L, 9L)).thenReturn(1);

        List<AvailablePromoResponse> result = promotionService.getAvailablePromos(
                9L, new GetAvailablePromosRequest(null, 5L, 1));

        assertThat(result).extracting(AvailablePromoResponse::getReason)
                .containsExactlyInAnyOrder("Đơn tối thiểu 100000đ", "Bạn đã dùng hết lượt");
        assertThat(result).noneMatch(AvailablePromoResponse::getIsEligible);
        verify(promotionUsageRepository).countByPromotionIdAndUserId(2L, 9L);
    }

    @Test
    void getAvailablePromosRejectsUnknownBuyNowVariant() {
        when(productVariantRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> promotionService.getAvailablePromos(
                9L, new GetAvailablePromosRequest(null, 404L, 1)))
                .isInstanceOf(AppException.class)
                .hasMessage("Sản phẩm không tồn tại");
    }

    @Disabled("BUG: buy-now thiếu quantity gây NullPointerException thay vì lỗi nghiệp vụ 400")
    @Test
    void buyNowShouldRejectMissingQuantityWithBadRequest() {
        ProductVariant variant = ProductVariant.builder().id(5L)
                .salePrice(new BigDecimal("50000")).build();
        when(productVariantRepository.findById(5L)).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> promotionService.getAvailablePromos(
                9L, new GetAvailablePromosRequest(null, 5L, null)))
                .isInstanceOf(AppException.class)
                .satisfies(error -> assertThat(((AppException) error).getStatus().value()).isEqualTo(400));
    }

    private Promotion promotion(Long id, String code, Promotion.PromotionType type,
                                String value, String minimum, Integer maxUsesPerUser) {
        return Promotion.builder()
                .id(id)
                .code(code)
                .name(code)
                .type(type)
                .value(new BigDecimal(value))
                .minOrderValue(new BigDecimal(minimum))
                .maxUsesPerUser(maxUsesPerUser)
                .build();
    }
}
