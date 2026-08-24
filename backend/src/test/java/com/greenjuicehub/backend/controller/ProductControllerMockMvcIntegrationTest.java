package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.product.response.ProductDetailResponse;
import com.greenjuicehub.backend.dto.product.response.ProductSummaryResponse;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.product.IProductService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class ProductControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IProductService productService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void getProductsBindsFiltersAndSerializesPageForAnonymousUser() throws Exception {
        ProductSummaryResponse product = ProductSummaryResponse.builder()
                .id(1L)
                .name("Green Detox")
                .slug("green-detox")
                .minSalePrice(new BigDecimal("79000"))
                .inStock(true)
                .build();
        when(productService.getProducts(argThat(request ->
                request.getCategoryId().equals(3L)
                        && request.getKeyword().equals("detox")
                        && request.getPage().equals(1)
                        && request.getSize().equals(5)
                        && request.getSortBy().equals("rating"))))
                .thenReturn(new PageImpl<>(List.of(product)));

        mockMvc.perform(get("/api/products")
                        .param("categoryId", "3")
                        .param("keyword", "detox")
                        .param("page", "1")
                        .param("size", "5")
                        .param("sortBy", "rating"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].slug").value("green-detox"))
                .andExpect(jsonPath("$.content[0].minSalePrice").value(79000))
                .andExpect(jsonPath("$.content[0].inStock").value(true));
    }

    @Test
    void getProductBySlugReturnsServiceDetail() throws Exception {
        when(productService.getProductBySlug("green-detox"))
                .thenReturn(ProductDetailResponse.builder()
                        .id(1L).name("Green Detox").slug("green-detox").build());

        mockMvc.perform(get("/api/products/green-detox"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Green Detox"));

        verify(productService).getProductBySlug("green-detox");
    }

    @Test
    void getProductBySlugMapsAppExceptionToNotFound() throws Exception {
        when(productService.getProductBySlug("missing"))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại"));

        mockMvc.perform(get("/api/products/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Sản phẩm không tồn tại"));
    }
}
