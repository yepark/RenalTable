# RenalTable 로드맵

- 최종 갱신: 2026-11-02
- 현재 상태: Phase 2 진행 중
- 상태 표기: `[x] 완료`, `[ ] 미착수`, `[!] 사람 승인/외부 검증 필요`

## Phase 0 — 프로젝트 분석 및 요구사항

- [x] 빈 Git 저장소와 로컬 개발 환경 확인
- [x] 제품 범위·MVP 수용 기준 작성
- [x] 의료 안전 위험과 보류 규칙 작성
- [x] 공식 기술 지원 범위 조사
- [x] 모듈형 모놀리스 아키텍처 초안
- [x] DB ERD, API, 디자인 시스템 초안
- [x] 공공 영양 데이터/API와 의료 출처 조사
- [x] 보안·테스트 계획과 결정 기록 작성
- [x] `AGENTS.md`, `CLAUDE.md` 작업 규칙 작성

Phase 0 종료 조건: 애플리케이션 코드, DB, 외부 서비스 연결, 배포를 만들지 않고 문서만 생성. 충족.

## Phase 1 — 프로젝트 초기화

### P1-01 기반 초기화

- [x] 작업 당일 공식 릴리스/보안 공지 재확인
- [x] Node 24 LTS와 npm 버전 정책 고정
- [x] Next.js 16 App Router + TypeScript strict + Tailwind 4 초기화
- [x] 한국어 metadata, 기본 layout, 반응형 shell
- 수용 기준: clean install, dev/build/typecheck 성공; 샘플 영양 수치 없음

### P1-02 품질 도구

- [x] ESLint, formatter, import boundary 규칙
- [x] Vitest 5, Testing Library, Playwright 설정
- [x] 정상/실패 예제 테스트와 접근성 smoke test
- 수용 기준: 단일 명령으로 lint/typecheck/unit/build/E2E smoke 실행

### P1-03 CI와 저장소 위생

- [x] GitHub Actions PR workflow
- [x] 최소 권한, lockfile install, cache, secret scan
- [x] `.env.example`, `.gitignore`, 기여/로컬 실행 README
- 수용 기준: secret 없이 PR CI 통과; 배포 workflow 없음

### P1-04 디자인 시스템 기반

- [x] 검증된 색/타입/간격 token
- [x] Button, Input, Notice, DataStatusBadge, SourceDisclosure
- [x] 320 px, keyboard, contrast, 200% zoom 검증
- 수용 기준: Story/demo page 또는 component tests로 상태 확인

### P1-05 브라우저 저장 계약

- [x] versioned profile/planner schema와 storage port 설계
- [x] 저장/읽기/삭제/migration 실패 unit test
- [x] 기기 공동 사용과 삭제 안내 문구
- 수용 기준: 서버/로그로 프로필 전송이 없음을 네트워크 테스트로 확인

권장 첫 작업: **P1-01 기반 초기화**. 외부 DB나 배포 없이 웹 앱과 로컬 품질 명령만 만든다.

Phase 1 검증 기록: Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3, Tailwind CSS
4.3.3, Vitest 5.0.5를 lockfile에 고정했다. `npm audit`에서 알려진 취약점 0건을 확인했고,
Node 24 환경의 `npm ci`, format/lint/typecheck/unit/build와 320 px·200% 확대 Chromium smoke
E2E를 통과했다. E2E에서 외부 origin 요청이 없음을 확인했으며 배포와 외부 서비스 연결은
수행하지 않았다.

## Phase 2 — 식품 데이터

- [!] 공공데이터 활용신청/키 발급과 라이선스 재확인
- [ ] 로컬 PostgreSQL, Drizzle schema/migration
  - [x] PostgreSQL 18 compose, Drizzle schema와 SQL migration 작성
  - [x] 누락값·계보·게시 상태 제약의 격리 DB 통합 테스트
  - [!] 실제 PostgreSQL 18.6 compose smoke 필요(Docker/psql 미설치 환경)
- [x] raw snapshot 계약, validator, source adapter, normalizer, quality report 로컬 기반
- [!] 최초 운영 데이터 매핑/게시 사람 승인
- [x] 음식 검색/상세 API와 UI 기반

## Phase 3 — 레시피

- [ ] 레시피/재료/검토 모델
- [ ] 출처 기반 레시피 입력 workflow
- [ ] 버전 있는 영양 계산과 완전성
- [!] 의료/영양 전문가 게시 승인 절차
- [ ] 레시피 목록/상세

## Phase 4 — 식단 추천

- [ ] 로컬 프로필 UI
- [ ] 규칙 기반 hard filter와 판단 보류
- [ ] 사용자 목표 수치 비교와 설명
- [ ] 위험 결함 주입 회귀 세트
- [!] 치료 방식별 문구 전문가 검토

## Phase 5 — 식단표와 장보기

- [ ] 7일 × 3끼 플래너
- [ ] 영양 합계/부분 합계
- [ ] 반복 메뉴 표시와 교체
- [ ] 재료 합산, 체크, 인쇄/공유 대안
- [ ] 브라우저 저장 migration/E2E

## Phase 6 — 품질 검증과 공개 준비

- [x] Sites 소유자 전용 정적 웹 미리보기 승인 및 구성
- [ ] 전체 E2E/접근성/성능/보안 점검
- [ ] 데이터 정확성 sampling과 ETL rollback drill
- [!] 의료 콘텐츠 전문가 최종 검토
- [!] 개인정보/법률 문구 검토
- [!] 호스팅 비용·약관·운영 주체 결정
- [!] 월 0원 한도와 자동 과금 차단 확인
- [!] `renaltable.vercel.app` 이름 가용성 및 실제 배포 주소 확인
- [!] 프로덕션 배포 명시적 사용자 승인

## 백로그 / MVP 이후

- PWA/offline 전략
- 계정 및 기기 간 동기화(별도 개인정보 영향평가 필요)
- 관리자 CMS
- 다국어와 소아/이식 특화 콘텐츠
- 검색 엔진/캐시(측정 후에만)

## 현재 위험과 차단 조건

| 위험 | 현재 대응 | 해제 조건 |
| --- | --- | --- |
| 인/칼륨 데이터 불완전 | 누락 전파, 프로파일링 예정 | 실제 데이터 완전성 보고서 |
| 의료 표현 과신 | 안전/적합 표현 금지 | 전문가 문구 승인 |
| 공공데이터 중복/단위 차이 | 계보 보존, 자동 병합 금지 | 샘플 매핑 검토 |
| 무료 호스팅 제약 | 후보로만 기록 | 운영 주체·트래픽·약관 검토 |
| 브라우저 건강정보 노출 | 서버 미전송, 삭제/공동기기 안내 | 위협 모델·E2E 통과 |

## 작업 기록

### 2026-11-01 — Phase 0

- 빈 저장소를 신규 프로젝트로 판정했다.
- 공식 기술/의료/공공데이터 출처를 조사하고 11개 설계 문서와 에이전트 규칙을 작성했다.
- 외부 서비스 연결, 데이터 다운로드, 앱/DB 생성, 배포는 수행하지 않았다.

### 2026-11-01 — 무료 운영 요구사항 추가

- 모든 사용자 무료와 MVP 월 인프라 비용 0원을 제품 요구사항으로 확정했다.
- 비공개 저장소를 유지할 수 있는 Vercel Hobby를 우선 후보로 기록했다.
- PWA는 별도 주소가 아니라 배포된 웹사이트의 설치 가능 형태로 정의했다.

### 2026-11-01 — Phase 1

- Node 24/npm 11 정책과 Next.js 16 App Router 기반을 lockfile로 고정했다.
- 한국어 반응형 shell, 접근 가능한 기본 컴포넌트, 버전 있는 프로필·플래너 저장 계약을
  구현했다.
- PR CI와 로컬 품질 명령, 단위·컴포넌트·Chromium smoke 테스트를 구성했다.
- DB, 외부 데이터, 배포 workflow, 외부 서비스 연결은 추가하지 않았다.

### 2026-11-02 — Phase 2 로컬 DB 기반

- 공공데이터나 외부 서비스를 연결하지 않고 Phase 2 식품 데이터용 PostgreSQL schema와
  SQL migration을 작성했다.
- 누락 영양값과 숫자 0의 구분, 원본-식품 계보, 게시 시각을 DB 제약으로 검증했다.
- 격리 PostgreSQL 호환 환경의 migration/제약 테스트 7개와 `npm audit` 0건을 확인했다.
- 실제 PostgreSQL 18.6 compose smoke는 Docker/psql을 사용할 수 있는 환경에서 남아 있다.

### 2026-11-02 — Phase 2 로컬 ETL·음식 조회 기반

- 외부 API를 호출하지 않고 식약처 OpenAPI와 전국통합 표준데이터용 순수 adapter, canonical
  staging record, Zod 경계 검증과 품질 보고서를 구현했다.
- 누락과 숫자 0, 미량을 구분하고 칼륨·인 누락, 잘못된 값·단위, 동일 출처 키 중복 후보가 있으면
  게시 대상을 만들지 않는 회귀 테스트를 추가했다.
- repository port와 빈 운영 adapter, 게시 데이터 전용 음식 목록·상세 API, 한국어 검색·빈 상태·
  정보 없음·출처 표시 UI 기반을 구현했다.
- 실제 공공데이터 다운로드, API 키, 외부 DB, 운영 데이터 게시와 배포는 수행하지 않았다.

### 2026-11-02 — 소유자 전용 웹 미리보기

- 사용자의 명시적 요청에 따라 현재 한국어 홈 화면을 정적 export로 전환했다.
- 건강 프로필, 식단, 외부 데이터와 데이터베이스 연결 없이 Sites 소유자 전용 배포를
  구성했다.
- 공개 전환, 광고 연결, 의료 콘텐츠 게시와 운영 데이터 반영은 별도 승인·검토 대상으로
  유지했다.

