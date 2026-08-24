package com.greenjuicehub.backend.service.product;

import com.greenjuicehub.backend.dto.product.request.ProductFilterRequest;
import com.greenjuicehub.backend.dto.product.response.CategoryResponse;
import com.greenjuicehub.backend.dto.product.response.ProductDetailResponse;
import com.greenjuicehub.backend.dto.product.response.ProductSummaryResponse;
import com.greenjuicehub.backend.entity.Category;
import com.greenjuicehub.backend.entity.Product;
import com.greenjuicehub.backend.entity.ProductImage;
import com.greenjuicehub.backend.entity.ProductVariant;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.ProductMapper;
import com.greenjuicehub.backend.repository.CategoryRepository;
import com.greenjuicehub.backend.repository.FlavorRepository;
import com.greenjuicehub.backend.repository.ProductImageRepository;
import com.greenjuicehub.backend.repository.ProductRepository;
import com.greenjuicehub.backend.repository.ProductVariantRepository;
import com.greenjuicehub.backend.repository.SizeRepository;
import com.greenjuicehub.backend.repository.TagDefinitionRepository;
import com.greenjuicehub.backend.service.product.impl.ProductServiceImpl;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private FlavorRepository flavorRepository;
    @Mock private SizeRepository sizeRepository;
    @Mock private ProductVariantRepository variantRepository;
    @Mock private ProductImageRepository imageRepository;
    @Mock private ProductMapper productMapper;
    @Mock private TagDefinitionRepository tagDefinitionRepository;

    @InjectMocks private ProductServiceImpl productService;

    @Test
    void getProductsUsesSpecificationAndRequestedPageForDefaultSort() {
        ProductFilterRequest request = new ProductFilterRequest();
        request.setKeyword("detox");
        request.setPage(2);
        request.setSize(5);
        request.setSortBy("rating");
        Product product = Product.builder().id(10L).build();
        ProductSummaryResponse summary = ProductSummaryResponse.builder().id(10L).build();

        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(product)));
        when(variantRepository.findAllByProductIdAndIsActiveTrueOrderBySortOrderAsc(10L))
                .thenReturn(List.of());
        when(imageRepository.findAllByProductIdOrderBySortOrderAsc(10L)).thenReturn(List.of());
        when(productMapper.toSummary(product, List.of(), List.of())).thenReturn(summary);

        Page<ProductSummaryResponse> result = productService.getProducts(request);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(productRepository).findAll(any(Specification.class), pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getPageNumber()).isEqualTo(2);
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(5);
        assertThat(pageableCaptor.getValue().getSort().getOrderFor("avgRating").isDescending()).isTrue();
        assertThat(result.getContent()).containsExactly(summary);
    }

    @Test
    void getProductsUsesDedicatedQueryForAscendingPrice() {
        ProductFilterRequest request = new ProductFilterRequest();
        request.setSortBy("price_asc");
        Product product = Product.builder().id(11L).build();
        ProductSummaryResponse summary = ProductSummaryResponse.builder().id(11L).build();

        when(productRepository.findAllOrderByMinPriceAsc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(product)));
        when(variantRepository.findAllByProductIdAndIsActiveTrueOrderBySortOrderAsc(11L))
                .thenReturn(List.of());
        when(imageRepository.findAllByProductIdOrderBySortOrderAsc(11L)).thenReturn(List.of());
        when(productMapper.toSummary(product, List.of(), List.of())).thenReturn(summary);

        assertThat(productService.getProducts(request).getContent()).containsExactly(summary);

        verify(productRepository).findAllOrderByMinPriceAsc(any(Pageable.class));
        verify(productRepository, never()).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void getProductBySlugLoadsDetailAndRelatedProducts() {
        Category category = Category.builder().id(3L).build();
        Product product = Product.builder().id(20L).slug("green-detox").category(category).build();
        Product relatedProduct = Product.builder().id(21L).build();
        ProductVariant variant = ProductVariant.builder().id(30L).build();
        ProductImage image = ProductImage.builder().imageUrl("https://cdn.test/product.png").build();
        ProductSummaryResponse relatedSummary = ProductSummaryResponse.builder().id(21L).build();
        ProductDetailResponse expected = ProductDetailResponse.builder().id(20L).build();

        when(productRepository.findBySlugAndIsActiveTrueAndIsDeletedFalse("green-detox"))
                .thenReturn(Optional.of(product));
        when(variantRepository.findAllByProductIdAndIsActiveTrueOrderBySortOrderAsc(20L))
                .thenReturn(List.of(variant));
        when(imageRepository.findAllByProductIdOrderBySortOrderAsc(20L)).thenReturn(List.of(image));
        when(productRepository.findByCategoryIdAndIsActiveTrueAndIsDeletedFalseAndIdNot(
                eq(3L), eq(20L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(relatedProduct)));
        when(variantRepository.findAllByProductIdAndIsActiveTrueOrderBySortOrderAsc(21L))
                .thenReturn(List.of());
        when(imageRepository.findAllByProductIdOrderBySortOrderAsc(21L)).thenReturn(List.of());
        when(productMapper.toSummary(relatedProduct, List.of(), List.of())).thenReturn(relatedSummary);
        when(productMapper.toDetail(product, List.of(variant),
                List.of("https://cdn.test/product.png"), List.of(), List.of(relatedSummary)))
                .thenReturn(expected);

        assertThat(productService.getProductBySlug("green-detox")).isSameAs(expected);
    }

    @Test
    void getProductBySlugRejectsUnknownProduct() {
        when(productRepository.findBySlugAndIsActiveTrueAndIsDeletedFalse("missing"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductBySlug("missing"))
                .isInstanceOf(AppException.class)
                .hasMessage("Sản phẩm không tồn tại");
    }

    @Test
    void getDealCategoriesMapsNativeQueryRows() {
        when(productRepository.findCategoriesWithActiveDeals())
                .thenReturn(List.<Object[]>of(new Object[]{7L, "Nước ép", "nuoc-ep"}));

        List<CategoryResponse> result = productService.getDealCategories();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getId()).isEqualTo(7L);
        assertThat(result.getFirst().getName()).isEqualTo("Nước ép");
        assertThat(result.getFirst().getSlug()).isEqualTo("nuoc-ep");
    }

    @Disabled("BUG: price_asc/price_desc dùng native query không nhận Specification nên bỏ qua bộ lọc")
    @Test
    void priceSortShouldHonorCategoryFilter() {
        ProductFilterRequest request = new ProductFilterRequest();
        request.setCategoryId(3L);
        request.setSortBy("price_asc");
        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(Page.empty());
        when(productRepository.findAllOrderByMinPriceAsc(any(Pageable.class)))
                .thenReturn(Page.empty());

        productService.getProducts(request);

        verify(productRepository).findAll(any(Specification.class), any(Pageable.class));
        verify(productRepository, never()).findAllOrderByMinPriceAsc(any(Pageable.class));
    }
}
