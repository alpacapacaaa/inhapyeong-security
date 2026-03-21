package com.inhaeval.backend.repository;

import com.inhaeval.backend.domain.ReviewLike;
import com.inhaeval.backend.domain.Member;
import com.inhaeval.backend.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    // 특정 회원이 특정 리뷰에 이미 좋아요를 눌렀는지 확인
    Optional<ReviewLike> findByMemberAndReview(Member member, Review review);
    // 특정 리뷰의 좋아요 개수 세기
    long countByReviewId(Long reviewId);
}
