package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.adminProduct.response.AdminVariantResponse;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.product.IAdminProductService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.stream.Stream;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * QLPT-360/361/362 - EP tests at the Admin Product Variant API boundary.
 */
@WebMvcTest(AdminProductController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class AdminProductVariantEquivalencePartitioningTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IAdminProductService productService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createAcceptsRepresentativeValidStockAndDiscountPartition() throws Exception {
        when(productService.createVariant(eq(30L), any()))
                .thenReturn(variantResponse(101L, 25, "20.00"));

        mockMvc.perform(post("/api/admin/products/30/variants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validPayload("100000", "80000", "25")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.stockQty").value(25))
                .andExpect(jsonPath("$.discountPercent").value(20.00));

        verify(productService).createVariant(eq(30L), any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateAcceptsZeroStockAndHundredPercentDiscountPartitions() throws Exception {
        when(productService.updateVariant(eq(101L), any()))
                .thenReturn(variantResponse(101L, 0, "100.00"));

        mockMvc.perform(put("/api/admin/products/variants/101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validPayload("100000", "0", "0")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockQty").value(0))
                .andExpect(jsonPath("$.discountPercent").value(100.00));

        verify(productService).updateVariant(eq(101L), any());
    }

    @ParameterizedTest(name = "create rejects invalid stock partition: {0}")
    @MethodSource("invalidStockPartitions")
    @WithMockUser(roles = "ADMIN")
    void createRejectsInvalidStockPartitions(
            String partition, String payload, String expectedMessage) throws Exception {
        mockMvc.perform(post("/api/admin/products/30/variants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message", containsString(expectedMessage)));

        verify(productService, never()).createVariant(eq(30L), any());
    }

    @ParameterizedTest(name = "create rejects invalid discount input partition: {0}")
    @MethodSource("invalidDiscountInputPartitions")
    @WithMockUser(roles = "ADMIN")
    void createRejectsInvalidDiscountInputPartitions(
            String partition, String payload, String expectedMessage) throws Exception {
        mockMvc.perform(post("/api/admin/products/30/variants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message", containsString(expectedMessage)));

        verify(productService, never()).createVariant(eq(30L), any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateRejectsInvalidStockWithoutCallingService() throws Exception {
        mockMvc.perform(put("/api/admin/products/variants/101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validPayload("100000", "80000", "-1")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Tồn kho phải >= 0")));

        verify(productService, never()).updateVariant(eq(101L), any());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void staffCannotCreateVariantEvenWithValidPartition() throws Exception {
        mockMvc.perform(post("/api/admin/products/30/variants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validPayload("100000", "80000", "25")))
                .andExpect(status().isForbidden());

        verify(productService, never()).createVariant(eq(30L), any());
    }

    private static Stream<Arguments> invalidStockPartitions() {
        return Stream.of(
                Arguments.of("negative integer", validPayload("100000", "80000", "-1"),
                        "Tồn kho phải >= 0"),
                Arguments.of("null", validPayload("100000", "80000", "null"),
                        "Tồn kho không được để trống"),
                Arguments.of("missing", """
                        {"originalPrice":100000,"salePrice":80000}
                        """, "Tồn kho không được để trống"),
                Arguments.of("decimal", validPayload("100000", "80000", "1.5"),
                        "Dữ liệu JSON không hợp lệ"),
                Arguments.of("non-numeric string", validPayload("100000", "80000", "\"abc\""),
                        "Dữ liệu JSON không hợp lệ"),
                Arguments.of("greater than Java Integer", validPayload("100000", "80000", "2147483648"),
                        "Dữ liệu JSON không hợp lệ")
        );
    }

    private static Stream<Arguments> invalidDiscountInputPartitions() {
        return Stream.of(
                Arguments.of("sale price above original price",
                        validPayload("100000", "100001", "10"),
                        "Giá sale phải nhỏ hơn hoặc bằng giá gốc"),
                Arguments.of("negative original price",
                        validPayload("-1", "0", "10"),
                        "Giá"),
                Arguments.of("negative sale price",
                        validPayload("100000", "-1", "10"),
                        "Giá sale phải >= 0"),
                Arguments.of("missing original price",
                        "{\"salePrice\":80000,\"stockQty\":10}",
                        "Giá gốc không được để trống"),
                Arguments.of("missing sale price",
                        "{\"originalPrice\":100000,\"stockQty\":10}",
                        "Giá sale không được để trống")
        );
    }

    private static String validPayload(String originalPrice, String salePrice, String stockQty) {
        return """
                {
                  "originalPrice": %s,
                  "salePrice": %s,
                  "stockQty": %s
                }
                """.formatted(originalPrice, salePrice, stockQty);
    }

    private AdminVariantResponse variantResponse(Long id, int stockQty, String discountPercent) {
        return AdminVariantResponse.builder()
                .id(id)
                .originalPrice(new BigDecimal("100000"))
                .salePrice(new BigDecimal("80000"))
                .discountPercent(new BigDecimal(discountPercent))
                .stockQty(stockQty)
                .weightGram(500)
                .sortOrder(0)
                .isActive(true)
                .build();
    }
}
