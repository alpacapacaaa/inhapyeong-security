package com.inhaeval.backend.service;

import com.inhaeval.backend.domain.Member;
import com.inhaeval.backend.domain.RefreshToken;
import com.inhaeval.backend.exception.CustomException;
import com.inhaeval.backend.repository.*;
import com.inhaeval.backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenReuseDetectionTest {

    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock MemberRepository memberRepository;
    @Mock EmailVerificationRepository emailVerificationRepository;
    @Mock PhoneVerificationRepository phoneVerificationRepository;
    @Mock PhoneVerificationService phoneVerificationService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock MailService mailService;
    @Mock JwtUtil jwtUtil;
    @Mock PointHistoryRepository pointHistoryRepository;

    @InjectMocks
    MemberService memberService;

    private static final String EMAIL = "test@inha.ac.kr";
    private static final String FAMILY_ID = UUID.randomUUID().toString();
    private static final String TOKEN_A = UUID.randomUUID().toString();
    private static final String TOKEN_B = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(memberService, "refreshExpiration", 86400000L);
    }

    @Test
    @DisplayName("정상 Rotation: 유효한 토큰으로 재발급 시 새 토큰 반환")
    void normalRotation_returnsNewToken() {
        RefreshToken tokenA = validToken(TOKEN_A, FAMILY_ID, false);
        Member member = activeMember();

        when(refreshTokenRepository.findByToken(TOKEN_A)).thenReturn(Optional.of(tokenA));
        when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
        when(refreshTokenRepository.save(any())).thenReturn(tokenA);
        when(jwtUtil.generateToken(EMAIL)).thenReturn("new-access-token");

        var result = memberService.refreshAccessToken(TOKEN_A);

        assertThat(result.getAccessToken()).isEqualTo("new-access-token");
        verify(refreshTokenRepository, times(2)).save(any());
    }

    @Test
    @DisplayName("재사용 감지: 이미 사용된 RT-A 재시도 시 familyId 전체 무효화")
    void reuseDetected_revokesEntireFamily() {
        // RT-A는 이미 Rotation으로 used=true 상태 (공격자가 탈취 후 재시도하는 시나리오)
        RefreshToken usedTokenA = validToken(TOKEN_A, FAMILY_ID, true);

        when(refreshTokenRepository.findByToken(TOKEN_A)).thenReturn(Optional.of(usedTokenA));

        assertThatThrownBy(() -> memberService.refreshAccessToken(TOKEN_A))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> {
                    CustomException customEx = (CustomException) ex;
                    assertThat(customEx.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(customEx.getMessage()).contains("재사용");
                });

        // 패밀리 전체 즉시 삭제 확인
        verify(refreshTokenRepository).deleteByFamilyId(FAMILY_ID);
        // 새 토큰 발급 없음
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("재사용 감지: RT-B가 살아있어도 familyId 기준으로 함께 무효화")
    void reuseDetected_tokenBAlsoRevoked() {
        RefreshToken usedTokenA = validToken(TOKEN_A, FAMILY_ID, true);

        when(refreshTokenRepository.findByToken(TOKEN_A)).thenReturn(Optional.of(usedTokenA));

        assertThatThrownBy(() -> memberService.refreshAccessToken(TOKEN_A))
                .isInstanceOf(CustomException.class);

        // RT-B도 같은 familyId → deleteByFamilyId 한 번으로 전체 처리
        verify(refreshTokenRepository).deleteByFamilyId(FAMILY_ID);
    }

    @Test
    @DisplayName("만료된 토큰: 만료 시 개별 삭제 후 예외")
    void expiredToken_deletedAndThrows() {
        RefreshToken expiredToken = expiredToken(TOKEN_A, FAMILY_ID);

        when(refreshTokenRepository.findByToken(TOKEN_A)).thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> memberService.refreshAccessToken(TOKEN_A))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> assertThat(((CustomException) ex).getStatus())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));

        verify(refreshTokenRepository).delete(expiredToken);
        verify(refreshTokenRepository, never()).deleteByFamilyId(any());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private RefreshToken validToken(String token, String familyId, boolean used) {
        RefreshToken rt = RefreshToken.builder()
                .email(EMAIL)
                .token(token)
                .familyId(familyId)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        if (used) rt.markAsUsed();
        return rt;
    }

    private RefreshToken expiredToken(String token, String familyId) {
        return RefreshToken.builder()
                .email(EMAIL)
                .token(token)
                .familyId(familyId)
                .expiresAt(LocalDateTime.now().minusSeconds(1))
                .build();
    }

    private Member activeMember() {
        return Member.builder()
                .email(EMAIL)
                .password("encoded")
                .nickname("테스터")
                .department("컴퓨터공학과")
                .role(Member.Role.USER)
                .isActive(true)
                .isVerified(true)
                .points(0)
                .build();
    }
}
