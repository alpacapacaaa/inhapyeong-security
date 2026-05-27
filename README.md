# 인하평 JWT 보안 포트폴리오

직접 개발한 인하대학교 강의평가 모바일 앱(인하평)의 JWT 인증 구조를 대상으로,  
취약점을 발굴하고 단계적으로 방어를 구현한 보안 포트폴리오입니다.

## 바로가기

| | 링크 |
|---|---|
| 취약점 분석 · 설계 (Issues) | [closed Issues 보기](https://github.com/alpacapacaaa/inhapyeong-security/issues?q=is%3Aissue+is%3Aclosed) |
| 구현 · 데모 (Pull Requests) | [closed PRs 보기](https://github.com/alpacapacaaa/inhapyeong-security/pulls?q=is%3Apr+is%3Aclosed) |

---

## 포트폴리오 구조

Issues에서 취약점을 분석하고 개선 방향을 설계한 뒤, PRs에서 실제 구현과 데모를 기록하는 방식으로 구성했습니다.

```
Issue #1 (취약점 분석) → PR #4 (Before 재현)
Issue #2 (개선 설계)   → PR #5 (네트워크·원자성 방어)
                        → PR #6 (동시성 방어)
Issue #3 (심화 설계)   → PR #7 (Reuse Detection 구현)
Issue #8 (리서치)      → DPoP 적용 가능성 탐색
```

---

## 발견한 취약점과 개선 내용

### 취약점 1 — MITM Bearer Token 탈취
SSL Pinning이 없어 Proxyman으로 HTTPS 트래픽이 평문으로 노출됐다.  
탈취한 Access Token은 만료(15분)되기 전까지 어디서든 유효했다.

**개선:** React Native SSL Pinning 적용으로 신뢰하지 않는 프록시 차단  
**개선:** Redis jti 블랙리스트 + 로그아웃 API로 탈취 토큰 즉시 무효화

### 취약점 2 — Race Condition
`@Transactional`만으로는 동시 요청을 막을 수 없었다.  
같은 Refresh Token으로 두 요청이 동시에 들어오면 한 쪽이 500 또는 401을 받았다.

**개선:** 이메일 단위 `ReentrantLock`으로 Rotation 임계 구역 직렬화  
**핵심:** 락이 `@Transactional`을 감싸야 커밋 직전 진입 틈새까지 막힘 → `self` 주입 패턴 적용

### 취약점 3 — Rotation 사각지대
공격자가 Refresh Token을 탈취해 먼저 사용하면, 정상 사용자가 쫓겨나고 공격자 세션이 유지됐다.  
`delete` 기반 Rotation은 탈취 흔적을 지워 서버가 이를 감지할 수 없었다.

**개선:** RFC 6819 §5.2.2.3 기반 Reuse Detection 구현  
- `delete` 대신 `used=true` 마킹으로 재사용 이력 보존  
- `familyId`로 세션 그룹 묶기 → 재사용 감지 시 family 전체 무효화  
- 구현 중 `@Transactional` 롤백으로 `deleteByFamilyId`가 무효화되는 버그 발견 → `noRollbackFor`로 해결

---

## 데모 도구

| 도구 | 용도 |
|---|---|
| Proxyman | SSL Pinning 전후 비교, HTTP 요청/응답 확인 |
| RedisInsight | jti 블랙리스트 TTL 확인 |
| VisualVM | ReentrantLock T1/T2 스레드 상태 관찰 |
| MySQL Workbench | Refresh Token 행 변화 (used=false → true → 삭제) 관찰 |

---

## 참고

- [RFC 6819 §5.2.2.3 — Refresh Token Reuse Detection](https://datatracker.ietf.org/doc/html/rfc6819#section-5.2.2.3)
- [OAuth 2.0 Security BCP §4.13](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#section-4.13)
- [RFC 9449 — DPoP (리서치, Issue #8)](https://datatracker.ietf.org/doc/html/rfc9449)
