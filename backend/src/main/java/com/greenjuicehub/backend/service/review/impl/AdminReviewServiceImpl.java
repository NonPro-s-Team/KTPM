package com.greenjuicehub.backend.service.review.impl;

import com.greenjuicehub.backend.dto.review.response.ReviewResponse;
import com.greenjuicehub.backend.entity.Product;
import com.greenjuicehub.backend.entity.Review;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.ReviewMapper;
import com.greenjuicehub.backend.repository.ProductRepository;
import com.greenjuicehub.backend.repository.ReviewRepository;
import com.greenjuicehub.backend.service.review.IAdminReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminReviewServiceImpl implements IAdminReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final ProductRepository productRepository;

    // ── Admin / Staff ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviews(Boolean isApproved, Integer rating, Pageable pageable) {
        return reviewRepository
                .findAllForAdmin(isApproved, rating, pageable)
                .map(reviewMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getPendingReviews(Pageable pageable) {
        return reviewRepository
                .findByIsApprovedFalseOrderByCreatedAtDesc(pageable)
                .map(reviewMapper::toResponse);
    }

    /** Toggle bật/tắt hiển thị review, cập nhật lại rating sản phẩm */
    @Override
    @Transactional
    public ReviewResponse toggleApprove(Long reviewId) {
        Review review = findOrThrow(reviewId);
        review.setIsApproved(!review.getIsApproved());
        review = reviewRepository.save(review);
        updateProductRating(review.getProduct().getId());
        return reviewMapper.toResponse(review);
    }

    /** Xoá hẳn khỏi DB */
    @Override
    @Transactional
    public ReviewResponse rejectReview(Long reviewId) {
        Review review = findOrThrow(reviewId);
        boolean wasApproved = Boolean.TRUE.equals(review.getIsApproved());
        Long productId = review.getProduct().getId();

        ReviewResponse response = reviewMapper.toResponse(review);
        reviewRepository.delete(review);

        if (wasApproved) updateProductRating(productId);
        return response;
    }

    /** Phản hồi từ Admin/Staff — hiển thị là "Quản trị viên" phía user */
    @Override
    @Transactional
    public ReviewResponse replyReview(Long reviewId, String reply) {
        Review review = findOrThrow(reviewId);

        if (reply == null || reply.isBlank()) {
            // Xoá reply nếu gửi rỗng
            review.setReply(null);
            review.setRepliedAt(null);
        } else {
            review.setReply(reply.trim());
            review.setRepliedAt(LocalDateTime.now());
        }

        review = reviewRepository.save(review);
        return reviewMapper.toResponse(review);
    }
    // ── Helpers ───────────────────────────────────────────────────────────────

    private Review findOrThrow(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá"));
    }

    private void updateProductRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại"));

        Double avg = reviewRepository.calculateAvgRating(productId);
        Integer count = reviewRepository.countApprovedByProductId(productId);

        product.setAvgRating(avg != null ? (float) (Math.round(avg * 10.0) / 10.0) : 0.0f);
        product.setReviewCount(count != null ? count : 0);
        productRepository.save(product);
    }
}
