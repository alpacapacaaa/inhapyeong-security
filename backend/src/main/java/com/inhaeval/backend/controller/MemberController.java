package com.inhaeval.backend.controller;

import com.inhaeval.backend.dto.*;
import com.inhaeval.backend.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // 내 정보 조회
    @GetMapping
    public ResponseEntity<UserResponse> getMe(Authentication authentication) {
        return ResponseEntity.ok(memberService.getMe(authentication.getName()));
    }

    // 닉네임 변경
    @PatchMapping("/nickname")
    public ResponseEntity<UserResponse> updateNickname(
            @RequestBody UpdateNicknameRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(memberService.updateNickname(authentication.getName(), request));
    }

    // 학과 변경
    @PatchMapping("/department")
    public ResponseEntity<UserResponse> updateDepartment(
            @RequestBody UpdateDepartmentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(memberService.updateDepartment(authentication.getName(), request));
    }

    // 비밀번호 변경
    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        memberService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }

    // 전화번호 변경
    @PatchMapping("/phone")
    public ResponseEntity<UserResponse> changePhone(
            @RequestBody ChangePhoneRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(memberService.changePhone(authentication.getName(), request));
    }

    // 열람권 구매
    @PostMapping("/pass")
    public ResponseEntity<UserResponse> purchasePass(Authentication authentication) {
        return ResponseEntity.ok(memberService.purchasePass(authentication.getName()));
    }

    // 회원탈퇴
    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(
            @RequestBody DeleteAccountRequest request,
            Authentication authentication) {
        memberService.deleteAccount(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }
}
