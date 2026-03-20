package com.inhaeval.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;        // 강의명

    @Column(nullable = false)
    private String professor;   // 교수명

    @Column(nullable = false)
    private String department;  // 개설학과

    @Column(nullable = false)
    private String category;    // 전공/교양 구분

    private String type;        // 전공필수, 기초교양 등 세부구분 (null 허용)

    private Integer year;       // 권장학년 (null 허용)

    // 반정규화 필드 (DB가 무거워지지 않게 평점과 개수를 미리 저장해둠)
    @Column(nullable = false)
    @Builder.Default
    private float rating = 0.0f;     // 평균 평점 (1.0~5.0)

    @Column(nullable = false)
    @Builder.Default
    private int reviewCount = 0;     // 해당 강의에 달린 총 리뷰 개수

    // === 비즈니스 논리 (리뷰 작성/삭제 시 강제적으로 Course도 업데이트되도록) ===
    public void addReviewRating(float newRating) {
        float totalScore = this.rating * this.reviewCount; // 기존에 쌓여있던 옛날 총점 복산
        this.reviewCount++;
        this.rating = (totalScore + newRating) / this.reviewCount; // 새로운 평균 산출
    }

    public void removeReviewRating(float oldRating) {
        // 방어적 제어: 지우는데 리뷰개수가 1개(마지막 리뷰) 이하라면 0으로 초기화
        if (this.reviewCount <= 1) {
            this.rating = 0.0f;
            this.reviewCount = 0;
            return;
        }
        float totalScore = this.rating * this.reviewCount;
        this.reviewCount--;
        this.rating = (totalScore - oldRating) / this.reviewCount;
    }
}
