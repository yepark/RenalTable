# 공공 식품영양 데이터와 의료 콘텐츠 출처

- 조사 기준일: 2026-11-01
- 상태: Phase 0 조사; 실제 API 호출·다운로드·서비스 연결은 수행하지 않음

## 1. 식품 데이터 우선 출처

### 식품의약품안전처 식품영양성분 DB OpenAPI

- 제공: 식품의약품안전처, 공공데이터포털
- 형식: REST, JSON/XML
- 인증: 공공데이터포털 활용신청 후 서비스 키
- 비용/허용: 무료, 페이지 표기상 이용허락범위 제한 없음
- 트래픽: 개발계정 10,000; 운영 트래픽 증가는 활용사례 등록/신청 및 심의 필요
- 갱신 표기: 포털 메타데이터상 실시간
- 주요 필드: 식품명/분류/코드, 영양 기준량, 열량·단백질 등 영양값, 출처, 1회 섭취 참고량, 중량, 제조/원산지, 생성 방법·일자·기준일자

출처: [식약처 식품영양성분DB정보 OpenAPI](https://www.data.go.kr/data/15127578/openapi.do)

주의: 포털의 “실시간”은 내부 데이터 생성 주기와 같은 의미로 단정하지 않는다. 상세 출력 명세, 실제 필드의 칼륨·인 포함률, null 표현, 페이지 제한, 운영 승인 조건은 Phase 2에서 발급된 개발 키와 참고 문서로 검증해야 한다.

### 전국통합식품영양성분정보표준데이터

표준 데이터 설명에는 원재료, 가공식품, 음식과 함께 열량, 수분, 단백질, 인, 칼륨, 나트륨 등 필드가 명시되어 있다. 식약처, 농촌진흥청, 국립수산과학원 자료를 통합하므로 MVP의 우선 정규화 입력 후보로 삼는다.

출처: [전국통합식품영양성분정보표준데이터](https://www.data.go.kr/data/15100064/standard.do)

### K-FIND 식품영양성분 데이터베이스

K-FIND는 전체/영양성분별 DB 다운로드와 공공 API 안내를 제공하고, 데이터 자료원(PFDB, KDDB, KFCT, KCTMP 등)을 구분한다. 2026년에도 업데이트 공지가 게시되어 있으므로 API와 bulk snapshot을 교차 검증하는 기준으로 사용한다.

출처:

- [K-FIND](https://various.foodsafetykorea.go.kr/nutrient/)
- [DB 다운로드 안내](https://various.foodsafetykorea.go.kr/nutrient/general/down/list.do)

### 농촌진흥청 국가표준식품성분표

통합 데이터의 농·축산 원재료 계보 확인용 보조 출처다. 정확한 다운로드 이용조건, 버전, 식품코드 매핑은 Phase 2에서 공식 페이지와 배포 파일을 다시 확인한다. 독립 소스를 무조건 합치지 않고 출처별 레코드를 유지한다.

## 2. 의료 콘텐츠 출처 우선순위

1. 국내 적용성: 대한신장학회 진료지침 및 전문가 감수 환자 교육 자료
2. 국제 근거: KDIGO 최신 CKD guideline과 update 공지
3. 영양 전문: KDOQI Nutrition in CKD guideline
4. 환자 설명 보조: 정부/학회가 발행하고 전문가 검토가 확인된 자료

확인한 출처:

- [KDIGO 2024 CKD Guideline](https://kdigo.org/guidelines/ckd-evaluation-and-management/)
- [KDIGO 2024 focused update 공지](https://kdigo.org/kdigo-announces-update-to-2024-ckd-guideline/)
- [KDOQI Nutrition in CKD 2020 안내](https://www.kidney.org/press-room/national-kidney-foundation-academy-nutrition-and-dietetics-release-kdoqi-clinical)
- [대한신장학회 환자 교육 영상](https://ksn.or.kr/general/vod/ckd.php)
- [대한신장학회 일반인 교육 자료](https://m.ksn.or.kr/general/ebook/)

KDIGO 2024에 focused update가 진행 중이므로 2024 문서를 영구적인 최신값으로 표현하지 않는다. 공개 직전 update 상태와 국내 적용성을 다시 검토한다.

## 3. 데이터 프로파일링 필수 항목

실제 운영 반영 전 다음을 배치별 보고서로 만든다.

- 총 행, 고유 외부 ID, 중복 ID, 이름 중복
- 식품 유형/자료원/조리 상태별 분포
- 기준량 단위 분포와 100 g 환산 가능률
- 열량·단백질·나트륨·칼륨·인 각각의 present/null/0/trace 비율
- 음수, 비현실적 범위, 단위 불일치, 파싱 실패
- 생성일/기준일 누락과 오래된 데이터
- 같은 외부 ID의 값 변경과 삭제/퇴역 여부

칼륨·인은 표준 스키마에 존재하지만 모든 레코드에 값이 있다는 뜻이 아니다. 실제 완전성 보고서 없이는 “제공됨”을 “사용 가능함”으로 간주하지 않는다.

## 4. 중복 처리

자동 병합 키 하나로 해결하지 않는다.

1. 동일 출처 + 외부 ID + revision은 동일 원본 레코드로 본다.
2. 이름, 제조사, 품목보고번호, 조리 상태, 기준량, 원산지로 중복 후보를 만든다.
3. 정확 일치는 자동 연결할 수 있으나 값 충돌은 사람 검토 큐로 보낸다.
4. 다른 자료원의 같은 이름은 계보를 보존한 채 별도 관측으로 유지한다.
5. 병합/분리 결정, 결정자 역할, 시점, 이유를 기록한다.

## 5. ETL 설계

```text
Extract
  API 또는 공식 bulk 파일을 수동 승인 후 가져오기
  응답/파일의 SHA-256, 헤더, 조회 시각 저장
    ↓
Raw
  원본 불변 snapshot + import log
    ↓
Validate
  schema, row count, required keys, units, ranges, duplicate profile
    ↓
Normalize
  source-specific adapter → canonical food/nutrient staging rows
    ↓
Review
  거부 레코드, 변경 diff, 중복 후보, 완전성 보고서 사람 승인
    ↓
Publish
  transaction으로 versioned tables 반영, provenance 연결, cache 재검증
```

ETL은 idempotent해야 하며 같은 snapshot+normalizer version을 재실행해 같은 staging 결과를 만들어야 한다. 검증 실패 시 기존 게시 데이터를 유지한다.

## 6. 라이선스와 표시

- 출처마다 publisher, dataset title, URL, license, retrieval date를 저장한다.
- “이용허락범위 제한 없음” 표기는 Phase 2에서 포털 약관과 attribution 요구를 함께 확인한다.
- 원본의 재배포가 허용되지 않으면 파생 데이터와 필요한 출처 메타데이터만 저장하는 방안을 검토한다.
- 사용자 화면에는 데이터 출처, 기준량, 생성/갱신 시점을 표시한다.
- 음식 사진은 영양 데이터 라이선스와 별개로 관리한다.

## 7. 확인 필요

- OpenAPI 실제 응답의 인/칼륨 필드명, null/trace 표현, 최대 page size
- 개발 10,000의 시간 단위와 운영 심의 절차
- bulk 파일의 직접 재배포/가공 표시 요건
- 각 자료원 간 식품코드 안정성과 삭제 레코드 처리
- 공식 조리 수율·영양 보존율 자료 사용 가능성
- 원본 snapshot의 허용 보존 기간과 접근 통제

