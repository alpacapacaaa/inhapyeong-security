package com.inhaeval.backend.repository;

import com.inhaeval.backend.domain.PointHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {
    // 특정 회원의 전체 포인트 이력 조회 (최신순)
    List<PointHistory> findByMemberIdOrderByCreatedAtDesc(Long memberId);
}
