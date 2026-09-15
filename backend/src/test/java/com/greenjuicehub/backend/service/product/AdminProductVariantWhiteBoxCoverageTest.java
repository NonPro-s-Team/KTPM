package com.greenjuicehub.backend.service.product;

import com.greenjuicehub.backend.dto.adminProduct.request.SaveVariantRequest;
import com.greenjuicehub.backend.dto.adminProduct.response.AdminVariantResponse;
import com.greenjuicehub.backend.entity.Product;
import com.greenjuicehub.backend.entity.ProductVariant;
import com.greenjuicehub.backend.mapper.ProductMapper;
import com.greenjuicehub.backend.repository.CategoryRepository;
import com.greenjuicehub.backend.repository.FlavorRepository;
import com.greenjuicehub.backend.repository.ProductImageRepository;
import com.greenjuicehub.backend.repository.ProductRepository;
import com.greenjuicehub.backend.repository.ProductTagRepository;
import com.greenjuicehub.backend.repository.ProductVariantRepository;
import com.greenjuicehub.backend.repository.SizeRepository;
import com.greenjuicehub.backend.service.product.impl.AdminProductServiceImpl;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * QLPT-370 - White-box coverage for the defensive null-price branches in
 * AdminProductServiceImpl.calcDiscount. Bean validation rejects these inputs
 * at the HTTP boundary; the direct service tests verify the internal fallback.
 */
@ExtendWith(MockitoExtension.class)
class AdminProductVariantWhiteBoxCoverageTest {

    @Mock private ProductRepository productRepository;
    @Mock private ProductVariantRepository variantRepository;
    @Mock private ProductImageRepository imageRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private FlavorRepository flavorRepository;
    @Mock private SizeRepository sizeRepository;
    @Mock private ProductMapper productMapper;
    @Mock private ProductTagRepository productTagRepository;

    @InjectMocks private AdminProductServiceImpl productService;

    @ParameterizedTest(name = "original={0}, sale={1} uses zero discount fallback")
    @MethodSource("nullPricePartitions")
    void createVariantCoversDefensiveNullPricePartitions(
            String originalPrice, String salePrice) {
        Product product = Product.builder().id(30L).isDeleted(false).build();
        when(productRepository.findById(30L)).thenReturn(Optional.of(product));
        when(variantRepository.save(any(ProductVariant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AdminVariantResponse response = productService.createVariant(
                30L, variantRequest(originalPrice, salePrice));

        assertThat(response.getDiscountPercent()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getStockQty()).isZero();
    }

    private static Stream<Arguments> nullPricePartitions() {
        return Stream.of(
                Arguments.of(null, "0"),
                Arguments.of("100000", null)
        );
    }

    private SaveVariantRequest variantRequest(String originalPrice, String salePrice) {
        SaveVariantRequest request = new SaveVariantRequest();
        ReflectionTestUtils.setField(request, "originalPrice",
                originalPrice == null ? null : new BigDecimal(originalPrice));
        ReflectionTestUtils.setField(request, "salePrice",
                salePrice == null ? null : new BigDecimal(salePrice));
        ReflectionTestUtils.setField(request, "stockQty", 0);
        return request;
    }
}
