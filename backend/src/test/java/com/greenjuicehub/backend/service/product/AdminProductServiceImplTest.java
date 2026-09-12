package com.greenjuicehub.backend.service.product;

import com.greenjuicehub.backend.dto.adminProduct.request.SaveVariantRequest;
import com.greenjuicehub.backend.dto.adminProduct.response.AdminVariantResponse;
import com.greenjuicehub.backend.entity.Product;
import com.greenjuicehub.backend.entity.ProductVariant;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.ProductMapper;
import com.greenjuicehub.backend.repository.CategoryRepository;
import com.greenjuicehub.backend.repository.FlavorRepository;
import com.greenjuicehub.backend.repository.ProductImageRepository;
import com.greenjuicehub.backend.repository.ProductRepository;
import com.greenjuicehub.backend.repository.ProductTagRepository;
import com.greenjuicehub.backend.repository.ProductVariantRepository;
import com.greenjuicehub.backend.repository.SizeRepository;
import com.greenjuicehub.backend.service.product.impl.AdminProductServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminProductServiceImplTest {

    @Mock private ProductRepository productRepository;
    @Mock private ProductVariantRepository variantRepository;
    @Mock private ProductImageRepository imageRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private FlavorRepository flavorRepository;
    @Mock private SizeRepository sizeRepository;
    @Mock private ProductMapper productMapper;
    @Mock private ProductTagRepository productTagRepository;

    @InjectMocks private AdminProductServiceImpl productService;

    @Test
    void createVariantRejectsSalePriceGreaterThanOriginalPriceEvenWithoutControllerValidation() {
        when(productRepository.findById(30L)).thenReturn(Optional.of(activeProduct()));
        SaveVariantRequest request = variantRequest("100000", "101000");

        assertThatThrownBy(() -> productService.createVariant(30L, request))
                .isInstanceOf(AppException.class)
                .hasMessage("Giá sale phải nhỏ hơn hoặc bằng giá gốc");

        verify(variantRepository, never()).save(any());
    }

    @Test
    void createVariantWithZeroSalePriceComputesHundredPercentDiscount() {
        when(productRepository.findById(30L)).thenReturn(Optional.of(activeProduct()));
        when(variantRepository.save(any(ProductVariant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AdminVariantResponse response = productService.createVariant(
                30L, variantRequest("100000", "0"));

        assertThat(response.getSalePrice()).isEqualByComparingTo("0");
        assertThat(response.getDiscountPercent()).isEqualByComparingTo("100.00");
    }

    private Product activeProduct() {
        return Product.builder().id(30L).isDeleted(false).build();
    }

    private SaveVariantRequest variantRequest(String originalPrice, String salePrice) {
        SaveVariantRequest request = new SaveVariantRequest();
        ReflectionTestUtils.setField(request, "originalPrice", new BigDecimal(originalPrice));
        ReflectionTestUtils.setField(request, "salePrice", new BigDecimal(salePrice));
        ReflectionTestUtils.setField(request, "stockQty", 10);
        return request;
    }
}
