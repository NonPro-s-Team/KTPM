package com.greenjuicehub.backend.service.review;

import com.greenjuicehub.backend.dto.review.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IAdminReviewService {
    // Admin / Staff
    Page<ReviewResponse> getAllReviews(Boolean isApproved, Integer rating, Pageable pageable);
    Page<ReviewResponse> getPendingReviews(Pageable pageable);
    ReviewResponse toggleApprove(Long reviewId);   // bật/tắt thay vì approve/reject riêng
    ReviewResponse rejectReview(Long reviewId);    // xoá hẳn
    ReviewResponse replyReview(Long reviewId, String reply); // phản hồi
}
