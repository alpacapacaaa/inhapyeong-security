package com.inhaeval.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class PhoneVerification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phoneNumber;
    private String code;
    private boolean isUsed;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private int failCount;
    public void increaseFailCount() {
        this.failCount++;
    }

    public void use() {
        this.isUsed = true;
    }
}
