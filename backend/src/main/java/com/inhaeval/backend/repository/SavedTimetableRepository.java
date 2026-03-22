package com.inhaeval.backend.repository;

import com.inhaeval.backend.domain.SavedTimetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SavedTimetableRepository extends JpaRepository<SavedTimetable, Long> {

    List<SavedTimetable> findByMemberId(Long memberId);

    @Modifying
    @Query("DELETE FROM SavedTimetable s WHERE s.member.id = :memberId AND s.planKey = :planKey")
    void deleteByMemberIdAndPlanKey(@Param("memberId") Long memberId, @Param("planKey") String planKey);

    @Modifying
    @Query("DELETE FROM SavedTimetable s WHERE s.member.id = :memberId")
    void deleteAllByMemberId(@Param("memberId") Long memberId);
}