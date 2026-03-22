# 인하평(`inha-eval`) 프로젝트 이어받기용 최신 컨텍스트

이 문서는 이전 여러 스레드에서 나뉘어 진행한 작업 내용을 하나로 합친 최신 handoff 문서다.
다음 스레드에서는 이 문서를 현재 기준 상태로 간주하고 이어서 작업해주면 된다.

---

## 1. 프로젝트 개요

- 프로젝트 경로: `/Users/bagseon-ung/inha-eval`
- 프로젝트명: `inha-eval` / 인하평
- 프론트엔드: Vite + React + TypeScript
- 백엔드: Spring Boot
- 역할 분담:
  - 나는 프론트엔드 + 인프라/배포 담당
  - 친구는 백엔드 로직 담당
- 작업 원칙:
  - 백엔드는 친구 담당이므로, 백엔드 코드는 임의로 크게 변경하지 말고 필요 시 제안 위주로 설명
  - 프론트는 가능한 경우 바로 코드 수정까지 진행
  - 기존 디자인 톤과 방향은 유지

---

## 2. 현재 운영/배포 구조

### 프론트

- 로컬 개발 주소:
  - `http://localhost:5173`
- 현재 production 프론트 주소:
  - `https://inha-eval.com`
- 참고:
  - 예전에는 `https://inha-eval.vercel.app` 를 썼지만, 지금은 `https://inha-eval.com` 으로 변경한 상태다

### 백엔드

- EC2에서 실행 중
- 백엔드 공개 주소:
  - `https://api.inha-eval.com`
- Swagger:
  - `https://api.inha-eval.com/swagger-ui/index.html`

### 중요 원칙

- 앞으로 프론트 테스트는 Vercel preview URL이 아니라 production URL인 `https://inha-eval.com` 기준으로 맞추고 싶다
- CORS도 production URL 기준 exact origin 허용 방식으로 유지하고 싶다
- `https://*.vercel.app` 같은 와일드카드 허용은 원하지 않는다

---

## 3. 서버 / 인프라 / 배포 상태

### EC2

- 백엔드 서버는 EC2에서 동작 중
- 기존 퍼블릭 IP:
  - `52.63.156.200`

### 도메인

- Cloudflare에서 `inha-eval.com` 구매 완료
- 백엔드용 서브도메인:
  - `api.inha-eval.com`
- 프론트 production 도메인:
  - `inha-eval.com`

### HTTPS

- Nginx + Certbot으로 백엔드 HTTPS 적용 완료
- 현재 백엔드 HTTPS 주소:
  - `https://api.inha-eval.com`

### systemd

- 서비스명:
  - `inha-eval`
- 외부 설정 파일 위치:
  - `/home/ubuntu/app/application.properties`
- 실행 구조:
  - `/usr/bin/java -jar /home/ubuntu/app/backend.jar --spring.config.additional-location=file:/home/ubuntu/app/`

### GitHub Actions 자동배포

- 워크플로우 파일:
  - `/Users/bagseon-ung/inha-eval/.github/workflows/deploy-backend.yml`
- 현재 동작:
  - `main` 브랜치 push 시
  - 단, `backend/**` 또는 workflow 파일 변경일 때만 실행
- 즉 프론트만 수정된 push는 백엔드 배포 액션이 안 도는 게 정상

### SSH

- 로컬에서 `ssh inha-eval` 로 접속 가능해야 함
- `~/.ssh/config` 는 대략 아래 alias를 쓰는 상태였음
  - Host: `inha-eval`
  - HostName: `52.63.156.200`
  - User: `ubuntu`
  - IdentityFile: `~/.ssh/inhaeval_actions`

---

## 4. 현재 프론트 환경변수 기준

### 로컬 프론트

파일:
- `/Users/bagseon-ung/inha-eval/frontend/.env.local`

현재 기준 값:

```bash
VITE_API_BASE_URL=https://api.inha-eval.com
```

### 배포 프론트

- 현재 production 프론트는 `https://inha-eval.com`
- Vercel/배포 환경에서도 백엔드 API 주소는 아래를 기준으로 맞추는 상태여야 한다

```bash
VITE_API_BASE_URL=https://api.inha-eval.com
```

### 참고

- 예전에는 `http://52.63.156.200:8080` 기반 Mixed Content 문제가 있었음
- 지금은 백엔드를 `https://api.inha-eval.com` 으로 붙이면서 그 문제를 해결하는 방향으로 정리함

---

## 5. 백엔드 설정 기준

### application.properties 의미

- 프론트 인증 링크 기준 주소:

```properties
app.frontend-url=https://inha-eval.com
```

- 허용 origin:

```properties
app.allowed-origins=http://localhost:5173,https://inha-eval.com
```

### 중요 원칙

- exact origin 방식 유지
- preview vercel URL 허용 방식으로 바꾸는 것은 원하지 않음
- `allowedOriginPatterns` / `https://*.vercel.app` 방식은 원하지 않음

### 실제 서버 반영 위치

- EC2에서 실제 읽는 설정 파일:
  - `/home/ubuntu/app/application.properties`

---

## 6. 인증(Auth) 관련 최신 상태

### 이미 구현/연동된 기능

- 로그인
- 회원가입
- 이메일 인증
- 전화번호 인증
- 비밀번호 재설정
- 회원 탈퇴
- 내 정보 조회
- 닉네임 변경
- 학과 변경
- 비밀번호 변경
- 전화번호 변경
- 열람권 구매

### 프론트에서 이미 반영된 Auth UX 수정

#### `AuthPage.tsx`

파일:
- `/Users/bagseon-ung/inha-eval/frontend/src/app/pages/AuthPage.tsx`

이미 반영된 것:
- 이메일 인증 상태는 `localStorage` 기반으로 동기화
- 새 창/새 탭에서 메일 인증 후 원래 창과 상태 동기화 가능
- `인증 확인` 버튼은 그냥 완료 처리하지 않고 실제 인증 상태를 확인하도록 수정됨
- 새 메일 발송 시 이전 인증 상태를 초기화하도록 수정됨

#### `EmailVerifyPage.tsx`

파일:
- `/Users/bagseon-ung/inha-eval/frontend/src/app/pages/EmailVerifyPage.tsx`

이미 반영된 것:
- 메일 링크의 token을 받아 백엔드 verify API 호출
- 성공 시 localStorage에 이메일 인증 완료 상태 저장
- 화면은 "인증 완료 / 이 창은 닫아도 된다" 형태로 정리됨

#### 회원 탈퇴 후 처리

파일:
- `/Users/bagseon-ung/inha-eval/frontend/src/app/pages/MyPage.tsx`
- `/Users/bagseon-ung/inha-eval/frontend/src/app/App.tsx`

이미 반영된 것:
- 회원 탈퇴 후 즉시 로그아웃
- `/auth?mode=login` 으로 이동

---

## 7. 강의 / 리뷰 / 사용자 API 연동 상태

### 이미 실제 API 연동된 항목

#### 인증

- 로그인
- 회원가입
- 이메일 인증
- 전화번호 인증
- 비밀번호 재설정

#### 리뷰

- 리뷰 작성
- 강의별 리뷰 조회
- 내 리뷰 조회
- 리뷰 삭제
- 리뷰 좋아요

#### 사용자

- 내 정보 조회
- 닉네임 변경
- 학과 변경
- 비밀번호 변경
- 전화번호 변경
- 열람권 구매
- 회원 탈퇴

#### 강의

- 전체 조회
- 상세 조회
- 검색
- 명강의 / 널널한 꿀강 / 검증된 강의 / 성장형 강의

#### 포인트

- 포인트 내역 조회

---

## 8. 강의 데이터 관련 최신 반영 사항

### section(분반) 반영

#### 백엔드

- `Course` 엔티티에 `section` 추가
- `CourseResponse`에 `section` 포함

#### 프론트

- `Course` 타입에 `section` 반영
- 검색 / 시간표 / 강의 카드에서 `분반` 표시되도록 수정됨

### semester 반영

- 프론트 `Course` 타입에 `semester` 추가
- `api.ts`에서 `CourseResponseDto.semester`를 실제 `Course`로 매핑하도록 수정

### 학과 목록 동적화

기존 문제:
- 학과 목록이 `mockData.ts`의 하드코딩 배열을 사용했음

수정 내용:
- `/api/courses` 결과의 `department`를 uniq하게 뽑아서 동적으로 사용하도록 변경
- 적용 화면:
  - 검색 페이지
  - 회원가입 페이지
  - 마이페이지 학과 변경

### 개설/미개설 판별

기존 문제:
- `CURRENT_OPEN_COURSE_IDS` 하드코딩 Set 기준으로 판별했음

수정 내용:
- `course.semester`와 현재 학기(`CURRENT_SEMESTER_SHORT_LABEL`)를 비교해서 판별하도록 변경

---

## 9. 검색 / 둘러보기 / 강의 상세 / 시간표 구조

### 검색 페이지

파일:
- `/Users/bagseon-ung/inha-eval/frontend/src/app/pages/SearchPage.tsx`

현재 방향:
- 검색 결과는 교수님별 카드
- 과목명 + 교수명 + 학과 + 별점 + 리뷰 수 표시
- `26-1` 개설 과목 상단
- 미개설 과목 하단 회색톤 구분
- 정렬은 가나다순

### 강의 둘러보기

- 과목 단위 카드
- 클릭하면 아코디언처럼 교수님 목록 + 별점 펼침

### 강의 상세

파일:
- `/Users/bagseon-ung/inha-eval/frontend/src/app/pages/CourseDetailPage.tsx`
- `/Users/bagseon-ung/inha-eval/frontend/src/app/components/ReviewCard.tsx`

현재 상태:
- 시험/족보 탭 제거
- 리뷰 내부 정보로 시험/족보 통합
- 상단 구조 정리
- 별점과 육각형 스탯 강조
- 리뷰 카드 UI 정리
- 뱃지 색상/아이콘 정리

### 강의평 작성 화면

현재 상태:
- 시험/족보 정보 구조화
- 별점 UI 리디자인
- 포인트 안내/등록 버튼 구조 재정리
- 시험 대비 팁 30자 이상 시 추가 포인트 방식 반영
- 시험/족보 정보 필수/선택 항목 분리

### 시간표 기능 방향

- 쇼핑몰처럼 먼저 장바구니에 강의를 담음
- 이후 `/timetable` 에서 시간표를 조립
- 총 학점 표시
- 시간 겹침 확인
- 블록형 시간표 UI
- 드래그해서 보드에 놓는 느낌

### 시간표 페이지

파일:
- `/Users/bagseon-ung/inha-eval/frontend/src/app/pages/TimetablePage.tsx`
- `/Users/bagseon-ung/inha-eval/frontend/src/app/data/timetableData.ts`

현재 구현:
- `/timetable` 라우트 추가
- 장바구니 강의 / 배치된 강의 분리
- 총 학점 표시
- 시간 충돌 감지
- 블록형 주간 시간표 보드
- 드래그 앤 드롭
- 충돌 시 빨간 프리뷰 + 실패 토스트
- 다시 빼기 가능
- 드롭 성공 시 짧은 강조 모션

---

## 10. 메인 페이지 관련 상태

### 메인 시각 요소

- 안뇽이 / 인덕이 이미지 애니메이션 적용
- 안뇽이는 상단 쪽 떠다니는 느낌
- 인덕이는 하단에서 걷는 느낌

관련 에셋:
- `/Users/bagseon-ung/inha-eval/frontend/src/assets/annyongi-run-a.png`
- `/Users/bagseon-ung/inha-eval/frontend/src/assets/annyongi-run-b.png`
- `/Users/bagseon-ung/inha-eval/frontend/src/assets/inducki-walk-a.png`
- `/Users/bagseon-ung/inha-eval/frontend/src/assets/inducki-walk-b.png`
- `/Users/bagseon-ung/inha-eval/frontend/src/assets/inducki-walk-c.png`

---

## 11. DB 상태

### MySQL

- DB 이름: `inha_eval`

### 주요 테이블

- `courses`
- `reviews`
- `members`
- `point_histories`
- `email_verifications`
- `phone_verification`

### courses 상태

- 크롤링 데이터 import 완료
- 대략 `8347`건 수준이었음
- `section(분반)`까지 반영 완료

### reviews 상태

- 한때 `0`건이었음
- 즉 `/api/reviews/course/{id}` 가 `[]` 인 경우 연동 실패가 아니라 실제 데이터 부재일 수 있음

### 테스트 계정 초기화용 SQL 예시

```sql
USE inha_eval;

DELETE FROM email_verifications WHERE email = '테스트이메일@inha.edu';
DELETE FROM phone_verification WHERE phone_number = '테스트전화번호';
DELETE FROM members WHERE email = '테스트이메일@inha.edu';
```

---

## 12. 크롤링 / import 관련 상태

관련 파일:
- `/Users/bagseon-ung/inha-eval/backend/scripts/generate_course_import_sql.py`
- `/Users/bagseon-ung/inha-eval/backend/sql/import_courses.sql`

상태:
- 크롤링 JSON → SQL 변환 스크립트 존재
- section 반영까지 작업 완료

---

## 13. 남아 있는 mock / hardcoded 상태

### 실제 API 기반으로 이미 바뀐 것

- 학과 목록
- 개설/미개설 판별
- semester 반영
- 강의 검색/조회
- 리뷰 관련
- 사용자 관련 상당수

### 아직 mock 또는 hardcoded가 남아 있는 것

#### 공지 / 문의

- 현재 프론트 mock 기반
- 이유:
  - 백엔드 API가 아직 없음
- 관련 파일:
  - `/Users/bagseon-ung/inha-eval/frontend/src/app/api/api.ts`
  - `/Users/bagseon-ung/inha-eval/frontend/src/app/data/mockData.ts`
  - `/Users/bagseon-ung/inha-eval/frontend/src/app/pages/MyPage.tsx`

#### 시간표 슬롯

- 현재 시간표 보드/장바구니는 `TIMETABLE_BY_COURSE_ID` 하드코딩 데이터 사용 중
- 이유:
  - 현재 course API에 요일 / 시간 / 강의실 정보가 없음
- 관련 파일:
  - `/Users/bagseon-ung/inha-eval/frontend/src/app/data/timetableData.ts`
  - `/Users/bagseon-ung/inha-eval/frontend/src/app/pages/SearchPage.tsx`
  - `/Users/bagseon-ung/inha-eval/frontend/src/app/pages/TimetablePage.tsx`
  - `/Users/bagseon-ung/inha-eval/frontend/src/app/pages/CourseDetailPage.tsx`

즉 현재 요약:
- 강의 목록 / 학과 / 개설 상태는 실제 DB/API 기반
- 공지 / 문의 / 시간표 슬롯은 아직 mock 기반

---

## 14. 백엔드/서버 관련 주요 히스토리

### 리뷰 조회 403 이슈

- `GET /api/reviews/course/{courseId}` 가 인증 필요로 막혀 있었음
- `SecurityConfig` 수정 후 공개 허용
- 자동배포로 반영됨

### systemd datasource 이슈

원인:
- JAR 안에 `application.properties` 가 없었음
- `.gitignore` 때문에 리소스 파일이 빌드에 포함되지 않던 상황

해결:
- `/home/ubuntu/app/application.properties` 를 외부 설정으로 두고
- systemd에서 `--spring.config.additional-location=file:/home/ubuntu/app/` 사용

### Mixed Content 이슈

- 예전에는 배포 프론트 HTTPS → 백엔드 HTTP 호출 때문에 문제 있었음
- 현재는 백엔드를 `https://api.inha-eval.com` 으로 붙이면서 해결 방향 정리됨

### CORS 운영 원칙

- production 프론트 도메인 `https://inha-eval.com` 기준 exact origin 허용을 원함
- preview vercel URL까지 허용하는 구조는 원하지 않음

---

## 15. 현재 확인된 상태

### 정상

- `/api/courses` 응답 정상
- `https://api.inha-eval.com/swagger-ui/index.html` 접근 가능
- HTTP/HTTPS/Nginx/Certbot 배포는 완료 상태

### 주의

- 일부 강의 상세/리뷰 화면에서 빈 상태가 보이면 연동 실패가 아니라 실제 데이터 부재일 수 있음
- 특히 리뷰는 `[]` 일 수 있음

---

## 16. 앞으로 우선적으로 도와줬으면 하는 일

아래 순서로 이어서 작업해줘.

1. 현재 프론트에서 남아 있는 mock / hardcoded 사용처를 다시 한 번 전수 조사
2. 백엔드 API가 있는 항목은 모두 실제 API 기준으로 전환
3. 백엔드 API가 없는 항목은
   - 제거 가능한지
   - 최소 목데이터 유지가 맞는지
   - 빈 상태로 바꾸는 게 맞는지
   판단해서 정리
4. 시간표 관련은 현재 백엔드 응답 구조로 가능한 범위와 불가능한 범위를 명확히 구분
5. 필요한 경우 백엔드 API / 스키마 추가 제안까지 같이 해줘
6. 가능하면 바로 코드 수정까지 진행해줘

---

## 17. 작업 스타일 요청

- 가능하면 바로 코드 수정까지 진행
- 백엔드 API가 아예 없는 부분은 왜 못 바꾸는지 명확히 설명
- 프론트 디자인 톤은 기존 방향 유지
- `apply_patch` 로 수정
- 마지막 답변에는 꼭 아래 3가지를 같이 정리
  1. 실제로 바꾼 것
  2. 아직 백엔드가 더 필요해서 못 바꾼 것
  3. 테스트 방법

---

## 18. 가장 최근 상태 한 줄 요약

- 프론트 production 도메인은 이제 `https://inha-eval.com`
- 백엔드 production API 도메인은 `https://api.inha-eval.com`
- 배포/HTTPS는 붙은 상태
- 다음 작업은 프론트에 남은 mock/hardcoded 정리와 실제 API 기준 전환이다
