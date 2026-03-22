package com.inhaeval.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChangePhoneRequest {
    private String phoneNumber;
    private String verificationCode;
}
