# RenalTable

신장 질환 환자와 보호자가 출처 있는 식사 정보를 확인하도록 돕는 한국어 서비스입니다. 의료적
처방을 제공하지 않으며, 확인되지 않은 영양 수치나 일반화된 식이 제한을 만들지 않습니다.

## 로컬 실행

Node.js 24 LTS와 npm 11을 사용합니다.

```sh
nvm use
npm ci
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. Phase 1에는 환경 변수나 외부 서비스 연결이
필요하지 않습니다.

## 품질 검사

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

E2E 테스트를 처음 실행할 때 Chromium을 설치합니다.

```sh
npm run test:e2e:install
npm run test:e2e
```

`npm run ci`는 비밀값 검사부터 빌드와 Chromium smoke E2E까지 순서대로 실행합니다.

## 데이터와 개인정보

건강 프로필과 식단표는 버전이 있는 브라우저 저장소에만 저장하도록 설계합니다. 서버, URL,
로그 또는 분석 도구로 보내지 않습니다. 공동으로 사용하는 기기에서는 설정이 보일 수 있으므로
전체 삭제 기능을 제공해야 합니다. 실제 환자 데이터와 비밀값은 저장소나 테스트에 넣지 마세요.
