package com.inhaeval.backend.dto;

import com.inhaeval.backend.domain.Member;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String nickname;
    private String department;
    private int points;
    private boolean hasPass;
    private LocalDateTime passExpiryDate;

    public static UserResponse from(Member member) {
        return UserResponse.builder()
                .id(member.getId())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .department(member.getDepartment())
                .points(member.getPoints())
                .hasPass(member.getPassExpiryDate() != null
                        && member.getPassExpiryDate().isAfter(LocalDateTime.now()))
                .passExpiryDate(member.getPassExpiryDate())
                .build();
    }
}