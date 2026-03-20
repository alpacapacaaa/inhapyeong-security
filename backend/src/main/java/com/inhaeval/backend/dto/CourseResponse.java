package com.inhaeval.backend.dto;

import com.inhaeval.backend.domain.Course;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseResponse {

    private Long id;
    private String name;
    private String professor;
    private String department;
    private Integer credits;    // 3학점, 2학점
    private String semester;
    private float rating;       // 평균 평점
    private int reviewCount;
    private String category;
    private String type;

    // 프론트엔드 UI 깨짐 방지용 기본값
    @Builder.Default private String difficulty = "medium";
    @Builder.Default private String workload = "medium";
    @Builder.Default private String attendance = "medium";
    @Builder.Default private String grading = "medium";

    public static CourseResponse from(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .name(course.getName())
                .professor(course.getProfessor())
                .department(course.getDepartment())
                .credits(course.getCredits()) 
                .semester(course.getSemester())
                .rating(course.getRating())
                .reviewCount(course.getReviewCount())
                .category(course.getCategory())
                .type(course.getType())
                .build();
    }
}
