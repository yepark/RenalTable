# 개인정보 및 보안 정책

- 상태: Phase 0 위협 모델
- 원칙: 건강정보 최소 수집, 로컬 우선, 비밀값 서버 한정

## 1. 데이터 분류

| 등급 | 예 | MVP 저장 위치 |
| --- | --- | --- |
| 공개 | 게시 식품, 레시피, 가이드, 출처 | 서버 DB/CDN |
| 사용자 기기 민감 | 투석 방식, 영양 목표, 알레르기, 제외 재료, 식단 | 브라우저 저장소 |
| 운영 비밀 | DB URL, 공공 API 키, 배포 토큰 | 서버/CI secret store |
| 금지 | 이름·연락처와 결합된 실제 환자 기록, 검사 결과 | 수집하지 않음 |

브라우저 저장은 서버 미수집이지만 기기 공동 사용, 브라우저 동기화/백업, XSS 위험이 있다. UI에서 `이 기기를 함께 사용하면 설정이 보일 수 있어요`와 전체 삭제 기능을 제공한다.

## 2. 위협과 통제

| 위협 | 통제 |
| --- | --- |
| XSS로 local data 탈취 | React escaping, HTML 직접 삽입 금지, strict CSP, 의존성 최소화, 입력 길이 제한 |
| API 키 노출 | server-only env, `NEXT_PUBLIC_` 금지, 로그 redaction, secret scanning |
| SQL injection | parameterized query/Drizzle, 허용된 sort field만 매핑 |
| 대량 scraping/DoS | pagination cap, payload limit, cache, 관찰 후 rate limit |
| 공급망 공격 | lockfile, Dependabot/Renovate 검토, `npm audit` 보조 신호, GitHub Actions SHA pinning 검토 |
| 잘못된 데이터 게시 | immutable raw, validation report, reviewer approval, transactional publish/rollback |
| 민감정보 로깅 | profile/targets/query payload 로깅 금지, request ID와 오류 코드만 저장 |
| 오래된 의료 콘텐츠 | reviewed/expires 상태와 공개 차단, 출처 변경 점검 |

## 3. 브라우저 저장 정책

- 명시적인 사용자 동작으로 저장하며 저장 목적과 범위를 먼저 알린다.
- 키에 schema version을 포함하고 migration 실패 시 원본을 덮어쓰지 않는다.
- 전체 삭제와 식단만 삭제를 제공한다.
- URL query, fragment, cookie, service worker cache에 건강 프로필을 넣지 않는다.
- localStorage와 IndexedDB 중 선택은 데이터 크기와 transaction 필요를 Phase 1에서 비교한다. 민감도는 어느 쪽도 암호화 저장으로 오해하지 않는다.

클라이언트 자체 암호화는 키를 같은 브라우저에 보관하면 XSS 방어가 되지 않으므로 MVP 보안 주장으로 사용하지 않는다.

## 4. HTTP/애플리케이션 통제

- HTTPS only, HSTS(프로덕션), CSP nonce/hash 기반
- `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`
- 엄격한 `Referrer-Policy`, 필요한 최소 `Permissions-Policy`
- same-site first-party 요청, 공개 API의 불필요한 CORS 금지
- state-changing 관리 기능에는 인증, 권한, CSRF 방어가 준비되기 전 HTTP endpoint를 만들지 않음
- 오류 화면에 stack, DB 식별자, secret, 원본 payload를 노출하지 않음

## 5. 의존성과 CI

- 최소 지원 Node LTS와 lockfile을 고정한다.
- PR에서 lint, typecheck, test, build, secret scan을 실행한다.
- GitHub Actions는 최소 `contents: read` 권한에서 시작하고 배포 workflow를 분리한다.
- fork PR에 production secrets를 제공하지 않는다.
- 외부 스크립트, 분석, 폰트는 기본적으로 넣지 않는다.

## 6. 개인정보·분석

MVP에는 광고·행동 추적·세션 재생을 넣지 않는다. 분석 도구가 필요해지면 별도 결정과 동의/고지 검토를 거치며 투석 상태, 알레르기, 검색어, 식단, 영양 목표를 이벤트 속성으로 보내지 않는다.

한국 개인정보 보호 법률의 구체적 적용 여부와 고지 문구는 공개 전 법률/개인정보 전문가 확인이 필요하다. 이 문서는 법률 자문이 아니다.

## 7. 사고 대응 초안

1. 영향 기능/데이터 게시 중지
2. secret 폐기·회전, 취약 버전 차단
3. 로그와 배포 이력으로 범위 확인(민감 payload 추가 수집 금지)
4. 데이터/콘텐츠 rollback
5. 사용자 고지 및 법적 신고 필요성 전문가 판단
6. 원인, 시간선, 재발 방지, 테스트를 기록

## 8. 배포 전 체크

- threat model 재검토
- 보안 헤더 실측
- dependency/secret scan
- API 입력 fuzz/boundary test
- local data 삭제/마이그레이션 검증
- 로그와 오류 추적 payload 검사
- 운영 계정 MFA, 최소 권한, 백업/복구 확인
- 개인정보 처리방침 및 연락 채널 사람 승인

