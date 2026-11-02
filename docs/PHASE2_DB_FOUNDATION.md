# Phase 2 로컬 데이터베이스 기반

- 상태: 구현 완료, 실제 PostgreSQL compose smoke 대기
- 기준일: 2026-11-02
- 범위: 외부 서비스 연결 없이 로컬 PostgreSQL 스키마와 마이그레이션을 검증한다.

## Requirement

- `docs/DATABASE.md`의 Phase 2 식품 데이터 테이블만 구현한다.
- 영양 관측값의 부재와 숫자 0을 DB 제약으로 구분한다.
- 원본 출처, 수집 배치, 원본 레코드, 정규화 식품과 영양 관측의 계보를 보존한다.
- 사용자 프로필과 식단표를 서버 테이블로 만들지 않는다.
- 운영 데이터, 실제 환자 데이터, API 키, 자동 게시 경로를 만들지 않는다.

## Design

- PostgreSQL 18을 로컬 기준으로 사용한다. 2026-11-02 기준 최신 안정 계열은 18이며 19는
  RC이므로 사용하지 않는다.
- PostgreSQL 18 공식 컨테이너의 변경된 `PGDATA` 규칙에 맞춰 volume을
  `/var/lib/postgresql`에 연결한다.
- Drizzle schema를 타입 정의의 기준으로 두고 생성된 SQL migration을 함께 검토한다.
- Sites 정적 패키징의 예약 경로와 충돌하지 않도록 SQL migration은 `db/migrations/`에 둔다.
- `content_source → food_import_log → food_source_record → food_nutrient` 연결로 출처와
  수집 배치를 추적한다.
- 외래 키 삭제는 `RESTRICT`, 공개 이력은 상태 전이와 시각으로 보존한다.
- `PRESENT`만 0 이상의 숫자를 허용하고 `TRACE`, `BELOW_LIMIT`, `MISSING`,
  `NOT_APPLICABLE`은 `amount IS NULL`을 강제한다.

## Tasks

1. 로컬 PostgreSQL 18 compose와 환경 변수 예시를 추가한다.
2. Drizzle 설정과 Phase 2 식품 테이블 schema를 작성한다.
3. 검토 가능한 첫 SQL migration을 생성한다.
4. 격리 PostgreSQL 호환 엔진에서 migration과 위험 제약을 통합 테스트한다.
5. format, lint, typecheck, unit/integration, build를 실행하고 ROADMAP을 갱신한다.

## Acceptance criteria

- `npm run db:generate`가 schema drift 없이 완료된다.
- 빈 데이터베이스에 migration이 적용된다.
- `PRESENT 0`은 저장되고 `MISSING 0`, `PRESENT NULL`, 음수 값은 거부된다.
- 출처 없는 영양 관측과 게시 시각 없는 `PUBLISHED` 식품은 거부된다.
- 서버 schema에 프로필, 목표, 식단표 테이블이 없다.
- 저장소에 seed 영양값, 외부 API 응답, 비밀값이 없다.

## Medical and privacy risks

| 위험 | 통제 |
| --- | --- |
| 누락값을 0으로 저장해 낮은 함량처럼 보임 | 상태-값 조합 `CHECK`와 결함 주입 테스트 |
| 원본 출처나 기준량 손실 | 필수 FK, 기준량, 단위와 수집 배치 필드 |
| 검토 전 데이터 게시 | 명시적 게시 상태와 게시 시각 제약; 게시 use case는 후속 작업 |
| 건강 프로필 서버 수집 | 프로필·식단 서버 테이블과 API를 만들지 않음 |
| 비밀값 커밋 | 예시값만 제공하고 실제 `.env`는 gitignore 유지 |

## Deferred approval gates

- 공공데이터 활용신청, API 키 발급, 원본 다운로드
- 운영 데이터 매핑과 최초 게시
- Supabase 등 외부 DB 연결과 배포

## Verification result

- Drizzle ORM 0.45.4, Drizzle Kit 0.31.11, Zod 4.6.7을 보안 수정 버전으로 고정했다.
- PGlite의 격리 PostgreSQL 호환 환경에서 빈 DB migration과 제약 회귀 테스트 7개가
  통과했다.
- `npm audit` 0건을 확인했다.
- 현재 작업 환경에는 Docker와 `psql`이 없어 PostgreSQL 18.6 컨테이너 smoke는 실행하지
  못했다. `docker compose up -d postgres && npm run db:migrate` 검증 후 ROADMAP 항목을
  최종 완료 처리한다.
