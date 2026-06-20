package com.inhaeval.backend.service;

import com.inhaeval.backend.domain.Member;
import com.inhaeval.backend.domain.RefreshToken;
import com.inhaeval.backend.exception.CustomException;
import com.inhaeval.backend.repository.MemberRepository;
import com.inhaeval.backend.repository.RefreshTokenRepository;
import com.inhaeval.backend.util.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * RefreshTokenReuseDetectionTest는 Mockito로 RefreshTokenRepository를 모킹하기 때문에
 * 실제 트랜잭션 매니저를 타지 않아, doRefreshWithTransaction 내부에서 deleteByFamilyId가
 * 예외로 인한 롤백에 휘말려 취소되는지 여부를 검증하지 못한다.
 * 이 테스트는 H2 + 실제 PlatformTransactionManager로 doRefreshWithTransaction을
 * "독립된 물리 트랜잭션"으로 호출해, 재사용 감지 시 family 삭제가 실제로 커밋되는지 확인한다.
 */
@DataJpaTest
@Import(MemberService.class)
@TestPropertySource(properties = "jwt.refresh-expiration=604800000")
@Transactional(propagation = Propagation.NOT_SUPPORTED) // 테스트가 자체 트랜잭션으로 감싸면 doRefreshWithTransaction이 거기에 합류해버려 커밋 여부를 구분할 수 없다
class RefreshTokenRollbackIntegrationTest {

    @Autowired MemberService memberService;
    @Autowired MemberRepository memberRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;

    @MockBean PasswordEncoder passwordEncoder;
    @MockBean MailService mailService;
    @MockBean JwtUtil jwtUtil;
    @MockBean StringRedisTemplate redisTemplate;
    @MockBean PhoneVerificationService phoneVerificationService;

    private static final String EMAIL = "rollback-test@inha.ac.kr";

    @Test
    @DisplayName("재사용 감지: deleteByFamilyId가 noRollbackFor 덕분에 예외 발생 후에도 커밋된다")
    void reuseDetection_familyDeletionPersistsDespiteException() {
        ReflectionTestUtils.setField(memberService, "refreshExpiration", 604_800_000L);

        Member member = memberRepository.save(Member.builder()
                .email(EMAIL).password("x").nickname("n").department("d").build());
        member.verify();
        memberRepository.save(member);

        String familyId = UUID.randomUUID().toString();
        RefreshToken tokenB = refreshTokenRepository.save(RefreshToken.builder()
                .email(EMAIL).token(UUID.randomUUID().toString())
                .familyId(familyId).expiresAt(LocalDateTime.now().plusDays(7))
                .build());

        RefreshToken usedTokenA = refreshTokenRepository.save(RefreshToken.builder()
                .email(EMAIL).token(UUID.randomUUID().toString())
                .familyId(familyId).expiresAt(LocalDateTime.now().plusDays(7))
                .build());
        usedTokenA.markAsUsed();
        refreshTokenRepository.save(usedTokenA);

        assertThatThrownBy(() -> memberService.refreshAccessToken(usedTokenA.getToken()))
                .isInstanceOf(CustomException.class);

        // doRefreshWithTransaction의 물리 트랜잭션은 이미 커밋/롤백이 끝난 뒤이므로,
        // 여기서 재조회한 결과는 실제로 디스크(H2)에 반영된 최종 상태를 보여준다.
        assertThat(refreshTokenRepository.findByToken(tokenB.getToken())).isEmpty();
        assertThat(refreshTokenRepository.findByToken(usedTokenA.getToken())).isEmpty();
    }
}
