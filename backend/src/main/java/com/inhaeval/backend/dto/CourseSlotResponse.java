package com.inhaeval.backend.dto;

import com.inhaeval.backend.domain.CourseSlot;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseSlotResponse {

    private String day;
    private int startPeriod;
    private int endPeriod;
    private String location;

    public static CourseSlotResponse from(CourseSlot slot) {
        return CourseSlotResponse.builder()
                .day(slot.getDay())
                .startPeriod(slot.getStartPeriod())
                .endPeriod(slot.getEndPeriod())
                .location(slot.getLocation())
                .build();
    }
}