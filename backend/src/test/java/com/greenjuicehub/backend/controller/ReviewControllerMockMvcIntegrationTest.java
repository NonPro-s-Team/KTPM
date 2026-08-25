package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.review.response.ProductRatingResponse;
import com.greenjuicehub.backend.dto.review.response.ReviewResponse;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.review.IReviewService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReviewController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class ReviewControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IReviewService reviewService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    // ── POST /api/reviews ────────────────────────────────────────────────────

    @Test
    void customerCreatesReviewSuccessfully() throws Exception {
        when(reviewService.createReview(eq(42L), any())).thenReturn(
                ReviewResponse.builder().id(1L).productId(10L).rating((byte) 5).comment("Ngon").build());

        mockMvc.perform(post("/api/reviews")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":10,\"orderId\":1,\"rating\":5,\"comment\":\"Ngon\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.productId").value(10))
                .andExpect(jsonPath("$.rating").value(5));

        verify(reviewService).createReview(eq(42L), argThat(request ->
                request.getProductId().equals(10L)
                        && request.getOrderId().equals(1L)
                        && request.getRating() == (byte) 5));
    }

    @Test
    void createReviewRejectsInvalidRatingBeforeCallingService() throws Exception {
        mockMvc.perform(post("/api/reviews")
                        .with(customer(42L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":10,\"orderId\":1,\"rating\":9}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("rating: Rating tối đa là 5 sao"));

        verify(reviewService, never()).createReview(any(), any());
    }

    @Test
    void anonymousUserCannotCreateReview() throws Exception {
        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":10,\"orderId\":1,\"rating\":5}"))
                .andExpect(status().isUnauthorized());

        verify(reviewService, never()).createReview(any(), any());
    }

    @Test
    void staffCannotCreateReview() throws Exception {
        mockMvc.perform(post("/api/reviews")
                        .with(authentication(new UsernamePasswordAuthenticationToken(
                                8L, null, List.of(new SimpleGrantedAuthority("ROLE_STAFF")))))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":10,\"orderId\":1,\"rating\":5}"))
                .andExpect(status().isForbidden());

        verify(reviewService, never()).createReview(any(), any());
    }

    // ── GET /api/reviews/check ───────────────────────────────────────────────

    @Test
    void customerChecksHasReviewedForOwnOrder() throws Exception {
        when(reviewService.hasReviewed(42L, 1L, 10L)).thenReturn(true);

        mockMvc.perform(get("/api/reviews/check")
                        .with(customer(42L))
                        .param("orderId", "1")
                        .param("productId", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(true));
    }

    @Test
    void anonymousUserCannotCheckReviewStatus() throws Exception {
        mockMvc.perform(get("/api/reviews/check")
                        .param("orderId", "1")
                        .param("productId", "10"))
                .andExpect(status().isUnauthorized());

        verify(reviewService, never()).hasReviewed(any(), any(), any());
    }

    // ── GET /api/reviews/product/{productId} ─────────────────────────────────

    @Test
    void anyoneCanListApprovedProductReviews() throws Exception {
        ReviewResponse review = ReviewResponse.builder().id(1L).productId(10L).rating((byte) 4).build();
        when(reviewService.getProductReviews(eq(10L), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(review)));

        mockMvc.perform(get("/api/reviews/product/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].rating").value(4));
    }

    @Test
    void listProductReviewsFiltersByRatingParam() throws Exception {
        when(reviewService.getProductReviews(eq(10L), eq(5), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/reviews/product/10").param("rating", "5"))
                .andExpect(status().isOk());

        verify(reviewService).getProductReviews(eq(10L), eq(5), any(Pageable.class));
    }

    // ── GET /api/reviews/product/{productId}/rating ──────────────────────────

    @Test
    void anyoneCanGetProductRatingSummary() throws Exception {
        when(reviewService.getProductRating(10L)).thenReturn(ProductRatingResponse.builder()
                .avgRating(4.5).totalReviews(20).distribution(Map.of(5, 15L, 4, 5L)).build());

        mockMvc.perform(get("/api/reviews/product/10/rating"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avgRating").value(4.5))
                .andExpect(jsonPath("$.totalReviews").value(20));
    }

    private RequestPostProcessor customer(Long userId) {
        return authentication(new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }
}