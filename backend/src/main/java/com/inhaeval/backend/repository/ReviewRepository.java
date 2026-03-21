package com.inhaeval.backend.repository;

import com.inhaeval.backend.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 1. 최신 등록순 (Latest)
    List<Review> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    // 2. 추천 많은순 (Most Liked) - likesCount 기준 내림차순
    List<Review> findByCourseIdOrderByLikesCountDesc(Long courseId);

    // 3. 별점 높은순 (Highest Rating) - rating 기준 내림차순
    List<Review> findByCourseIdOrderByRatingDesc(Long courseId);

    // 4. 별점 낮은순 (Lowest Rating) - rating 기준 오름차순
    List<Review> findByCourseIdOrderByRatingAsc(Long courseId);
}
