package com.greenjuicehub.backend.service.review.impl;

import com.greenjuicehub.backend.dto.review.request.CreateReviewRequest;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    // ════════════════════════════════════════════════════════════════════════
    // createReview — Ánh xạ EP business-rule (TC-EP-06..10).
    // Các rule này chạy ở tầng Service (sau khi request đã qua Bean Validation
    // ở Controller), nên đây là đúng tầng để verify.
    // ════════════════════════════════════════════════════════════════════════

    // TC-EP-08: Happy path — rating hợp lệ, order DELIVERED, sản phẩm có trong đơn,
    // chưa từng review đơn này -> tạo review thành công + refresh avgRating sản phẩm
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

    // TC-EP-09: orderId không tồn tại hoặc không thuộc về user đang đăng nhập
    // -> findByIdAndUserId trả rỗng -> AppException "Không tìm thấy đơn hàng"
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

    // TC-EP-06: orderId hợp lệ nhưng status = SHIPPING (chưa DELIVERED)
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

    // TC-EP-07: orderId + productId đã từng được review trong đơn này
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

    // TC-EP-10: productId hợp lệ nhưng không nằm trong danh sách sản phẩm của đơn hàng được chọn
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

}