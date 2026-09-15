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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * QLPT-361/362 - verifies that representative EP values are persisted on create and update.
 */
@ExtendWith(MockitoExtension.class)
class AdminProductVariantPersistenceEpTest {

    @Mock private ProductRepository productRepository;
    @Mock private ProductVariantRepository variantRepository;
    @Mock private ProductImageRepository imageRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private FlavorRepository flavorRepository;
    @Mock private SizeRepository sizeRepository;
    @Mock private ProductMapper productMapper;
    @Mock private ProductTagRepository productTagRepository;

    @InjectMocks private AdminProductServiceImpl productService;

    @ParameterizedTest(name = "create stock={0}, prices={1}/{2} persists discount={3}")
    @CsvSource({
            "0,          100000, 100000,   0.00",
            "25,         100000,  80000,  20.00",
            "2147483647, 100000,      0, 100.00",
            "10,              0,      0,   0.00"
    })
    void createPersistsRepresentativeValidPartitions(
            int stockQty, String originalPrice, String salePrice, String expectedDiscount) {
        Product product = activeProduct();
        when(productRepository.findById(30L)).thenReturn(Optional.of(product));
        when(variantRepository.save(any(ProductVariant.class)))
                .thenAnswer(invocation -> {
                    ProductVariant saved = invocation.getArgument(0);
                    saved.setId(101L);
                    return saved;
                });

        AdminVariantResponse response = productService.createVariant(
                30L, variantRequest(stockQty, originalPrice, salePrice));

        ArgumentCaptor<ProductVariant> captor = ArgumentCaptor.forClass(ProductVariant.class);
        verify(variantRepository).save(captor.capture());
        ProductVariant saved = captor.getValue();

        assertThat(saved.getProduct()).isSameAs(product);
        assertThat(saved.getStockQty()).isEqualTo(stockQty);
        assertThat(saved.getDiscountPercent()).isEqualByComparingTo(expectedDiscount);
        assertThat(response.getStockQty()).isEqualTo(stockQty);
        assertThat(response.getDiscountPercent()).isEqualByComparingTo(expectedDiscount);
    }

    @ParameterizedTest(name = "update stock={0}, prices={1}/{2} persists discount={3}")
    @CsvSource({
            "0,  100000,      0, 100.00",
            "40, 100000,  75000,  25.00"
    })
    void updatePersistsRepresentativeValidPartitions(
            int stockQty, String originalPrice, String salePrice, String expectedDiscount) {
        ProductVariant existing = ProductVariant.builder()
                .id(101L)
                .product(activeProduct())
                .originalPrice(new BigDecimal("100000"))
                .salePrice(new BigDecimal("90000"))
                .discountPercent(new BigDecimal("10.00"))
                .stockQty(5)
                .weightGram(500)
                .sortOrder(0)
                .isActive(true)
                .build();
        when(variantRepository.findById(101L)).thenReturn(Optional.of(existing));
        when(variantRepository.save(any(ProductVariant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AdminVariantResponse response = productService.updateVariant(
                101L, variantRequest(stockQty, originalPrice, salePrice));

        ArgumentCaptor<ProductVariant> captor = ArgumentCaptor.forClass(ProductVariant.class);
        verify(variantRepository).save(captor.capture());
        ProductVariant saved = captor.getValue();

        assertThat(saved).isSameAs(existing);
        assertThat(saved.getStockQty()).isEqualTo(stockQty);
        assertThat(saved.getDiscountPercent()).isEqualByComparingTo(expectedDiscount);
        assertThat(response.getStockQty()).isEqualTo(stockQty);
        assertThat(response.getDiscountPercent()).isEqualByComparingTo(expectedDiscount);
    }

    private Product activeProduct() {
        return Product.builder().id(30L).isDeleted(false).build();
    }

    private SaveVariantRequest variantRequest(int stockQty, String originalPrice, String salePrice) {
        SaveVariantRequest request = new SaveVariantRequest();
        ReflectionTestUtils.setField(request, "originalPrice", new BigDecimal(originalPrice));
        ReflectionTestUtils.setField(request, "salePrice", new BigDecimal(salePrice));
        ReflectionTestUtils.setField(request, "stockQty", stockQty);
        return request;
    }
}
