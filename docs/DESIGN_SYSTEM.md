# RenalTable 디자인 시스템

- 상태: Phase 0 초안
- 브랜드: RenalTable — Eat Well, Care Better.
- 목표: 따뜻함, 신뢰, 쉬운 비교, 의료적 과신 방지

## 1. 디자인 원칙

1. 수치보다 의미와 출처를 함께 보여준다.
2. 색만으로 상태를 전달하지 않는다.
3. 경고를 남발하지 않고 판단 불가와 위험을 구분한다.
4. 모바일 한 손 사용과 큰 글씨를 우선한다.
5. 장식보다 읽기 순서와 명확한 행동을 우선한다.

## 2. 토큰 초안

실제 색상은 Phase 1에서 WCAG 대비 도구로 검증 후 확정한다.

| Token | 의도 | 후보 |
| --- | --- | --- |
| `--color-bg` | 기본 배경 | warm white `#FFFCF7` |
| `--color-surface` | 카드 | `#FFFFFF` |
| `--color-text` | 본문 | deep neutral `#1F2924` |
| `--color-muted` | 보조 텍스트 | 대비 4.5:1 이상으로 조정 |
| `--color-brand` | 주요 행동 | deep green `#176B4D` |
| `--color-brand-soft` | 선택/배경 | pale green |
| `--color-warning` | 확인 필요 | amber/brown + 아이콘/문구 |
| `--color-danger` | 알레르기/입력 오류 | dark red + 아이콘/문구 |

- 본문 기본 16 px 이상, line-height 1.5 이상
- 탭 가능한 목표 크기 최소 24×24 CSS px, 주요 버튼은 44 px 높이를 권장
- spacing은 4 px 기반, 카드 간격은 최소 16 px
- radius는 8–16 px 범위로 일관되게 사용
- 시스템 폰트 우선으로 한국어 로딩과 개인정보 외부 전송을 줄인다.

## 3. 핵심 컴포넌트

- `AppHeader`, `BottomNavigation`, `Breadcrumb`
- `SearchField`, `FilterChip`, `SelectField`, `NumberWithUnitField`
- `FoodCard`, `RecipeCard`, `NutrientTable`, `SourceDisclosure`
- `DataStatusBadge`: 정보 있음/부분 정보/정보 없음
- `ReviewStatus`: 검토 완료/전문가 검토 필요/갱신 필요
- `MedicalNotice`: 의료 상담 대체 불가 안내
- `EmptyState`, `ErrorSummary`, `InlineError`
- `PlannerGrid`: 모바일 목록과 데스크톱 표를 의미 구조상 동일하게 제공

컴포넌트 상태는 default, hover, focus-visible, active, disabled, error, loading, empty를 정의한다. skeleton은 실제 내용과 혼동되지 않게 `aria-hidden` 처리하고 별도 상태 텍스트를 제공한다.

## 4. 화면 정보 구조

### 홈

브랜드/주의 안내 → 검색 → 주요 과업(조건, 음식, 레시피, 식단표) → 검토 레시피 → 건강 가이드.

### 프로필

저장 위치 안내 → 간편 설정 → 상세 목표(접힘) → 알레르기/제외 → 저장/전체 삭제. 목표 입력마다 `의료진에게 안내받은 값을 입력하세요`를 표시한다.

### 음식 상세

음식명/상태 → 섭취량 조절 → 핵심 영양표 → 누락 안내 → 출처/기준량/갱신일.

### 레시피 상세

검토 상태 → 핵심 정보 → 1인분 재료 → 조리 단계 → 영양과 완전성 → 알레르기/주의 → 출처.

### 플래너

주 이동 → 날짜별 식사 슬롯 → 하루 합계/부분 합계 → 목표 비교 → 장보기/인쇄. 모바일에서는 7열 표를 강제하지 않고 날짜별 아코디언/카드를 사용한다.

## 5. 콘텐츠 문체

- 짧고 존중하는 해요체를 사용한다.
- `안전한 음식` 대신 `입력한 목표와 비교`, `영양정보 확인`을 사용한다.
- `나쁜 음식` 대신 구체적인 영양값과 확인 사항을 말한다.
- 예: `칼륨 정보가 없어 목표와 비교할 수 없어요.`
- 예: `이 결과는 의료적 처방이 아니에요. 치료 상태와 검사 결과에 따라 달라질 수 있어요.`

## 6. 접근성 수용 기준

- 문서 언어 `ko`, 고유한 page title, landmark와 heading 순서
- 모든 기능 키보드 사용 가능, skip link와 명확한 focus ring
- 본문 대비 4.5:1, 큰 텍스트/비텍스트 UI 3:1
- 200% 확대와 320 CSS px reflow에서 기능 손실 없음
- 오류는 색 외에 텍스트로 연결하고 error summary에 focus 이동
- 동적 합계와 저장 결과는 적절한 live region으로 알리되 반복 공지를 피함
- 드래그가 필요하면 버튼 기반 대안 제공
- 인쇄에서도 출처, 누락, 의료 안내가 사라지지 않음

기준: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## 7. 이미지 정책

Phase 0/1은 라이선스가 불명확한 음식 사진을 넣지 않는다. 이후 이미지는 자체 제작, 명확한 상업/재배포 허용 라이선스, 또는 계약된 소스만 사용하고 저작자·라이선스·원본 URL을 자산 목록에 기록한다. 정보 전달에 필수인 이미지는 한국어 대체 텍스트를 제공한다.

