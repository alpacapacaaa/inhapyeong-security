package com.inhaeval.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class ReviewRequest {

    // 필수 정보
    private Long courseId;
    private String semester;
    private float rating;
    private String difficulty;
    private String workload;
    private String attendance;
    private String grading;
    private String content;
    private boolean isAnonymous;

    // 디테일 정보 (선택)
    private List<String> examTypes;
    private String assignmentType;
    private String textbook;
    private String oneLineTip;
    private String examInfo;
    private List<String> examKeywords;
    private List<String> recommendFor;
    private List<String> notRecommendFor;

    // 육각형 스탯 정보
    private Integer diffScore;
    private Integer teachingScore;
    private Integer gradScore;
    private Integer workScore;
    private Integer prerequisiteScore;
    private Integer depthScore;
    private Integer timeInvestScore;
    private Integer attScore;
    private Integer pastExamScore;
}
