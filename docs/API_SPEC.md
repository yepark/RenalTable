# RenalTable API 명세 초안

- 상태: Phase 2 음식 목록·상세 로컬 계약 구현
- 형식: Next.js Route Handlers, JSON over HTTPS
- 원칙: 공개·검토 완료 데이터의 읽기 API를 우선한다.

## 1. 공통 규칙

- 사용자 메시지는 한국어로 반환한다.
- 날짜/시간은 ISO 8601 UTC, ID는 opaque UUID 문자열이다.
- 수치 필드는 숫자와 단위를 분리한다.
- 영양값 부재를 `0`으로 직렬화하지 않는다.
- 목록은 cursor pagination을 기본으로 하고 `limit` 최대값을 둔다.
- 공개 응답에 원본 payload, 내부 검토 메모, API 키를 포함하지 않는다.

### 영양값

```json
{
  "nutrientCode": "POTASSIUM",
  "amount": null,
  "unit": "mg",
  "basis": { "amount": 100, "unit": "g" },
  "status": "MISSING",
  "displayText": "정보 없음",
  "sourceId": "..."
}
```

`status`는 `PRESENT | TRACE | BELOW_LIMIT | MISSING | NOT_APPLICABLE`이다. `amount`는 `PRESENT`에서만 숫자다.

### 오류

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "섭취량을 확인해 주세요.",
    "fieldErrors": { "amount": ["0보다 큰 값을 입력해 주세요."] },
    "requestId": "..."
  }
}
```

오류 코드는 안정적으로 유지하고, 상세 stack/SQL/개인 입력값은 반환하거나 로그로 남기지 않는다.

## 2. 공개 조회 API

### `GET /api/foods`

Query: `q`, `category`, `cursor`, `limit`.

- 200: `items[]`, `nextCursor`, `total`(비용이 허용될 때만)
- 검색어는 길이 제한과 정규화를 적용한다.
- `PUBLISHED` 식품만 반환한다.

### `GET /api/foods/{id}`

- 식품, 카테고리, 기준량, 핵심 영양값, 출처와 데이터 날짜 반환
- 없는 ID는 404 `FOOD_NOT_FOUND`

현재 Phase 2 구현은 repository port와 빈 운영 adapter를 사용한다. 검토·게시 승인된 실제 데이터가
없으므로 운영 화면과 API는 빈 결과를 반환하며, 계약 테스트에서만 `TEST ONLY` fixture를 주입한다.
공개 DTO에는 `raw_payload`, 내부 게시 상태, import 오류와 승인자 정보를 포함하지 않는다.

### `GET /api/meals`

Query: `q`, `mealType`, `difficulty`, `maxMinutes`, `cursor`, `limit`.

- 모든 필수 검토가 유효한 `PUBLISHED` 레시피만 반환한다.
- “신장에 안전” 같은 필터는 제공하지 않는다.

### `GET /api/meals/{id}`

- 인분, 재료, 단계, 영양 완전성, 알레르기, 주의, 출처, 검토일 반환
- review 내부 메모나 검토자 개인정보는 반환하지 않는다.

### `GET /api/guide`

검토 완료 가이드 목록과 최종 검토일을 반환한다. 상세 경로는 콘텐츠 slug 기반 `/api/guide/{slug}`로 한다.

## 3. 결정적 계산 API

### `POST /api/nutrition/calculate`

서버 데이터 기준으로 사용자 지정 인분의 영양값을 재계산할 때만 사용한다.

입력:

```json
{
  "items": [{ "recipeId": "...", "servings": 1.5 }]
}
```

출력은 영양소별 `knownAmount`, `status(COMPLETE|PARTIAL|MISSING)`, 누락 항목, 계산 버전을 포함한다. 프로필이나 목표는 받지 않는다. 목표 비교는 브라우저의 순수 도메인 함수에서 수행해 건강정보 외부 전송을 피한다.

## 4. 서버에 만들지 않는 MVP API

- 프로필 CRUD
- 영양 목표 저장
- 식단표/장보기 목록 저장
- 사용자 인증
- AI 추천/설명 생성

## 5. 관리자·가져오기 경계

ETL과 게시 승인 기능은 공개 route handler로 노출하지 않는다. 초기에는 로컬/CI 수동 명령과 승인된 운영 절차로 실행하며, 인증·권한 모델이 준비되기 전 관리자 HTTP API를 만들지 않는다.

## 6. 보안과 캐시

- GET 공개 데이터만 짧은 public cache 허용; 계산 POST는 `no-store`.
- rate limit은 실제 트래픽과 플랫폼 기능을 확인해 적용한다.
- 모든 입력은 서버 경계에서 길이, enum, 범위, UUID 형식을 검증한다.
- CORS는 같은 origin을 기본으로 한다.
- CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, frame 제한을 적용한다.

## 7. OpenAPI

Phase 2 구현 시 이 문서를 기준으로 OpenAPI 3.1 파일을 생성하고 계약 테스트를 추가한다. 실제 구현과 불일치하면 코드만 고치지 말고 문서와 계약을 함께 변경한다.

