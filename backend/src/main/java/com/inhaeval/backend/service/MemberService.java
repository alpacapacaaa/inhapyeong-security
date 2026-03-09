package com.inhaeval.backend.service;

import com.inhaeval.backend.domain.EmailVerification;
import com.inhaeval.backend.domain.Member;
import com.inhaeval.backend.dto.*;
import com.inhaeval.backend.exception.CustomException;
import com.inhaeval.backend.repository.EmailVerificationRepository;
import com.inhaeval.backend.repository.MemberRepository;
import com.inhaeval.backend.repository.PhoneVerificationRepository;
import com.inhaeval.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PhoneVerificationRepository phoneVerificationRepository;
    private final PhoneVerificationService phoneVerificationService;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final JwtUtil jwtUtil;

    // 이메일 인증 메일 발송
    @Transactional
    public void sendVerificationEmail(String email) {

        if (memberRepository.existsByEmail(email)) {
            throw new CustomException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
        }

        String token = UUID.randomUUID().toString();

        EmailVerification verification = EmailVerification.builder()
                .email(email)
                .token(token)
                .build();
        emailVerificationRepository.save(verification);

        mailService.sendVerificationEmail(email, token);
    }

    @Transactional
    public SignupResponse signup(SignupRequest request){

        if(memberRepository.existsByEmail(request.getEmail())){
            throw new CustomException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
        }

        EmailVerification verification = emailVerificationRepository
                .findByEmailAndIsUsedTrue(request.getEmail())
                .orElseThrow(() -> new CustomException(HttpStatus.FORBIDDEN, "이메일 인증이 필요합니다"));

        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .department(request.getDepartment())
                .build();
        memberRepository.save(member);

        member.verify();
        member.addPoints(50);

        return SignupResponse.builder()
                .accessToken(jwtUtil.generateToken(member.getEmail()))
                .nickname(member.getNickname())
                .points(member.getPoints())
                .build();

    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "존재하지 않는 이메일입니다."));

        if (!member.isVerified()){
            throw new CustomException(HttpStatus.FORBIDDEN, "이메일 인증이 필요합니다.");
        }

        if(!member.isActive()) {
            throw new CustomException(HttpStatus.FORBIDDEN, "탈퇴한 회원입니다.");
        }

        if(!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다.");
        }

        String token = jwtUtil.generateToken(member.getEmail());

        return LoginResponse.builder()
                .points(member.getPoints())
                .nickname(member.getNickname())
                .accessToken(token)
                .build();
    }

    // 이메일 + 번호 일치 확인 후 SMS 발송
    @Transactional
    public void sendPasswordResetSms(String email, String phoneNumber) {
        memberRepository.findByEmailAndPhoneNumber(email, phoneNumber)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "이메일 또는 전화번호가 일치하지 않습니다."));

        phoneVerificationService.sendCode(phoneNumber);
    }

    // 비밀번호 일치 확인 + 본인 확인 + 비밀번호 변겅
    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "비밀번호가 일치하지 않습니다.");
        }

        phoneVerificationRepository.findByPhoneNumberAndIsUsedTrue(request.getPhoneNumber())
                .orElseThrow(() -> new CustomException(HttpStatus.FORBIDDEN, "휴대폰 인증이 필요합니다."));

        Member member = memberRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        member.updatePassword(passwordEncoder.encode(request.getNewPassword()));
    }
}
