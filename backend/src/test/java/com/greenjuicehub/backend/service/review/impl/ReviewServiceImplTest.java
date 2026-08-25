package com.greenjuicehub.backend.service.review.impl;

import com.greenjuicehub.backend.dto.review.request.CreateReviewRequest;
import com.greenjuicehub.backend.dto.review.response.ProductRatingResponse;
import com.greenjuicehub.backend.dto.review.response.ReviewResponse;
import com.greenjuicehub.backend.entity.Order;
import com.greenjuicehub.backend.entity.OrderItem;
import com.greenjuicehub.backend.entity.Product;
import com.greenjuicehub.backend.entity.Review;
import com.greenjuicehub.backend.entity.User;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.ReviewMapper;
import com.greenjuicehub.backend.repository.OrderItemRepository;
import com.greenjuicehub.backend.repository.OrderRepository;
import com.greenjuicehub.backend.repository.ProductRepository;
import com.greenjuicehub.backend.repository.ReviewRepository;
import com.greenjuicehub.backend.repository.UserRepository;
import com.greenjuicehub.backend.service.review.impl.ReviewServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private ReviewMapper reviewMapper;

    @InjectMocks private ReviewServiceImpl reviewService;

    // ── createReview ─────────────────────────────────────────────────────────

    @Test
    void createReviewSavesReviewAndRefreshesProductRatingOnSuccess() {
        CreateReviewRequest request = new CreateReviewRequest();
        request.setOrderId(1L);
        request.setProductId(10L);
        request.setRating((byte) 5);
        request.setComment("Ngon");

        Order order = Order.builder().id(1L).status(Order.OrderStatus.DELIVERED).build();
        Product product = Product.builder().id(10L).name("Green Detox").build();
        User user = User.builder().id(99L).name("Vu").build();
        OrderItem item = OrderItem.builder().product(product).build();
        Review saved = Review.builder().id(500L).product(product).user(user).order(order).rating((byte) 5).build();
        ReviewResponse expected = ReviewResponse.builder().id(500L).build();

        when(orderRepository.findByIdAndUserId(1L, 99L)).thenReturn(Optional.of(order));
        when(reviewRepository.existsByProductIdAndUserIdAndOrderId(10L, 99L, 1L)).thenReturn(false);
        when(orderItemRepository.findAllByOrderIdWithDetails(1L)).thenReturn(List.of(item));
        when(userRepository.findById(99L)).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(reviewRepository.save(any(Review.class))).thenReturn(saved);
        when(reviewRepository.calculateAvgRating(10L)).thenReturn(5.0);
        when(reviewRepository.countApprovedByProductId(10L)).thenReturn(1);
        when(reviewMapper.toResponse(saved)).thenReturn(expected);

        ReviewResponse result = reviewService.createReview(99L, request);

        assertThat(result).isSameAs(expected);

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        assertThat(captor.getValue().getRating()).isEqualTo((byte) 5);
        assertThat(captor.getValue().getComment()).isEqualTo("Ngon");
        assertThat(captor.getValue().getIsApproved()).isTrue();
        assertThat(captor.getValue().getProductName()).isEqualTo("Green Detox");

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        assertThat(productCaptor.getValue().getAvgRating()).isEqualTo(5.0f);
        assertThat(productCaptor.getValue().getReviewCount()).isEqualTo(1);
    }

    @Test
    void createReviewRejectsWhenOrderNotFoundForUser() {
        CreateReviewRequest request = new CreateReviewRequest();
        request.setOrderId(1L);
        request.setProductId(10L);
        request.setRating((byte) 5);

        when(orderRepository.findByIdAndUserId(1L, 99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(99L, request))
                .isInstanceOf(AppException.class)
                .hasMessage("Không tìm thấy đơn hàng");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReviewRejectsWhenOrderNotDelivered() {
        CreateReviewRequest request = new CreateReviewRequest();
        request.setOrderId(1L);
        request.setProductId(10L);
        request.setRating((byte) 5);

        Order order = Order.builder().id(1L).status(Order.OrderStatus.SHIPPING).build();
        when(orderRepository.findByIdAndUserId(1L, 99L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> reviewService.createReview(99L, request))
                .isInstanceOf(AppException.class)
                .hasMessage("Chỉ có thể đánh giá sau khi đơn hàng đã được giao thành công");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReviewRejectsWhenAlreadyReviewedForOrder() {
        CreateReviewRequest request = new CreateReviewRequest();
        request.setOrderId(1L);
        request.setProductId(10L);
        request.setRating((byte) 5);

        Order order = Order.builder().id(1L).status(Order.OrderStatus.DELIVERED).build();
        when(orderRepository.findByIdAndUserId(1L, 99L)).thenReturn(Optional.of(order));
        when(reviewRepository.existsByProductIdAndUserIdAndOrderId(10L, 99L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> reviewService.createReview(99L, request))
                .isInstanceOf(AppException.class)
                .hasMessage("Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReviewRejectsWhenProductNotInOrder() {
        CreateReviewRequest request = new CreateReviewRequest();
        request.setOrderId(1L);
        request.setProductId(10L);
        request.setRating((byte) 5);

        Order order = Order.builder().id(1L).status(Order.OrderStatus.DELIVERED).build();
        Product otherProduct = Product.builder().id(20L).build();
        OrderItem item = OrderItem.builder().product(otherProduct).build();

        when(orderRepository.findByIdAndUserId(1L, 99L)).thenReturn(Optional.of(order));
        when(reviewRepository.existsByProductIdAndUserIdAndOrderId(10L, 99L, 1L)).thenReturn(false);
        when(orderItemRepository.findAllByOrderIdWithDetails(1L)).thenReturn(List.of(item));

        assertThatThrownBy(() -> reviewService.createReview(99L, request))
                .isInstanceOf(AppException.class)
                .hasMessage("Sản phẩm này không có trong đơn hàng");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReviewRejectsWhenUserNotFound() {
        CreateReviewRequest request = new CreateReviewRequest();
        request.setOrderId(1L);
        request.setProductId(10L);
        request.setRating((byte) 5);

        Order order = Order.builder().id(1L).status(Order.OrderStatus.DELIVERED).build();
        Product product = Product.builder().id(10L).build();
        OrderItem item = OrderItem.builder().product(product).build();

        when(orderRepository.findByIdAndUserId(1L, 99L)).thenReturn(Optional.of(order));
        when(reviewRepository.existsByProductIdAndUserIdAndOrderId(10L, 99L, 1L)).thenReturn(false);
        when(orderItemRepository.findAllByOrderIdWithDetails(1L)).thenReturn(List.of(item));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(99L, request))
                .isInstanceOf(AppException.class)
                .hasMessage("Người dùng không tồn tại");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReviewRejectsWhenProductNotFound() {
        CreateReviewRequest request = new CreateReviewRequest();
        request.setOrderId(1L);
        request.setProductId(10L);
        request.setRating((byte) 5);

        Order order = Order.builder().id(1L).status(Order.OrderStatus.DELIVERED).build();
        Product product = Product.builder().id(10L).build();
        OrderItem item = OrderItem.builder().product(product).build();
        User user = User.builder().id(99L).name("Vu").build();

        when(orderRepository.findByIdAndUserId(1L, 99L)).thenReturn(Optional.of(order));
        when(reviewRepository.existsByProductIdAndUserIdAndOrderId(10L, 99L, 1L)).thenReturn(false);
        when(orderItemRepository.findAllByOrderIdWithDetails(1L)).thenReturn(List.of(item));
        when(userRepository.findById(99L)).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(99L, request))
                .isInstanceOf(AppException.class)
                .hasMessage("Sản phẩm không tồn tại");

        verify(reviewRepository, never()).save(any());
    }

    // ── getProductReviews / hasReviewed / getProductRating ──────────────────

    @Test
    void getProductReviewsDelegatesToRepositoryWithRatingFilter() {
        Product product = Product.builder().id(10L).build();
        Review review = Review.builder().id(1L).product(product).build();
        ReviewResponse response = ReviewResponse.builder().id(1L).build();
        Pageable pageable = Pageable.ofSize(5);

        when(reviewRepository.findByProductIdAndRating(10L, 4, pageable))
                .thenReturn(new PageImpl<>(List.of(review)));
        when(reviewMapper.toResponse(review)).thenReturn(response);

        Page<ReviewResponse> result = reviewService.getProductReviews(10L, 4, pageable);

        assertThat(result.getContent()).containsExactly(response);
        verify(reviewRepository).findByProductIdAndRating(10L, 4, pageable);
    }

    @Test
    void hasReviewedDelegatesToRepository() {
        when(reviewRepository.existsByProductIdAndUserIdAndOrderId(10L, 99L, 1L)).thenReturn(true);

        assertThat(reviewService.hasReviewed(99L, 1L, 10L)).isTrue();
    }

    @Test
    void getProductRatingBuildsResponseFromMapper() {
        List<Object[]> distributionRows = Collections.singletonList(new Object[]{5, 3L});
        ProductRatingResponse expected = ProductRatingResponse.builder().avgRating(4.5).totalReviews(3).build();

        when(reviewRepository.calculateAvgRating(10L)).thenReturn(4.5);
        when(reviewRepository.countApprovedByProductId(10L)).thenReturn(3);
        when(reviewRepository.countRatingDistribution(10L)).thenReturn(distributionRows);
        when(reviewMapper.toRatingResponse(4.5, 3, distributionRows)).thenReturn(expected);

        assertThat(reviewService.getProductRating(10L)).isSameAs(expected);
    }

    // ── Admin / Staff ─────────────────────────────────────────────────────────

    @Test
    void getAllReviewsDelegatesToAdminQuery() {
        Review review = Review.builder().id(1L).build();
        ReviewResponse response = ReviewResponse.builder().id(1L).build();
        Pageable pageable = Pageable.ofSize(10);

        when(reviewRepository.findAllForAdmin(true, 5, pageable)).thenReturn(new PageImpl<>(List.of(review)));
        when(reviewMapper.toResponse(review)).thenReturn(response);

        assertThat(reviewService.getAllReviews(true, 5, pageable).getContent()).containsExactly(response);
    }

    @Test
    void getPendingReviewsDelegatesToRepository() {
        Review review = Review.builder().id(1L).build();
        ReviewResponse response = ReviewResponse.builder().id(1L).build();
        Pageable pageable = Pageable.ofSize(10);

        when(reviewRepository.findByIsApprovedFalseOrderByCreatedAtDesc(pageable))
                .thenReturn(new PageImpl<>(List.of(review)));
        when(reviewMapper.toResponse(review)).thenReturn(response);

        assertThat(reviewService.getPendingReviews(pageable).getContent()).containsExactly(response);
    }

    @Test
    void toggleApproveFlipsFlagAndRefreshesProductRating() {
        Product product = Product.builder().id(10L).build();
        Review review = Review.builder().id(1L).product(product).isApproved(true).build();
        ReviewResponse response = ReviewResponse.builder().id(1L).build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(review)).thenReturn(review);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(reviewRepository.calculateAvgRating(10L)).thenReturn(0.0);
        when(reviewRepository.countApprovedByProductId(10L)).thenReturn(0);
        when(reviewMapper.toResponse(review)).thenReturn(response);

        ReviewResponse result = reviewService.toggleApprove(1L);

        assertThat(result).isSameAs(response);
        assertThat(review.getIsApproved()).isFalse();
        verify(productRepository).save(product);
    }

    @Test
    void toggleApproveThrowsWhenReviewMissing() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.toggleApprove(1L))
                .isInstanceOf(AppException.class)
                .hasMessage("Không tìm thấy đánh giá");
    }

    @Test
    void toggleApproveFallsBackToZeroDefaultsWhenProductHasNoRatingsLeft() {
        // Phủ nhánh else của 2 ternary trong updateProductRating():
        // avg != null ? ... : 0.0f  và  count != null ? count : 0
        Product product = Product.builder().id(10L).build();
        Review review = Review.builder().id(1L).product(product).isApproved(false).build();
        ReviewResponse response = ReviewResponse.builder().id(1L).build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(review)).thenReturn(review);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(reviewRepository.calculateAvgRating(10L)).thenReturn(null);
        when(reviewRepository.countApprovedByProductId(10L)).thenReturn(null);
        when(reviewMapper.toResponse(review)).thenReturn(response);

        reviewService.toggleApprove(1L);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertThat(captor.getValue().getAvgRating()).isEqualTo(0.0f);
        assertThat(captor.getValue().getReviewCount()).isEqualTo(0);
    }

    @Test
    void rejectReviewDeletesAndRefreshesRatingWhenWasApproved() {
        Product product = Product.builder().id(10L).build();
        Review review = Review.builder().id(1L).product(product).isApproved(true).build();
        ReviewResponse response = ReviewResponse.builder().id(1L).build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewMapper.toResponse(review)).thenReturn(response);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(reviewRepository.calculateAvgRating(10L)).thenReturn(0.0);
        when(reviewRepository.countApprovedByProductId(10L)).thenReturn(0);

        ReviewResponse result = reviewService.rejectReview(1L);

        assertThat(result).isSameAs(response);
        verify(reviewRepository).delete(review);
        verify(productRepository).save(product);
    }

    @Test
    void rejectReviewSkipsRatingRefreshWhenWasNotApproved() {
        Product product = Product.builder().id(10L).build();
        Review review = Review.builder().id(1L).product(product).isApproved(false).build();
        ReviewResponse response = ReviewResponse.builder().id(1L).build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewMapper.toResponse(review)).thenReturn(response);

        reviewService.rejectReview(1L);

        verify(reviewRepository).delete(review);
        verify(productRepository, never()).findById(any());
        verify(productRepository, never()).save(any());
    }

    @Test
    void replyReviewSetsTrimmedReplyAndTimestamp() {
        Review review = Review.builder().id(1L).build();
        ReviewResponse response = ReviewResponse.builder().id(1L).reply("Cảm ơn bạn").build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(review)).thenReturn(review);
        when(reviewMapper.toResponse(review)).thenReturn(response);

        ReviewResponse result = reviewService.replyReview(1L, "  Cảm ơn bạn  ");

        assertThat(result).isSameAs(response);
        assertThat(review.getReply()).isEqualTo("Cảm ơn bạn");
        assertThat(review.getRepliedAt()).isNotNull();
    }

    @Test
    void replyReviewClearsReplyWhenBlank() {
        Review review = Review.builder().id(1L).reply("Old reply").build();
        ReviewResponse response = ReviewResponse.builder().id(1L).build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(review)).thenReturn(review);
        when(reviewMapper.toResponse(review)).thenReturn(response);

        reviewService.replyReview(1L, "   ");

        assertThat(review.getReply()).isNull();
        assertThat(review.getRepliedAt()).isNull();
    }
}