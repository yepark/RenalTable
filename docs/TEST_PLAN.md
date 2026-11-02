# RenalTable 테스트 전략

- 상태: Phase 0
- 우선순위: 의료적 오판 방지 > 데이터 계보 > 핵심 사용 흐름 > 시각적 완성도

## 1. 테스트 피라미드

| 계층 | 도구 | 대상 |
| --- | --- | --- |
| 정적 | TypeScript strict, ESLint | 타입, import 경계, 기본 결함 |
| Unit | Vitest | 환산, 합산, 목표 비교, 필터/추천 순수 함수 |
| Component | Vitest + Testing Library | 한국어 상태/오류, 키보드 상호작용 |
| Integration | Vitest + 격리 DB | repository, query, ETL adapter, route validation |
| E2E | Playwright | 실제 사용자 흐름, 저장 유지, 인쇄/공유 대안 |
| 접근성 | axe 보조 + 수동 | WCAG 2.2 AA, 키보드, screen reader 핵심 흐름 |

자동 접근성 도구만으로 WCAG 준수를 선언하지 않는다.

## 2. Unit 필수 사례

### 영양 계산

- 100 g 기준을 임의 섭취량으로 선형 환산
- 여러 재료/여러 끼 합산
- 인분 배수와 표시 반올림 분리
- mg↔g 허용 변환, 부피↔질량 미확인 변환 거부
- trace/below-limit/missing 전파
- 원자료 `PRESENT 0`과 `MISSING null` 구분

### 목표와 추천

- 목표 없음 → 판단 보류
- max/min/range 경계값
- 모순된 목표 거부
- 부분 합계 → 목표 충족 판정 금지
- 알레르기/제외 재료 hard exclusion
- 비투석/혈액투석/복막투석 상태 혼동 방지
- 반복 메뉴 정렬과 결정적 tie-break

### 장보기

- 같은 food ID와 호환 단위 합산
- 같은 이름이지만 다른 식품 ID는 자동 병합하지 않음
- 변환 불가 단위를 별도 표시
- 인분 변경 시 수량 갱신

## 3. Integration 필수 사례

- 식품 이름/카테고리 검색과 pagination
- 게시되지 않은 식품·레시피 조회 차단
- food → nutrient → source join
- 레시피 재료 변경 후 calculation version/input hash 변경
- OpenAPI fixture의 정상, 필드 누락, 타입 오류, 중복, 단위 불일치 변환
- 검증 실패 import가 기존 게시 데이터를 변경하지 않음
- API UUID/enum/길이/범위 validation과 한국어 오류

실제 운영 API를 CI에서 호출하지 않는다. 출처 이용조건에 맞는 고정 fixture와 schema contract를 사용하고, 수동 smoke import를 별도 승인 workflow로 둔다.

## 4. E2E 수용 흐름

1. 홈 진입, 핵심 landmark와 의료 안내 확인
2. 음식 검색, 100 g/섭취량 비교, 출처와 정보 없음 표시
3. 프로필에서 치료 방식과 목표 설정, 새로고침 후 유지, 전체 삭제
4. 레시피 필터, 상세 재료/영양/검토 상태 확인
5. 7일 식단에 메뉴 추가·교체, 하루 합계와 부분 합계 확인
6. 목표 미입력 시 판정하지 않는지 확인
7. 장보기 목록 생성·체크, 인쇄 레이아웃
8. local schema migration 실패 시 데이터 손실 없는 복구 안내

## 5. 위험 기반 회귀 세트

| 결함 주입 | 기대 결과 |
| --- | --- |
| 칼륨 null을 0으로 변환 | 테스트 실패, UI `정보 없음` |
| 혈액투석 프로필에 비투석 기본 단백질 목표 삽입 | 테스트 실패; 기본 목표 자체가 없어야 함 |
| 알레르기 재료가 높은 점수로 추천됨 | hard exclusion 테스트 실패 |
| 한 재료의 인 값 누락 | 레시피 인 합계 `PARTIAL`, 목표 충족 금지 |
| 검토 만료 레시피 게시 | repository/API 계약 테스트 실패 |
| ETL row count 급감 | publish 중지, 사람 검토 필요 |

## 6. 접근성 수동 체크

- 320 px/200% zoom reflow
- 키보드만으로 검색, 필터, 프로필, 플래너 완료
- focus visible/순서/모달 복귀
- VoiceOver 또는 NVDA로 영양표, 오류 요약, 동적 합계 이해
- 색각 시뮬레이션과 대비 측정
- 인쇄물에서 출처/누락/주의 문구 유지

## 7. CI 게이트 초안

PR: install with lockfile → format check → lint → typecheck → unit/component → integration → build → Chromium smoke E2E.

main/nightly 또는 수동: 전체 브라우저 E2E, 접근성 scan, dependency/secret scan. 운영 데이터 import와 프로덕션 배포는 별도 승인 workflow이며 CI 통과만으로 실행하지 않는다.

## 8. 테스트 데이터 정책

- 합성 데이터에는 `TEST ONLY — 운영 사용 금지`를 명시한다.
- 의료적으로 그럴듯한 임의 수치를 운영 seed로 사용하지 않는다.
- 공공데이터 fixture는 허용 범위 내 최소 필드만 보존하고 출처/조회일을 기록한다.
- 실제 환자/사용자 데이터는 테스트에 사용하지 않는다.

## 9. 종료 기준

- P0/P1 결함 0개
- 핵심 E2E 전체 통과, flaky test 원인 기록 없이 재실행 통과로 덮지 않음
- 영양 안전 불변조건과 결함 주입 회귀 세트 통과
- 전문가 검토 필요 항목은 승인되거나 공개 기능에서 비활성화
- 알려진 제한과 미실행 테스트를 릴리스 노트에 기록

## 10. Phase 2 로컬 회귀 범위

- 격리 PostgreSQL 호환 DB에서 migration, `PRESENT 0` 허용, `MISSING 0`·`PRESENT null`·음수
  거부, 계보 불일치와 게시 시각 누락 거부를 검증한다.
- ETL unit test에서 칼륨·인 누락, invalid unit/value, 동일 출처 키 중복 후보와 배치 게시 차단을
  검증한다.
- repository/route 계약 test에서 `PUBLISHED`가 아닌 음식의 목록·상세 노출을 차단한다.
- component/E2E test에서 한국어 검색·빈 상태와 정보 없음·출처 표시 기반을 검증한다.
- CI와 로컬 테스트는 실제 운영 API를 호출하지 않고 실제 환자 데이터나 임의 운영 영양 수치를
  사용하지 않는다.

