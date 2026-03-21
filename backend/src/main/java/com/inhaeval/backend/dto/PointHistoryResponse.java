package com.inhaeval.backend.dto;

import com.inhaeval.backend.domain.PointHistory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PointHistoryResponse {

    private Long id;
    private LocalDateTime date;   // 프론트 필드명 date에 맞춤 (엔티티는 createdAt)
    private String description;
    private int points;

    public static PointHistoryResponse from(PointHistory pointHistory) {
        return PointHistoryResponse.builder()
                .id(pointHistory.getId())
                .date(pointHistory.getCreatedAt())  // createdAt → date 매핑
                .description(pointHistory.getDescription())
                .points(pointHistory.getPoints())
                .build();
    }
}