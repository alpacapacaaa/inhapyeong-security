package com.inhaeval.backend.repository;

import com.inhaeval.backend.domain.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    // 1. 검색어(강의명 또는 교수명)와 학과로 검색
    @Query("SELECT c FROM Course c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.professor) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:department IS NULL OR :department = '전체' OR c.department = :department)")
    List<Course> searchCourses(@Param("query") String query, @Param("department") String department);

    // 2. 꿀교양 (평점 4.0 이상 인기 교양)
    @Query("SELECT c FROM Course c WHERE c.category = '교양' AND c.rating >= 4.0 ORDER BY c.rating DESC")
    List<Course> findHoneyGeCourses();

    // 3. 전공 추천 (해당 학과의 에이스 '전공' 과목)
    @Query("SELECT c FROM Course c WHERE c.department = :department AND c.category = '전공' ORDER BY c.rating DESC")
    List<Course> findMajorRecommended(@Param("department") String department);
}
