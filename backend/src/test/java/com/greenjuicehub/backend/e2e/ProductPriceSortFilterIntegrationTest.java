package com.greenjuicehub.backend.e2e;

import com.greenjuicehub.backend.dto.product.request.ProductFilterRequest;
import com.greenjuicehub.backend.dto.product.response.ProductSummaryResponse;
import com.greenjuicehub.backend.entity.Category;
import com.greenjuicehub.backend.entity.Product;
import com.greenjuicehub.backend.entity.ProductVariant;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.product.IProductService;
import com.greenjuicehub.backend.service.shipping.GhnService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.cors.CorsConfigurationSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProductPriceSortFilterIntegrationTest {

    @Autowired
    private IProductService productService;

    @Autowired
    private EntityManager entityManager;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private GhnService ghnService;

    @MockitoBean(name = "corsConfigurationSource")
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    void priceSortKeepsCategoryKeywordPriceAndStockFilters() {
        Fixture fixture = seedFixture();

        ProductFilterRequest ascending = filteredRequest(fixture.categoryId(), "price_asc");
        ProductFilterRequest descending = filteredRequest(fixture.categoryId(), "price_desc");

        Page<ProductSummaryResponse> ascendingResult = productService.getProducts(ascending);
        Page<ProductSummaryResponse> descendingResult = productService.getProducts(descending);

        assertThat(ascendingResult.getContent())
                .extracting(ProductSummaryResponse::getName)
                .containsExactly("QLPT300-IN-CATEGORY");
        assertThat(ascendingResult.getTotalElements()).isEqualTo(1);
        assertThat(descendingResult.getContent())
                .extracting(ProductSummaryResponse::getName)
                .containsExactly("QLPT300-IN-CATEGORY");
        assertThat(descendingResult.getTotalElements()).isEqualTo(1);
    }

    @Test
    void priceSortUsesMinimumActiveVariantPriceAndKeepsPageMetadata() {
        seedFixture();

        ProductFilterRequest ascending = new ProductFilterRequest();
        ascending.setSortBy("price_asc");
        ascending.setPage(0);
        ascending.setSize(1);

        ProductFilterRequest descending = new ProductFilterRequest();
        descending.setSortBy("price_desc");
        descending.setPage(0);
        descending.setSize(2);

        Page<ProductSummaryResponse> ascendingResult = productService.getProducts(ascending);
        Page<ProductSummaryResponse> descendingResult = productService.getProducts(descending);

        assertThat(ascendingResult.getContent())
                .extracting(ProductSummaryResponse::getName)
                .containsExactly("QLPT300-OUTSIDE-FILTER");
        assertThat(ascendingResult.getTotalElements()).isEqualTo(2);
        assertThat(ascendingResult.getTotalPages()).isEqualTo(2);
        assertThat(descendingResult.getContent())
                .extracting(ProductSummaryResponse::getName)
                .containsExactly("QLPT300-IN-CATEGORY", "QLPT300-OUTSIDE-FILTER");
        assertThat(descendingResult.getTotalElements()).isEqualTo(2);
    }

    private ProductFilterRequest filteredRequest(Long categoryId, String sortBy) {
        ProductFilterRequest request = new ProductFilterRequest();
        request.setCategoryId(categoryId);
        request.setKeyword("QLPT300-IN");
        request.setMinPrice(new BigDecimal("80000.00"));
        request.setInStock(true);
        request.setSortBy(sortBy);
        request.setPage(0);
        request.setSize(12);
        return request;
    }

    private Fixture seedFixture() {
        Category requested = Category.builder()
                .name("QLPT300 Requested Category")
                .slug("qlpt300-requested")
                .sortOrder(0)
                .isActive(true)
                .build();
        Category excluded = Category.builder()
                .name("QLPT300 Excluded Category")
                .slug("qlpt300-excluded")
                .sortOrder(1)
                .isActive(true)
                .build();
        entityManager.persist(requested);
        entityManager.persist(excluded);

        Product included = product(requested, "QLPT300-IN-CATEGORY", "qlpt300-in");
        Product outsideFilter = product(excluded, "QLPT300-OUTSIDE-FILTER", "qlpt300-out");
        entityManager.persist(included);
        entityManager.persist(outsideFilter);

        entityManager.persist(variant(included, "90000.00", true));
        entityManager.persist(variant(included, "1000.00", false));
        entityManager.persist(variant(outsideFilter, "10000.00", true));
        entityManager.flush();

        return new Fixture(requested.getId());
    }

    private Product product(Category category, String name, String slug) {
        return Product.builder()
                .category(category)
                .name(name)
                .slug(slug)
                .avgRating(0f)
                .reviewCount(0)
                .isDeleted(false)
                .isActive(true)
                .build();
    }

    private ProductVariant variant(Product product, String price, boolean active) {
        BigDecimal value = new BigDecimal(price);
        return ProductVariant.builder()
                .product(product)
                .originalPrice(value)
                .salePrice(value)
                .discountPercent(BigDecimal.ZERO)
                .stockQty(10)
                .isActive(active)
                .sortOrder(0)
                .weightGram(500)
                .build();
    }

    private record Fixture(Long categoryId) {
    }
}
