# 인하평

인하평은 인하대학교 재학생을 위한 강의평가 플랫폼입니다.  
수강신청 전에 강의 정보를 더 입체적으로 확인하고, 실제 수강 후기를 기반으로 과목을 탐색할 수 있도록 만드는 것을 목표로 합니다.

현재 프로젝트는 단순한 강의평 게시판을 넘어서,
- 학교 이메일 인증 기반 회원가입
- 휴대폰 인증
- JWT 로그인
- 강의 검색 및 상세 조회
- 강의평 작성/열람
- 크롤러 기반 강의/강의계획서 데이터 수집

까지 포함하는 형태로 확장 중입니다.

## 어떤 사이트인가요?

인하평은 인하대학교 수업을 수강한 학생들이 직접 강의평을 남기고, 다른 학생들이 이를 참고해 수강신청과 학업 계획에 활용할 수 있도록 만든 서비스입니다.

기존의 단순 별점/짧은 후기 형태를 넘어서,
- 강의 난이도
- 학습량
- 출석 방식
- 성적 방식
- 시험/과제 특성
- 한 줄 팁

같은 정보를 함께 제공해, 강의 선택에 더 실질적인 도움이 되는 경험을 만드는 것을 목표로 합니다.

또한 학교 포털 기반 강의 데이터와 강의계획서 정보를 수집하는 크롤러를 함께 운영해, 서비스에 필요한 기본 강의 데이터를 자동으로 정리할 수 있도록 구성했습니다.

## 주요 기능

### 인증/계정
- 인하대 이메일 인증 메일 발송 및 링크 인증
- 휴대폰 인증번호 발송 및 검증
- 회원가입 및 로그인
- 비밀번호 재설정

### 강의 탐색
- 강의 목록 조회
- 검색 및 필터링
- 강의 상세 페이지 조회
- 강의별 리뷰 통계 확인

### 리뷰
- 강의평 작성
- 강의별 리뷰 열람
- 사용자 리뷰 확인

### 데이터 수집
- Selenium 기반 강의 데이터 수집
- 강의계획서 및 학과별 강의 목록 크롤링

## 프로젝트 구조

```text
inha-eval/
├── backend/    # Spring Boot 기반 API 서버
├── frontend/   # React + Vite 기반 웹 프론트엔드
├── crawler/    # Selenium 기반 데이터 수집 스크립트
└── README.md
```

## 기술 스택

### Frontend
- React
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Radix UI

### Backend
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- MySQL
- JWT
- Java Mail Sender
- Springdoc OpenAPI

### Crawler
- Python
- Selenium
- BeautifulSoup
- Pandas

## 실행 방법

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

기본적으로 프론트엔드는 `.env.local`의 `VITE_API_BASE_URL` 값을 사용합니다.

예시:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Backend

```bash
cd backend
./gradlew bootRun
```

또는 배포와 유사한 방식으로 실행하려면:

```bash
cd backend
./gradlew bootJar
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

### 3. Crawler

```bash
cd crawler
pip install -r requirements.txt
```

필요한 스크립트를 실행해 강의/강의계획서 데이터를 수집할 수 있습니다.

## 환경 설정

이 프로젝트는 메일 발송, JWT, 문자 인증, 데이터베이스 연결 등 여러 환경 설정값이 필요합니다.

대표적으로 아래 항목들이 필요합니다.
- DB 접속 정보
- 메일 SMTP 정보
- JWT secret
- SMS API key/secret
- 프론트 도메인 및 CORS 허용 origin

실서비스나 포트폴리오 공개용으로 운영할 때는 민감한 값들을 코드에 직접 두지 않고 환경변수로 분리하는 것을 권장합니다.

## 앞으로의 방향

인하평은 단기 과제용으로 끝나는 프로젝트가 아니라,
- 인증/계정 기능 고도화
- 크롤러 안정화
- 취약점 분석 및 보안 개선
- 테스트 및 운영 환경 정리

를 통해 지속적으로 유지보수하고 발전시키는 것을 목표로 하고 있습니다.

특히 이후에는 웹 취약점 진단과 보안 보완 과정을 함께 정리해, 단순 서비스 개발을 넘어 보안 관점까지 담은 포트폴리오로 확장할 계획입니다.
