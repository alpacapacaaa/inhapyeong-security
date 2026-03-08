package com.inhaeval.backend.controller;

import com.inhaeval.backend.dto.*;
import com.inhaeval.backend.service.EmailVerificationService;
import com.inhaeval.backend.service.PhoneVerificationService;
import com.inhaeval.backend.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final MemberService memberService;
    private final EmailVerificationService emailVerificationService;
    private final PhoneVerificationService phoneVerificationService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request){
        SignupResponse response = memberService.signup(request);
        return ResponseEntity.ok(response);
    }
    // 로그인
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request){
        LoginResponse response = memberService.login(request);
        return ResponseEntity.ok(response);
    }

    // 이메일 인증 메일 발송
    @PostMapping("/email/send")
    public ResponseEntity<Void> sendEmail(@RequestBody @Valid EmailSendRequest request) {
        memberService.sendVerificationEmail(request.getEmail());
        return ResponseEntity.ok().build();
    }

    // 이메일 인증 확인
    @GetMapping("/email/verify")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyToken(token);
        return ResponseEntity.ok().build();
    }

    // SMS 인증 발송
    @PostMapping("/phone/send")
    public ResponseEntity<Void> sendSms(@RequestBody @Valid PhoneSendRequest request) {
        phoneVerificationService.sendCode(request.getPhoneNumber());
        return ResponseEntity.ok().build();
    }

    // SMS 인증 확인
    @PostMapping("/phone/verify")
    public ResponseEntity<Void> verifySms(@RequestBody @Valid PhoneVerifyRequest request) {
        phoneVerificationService.verifyCode(request.getPhoneNumber(), request.getCode());
        return ResponseEntity.ok().build();
    }

}
