# 자동 루프 런북 — 테스트 구축(Vitest)

## 목표
핵심 순수 로직에 단위 테스트를 구축하고 전부 통과(green)시킨다.

## 설정
- 패턴: sequential / 모드: safe
- 러너: Vitest 2 (+ @vitest/coverage-v8, jsdom)
- 멈추는 조건: `npm test` 전부 통과 + 핵심 모듈 커버리지 확보
- 스크립트: `npm test`, `npm run test:watch`, `npm run test:cov`
- 설정: vitest.config.ts (환경 node, jsdom은 파일별 지정)

## 테스트 전략
- 순환 검증(현재 출력 그대로 복사) 회피
- **독립 검증 가능한 사실**에 앵커링:
  - 천문학적 율리우스 적일 (jdn 2000-01-01 = 2451545)
  - 그레고리력 윤년 규칙 (1900 평년 / 2000 윤년)
  - 60갑자 (1984=甲子, 2024=甲辰)
  - 오행 상생상극 (水生木=인성, 木克土=재성 등)
  - 결정론/불변식 (분포 합, 범위 클램프, 재현성)

## 결과 (달성)
| 모듈 | 라인 커버리지 | 함수 | 비고 |
|------|--------------|------|------|
| manse-core.ts | 100% | 100% | 만세력 코어 |
| engine.ts | 93.75% | 100% | 명리 엔진 |
| scope.ts | 95% | 100% | 계정 격리 보안 |

- 테스트 파일 3개 / 총 47 테스트 전부 통과
- 전체 커버리지 7.6%는 report-copy.ts(1079줄)·tycoon.ts 등
  정적 텍스트/데이터 파일 미테스트 때문 (로직 아님)

## 2차 확장 — 로그인·결제 로직 + CI
| 모듈 | 라인 커버리지 | 검증 내용 |
|------|--------------|-----------|
| store.ts | 45% (보안경로 100%) | 금액 위변조 거부·다운그레이드 방지·패스 권한 |
| middleware.ts | isPublicPath 100% | 로그인 게이트 판정 |
| seal.ts | 100% | 인장 SVG 렌더 |
| report-categories.ts | 높음 | 가격·부호매핑·UI스키마 |
- store.ts 미커버 구간 = Supabase DB 분기(라이브 DB 필요, 자격증명 없음)
- server-only/client-only 를 vitest 에서 빈 모듈로 alias (test-stubs/empty.ts)
- CI: .github/workflows/ci.yml (push/PR → test + build + golden)
- 앱 부팅 확인: npm run dev → HTTP 200 (데모 모드)

## 진행 로그
- [x] Vitest + coverage + jsdom 설치
- [x] manse-core(17) engine(26) scope(4) 테스트
- [x] store/payment(8) middleware(4) seal(6) report-categories(7) 테스트
- [x] 총 72 테스트 green
- [x] CI 워크플로 추가
- [x] 앱 부팅 검증 (dev 서버 200)
- [ ] GitHub 푸시 — 원격 저장소 + 인증 필요 (사용자 선택 대기)

## 커밋
- 43c8b0d baseline / f1e4ea4 build-green runbook
- 800a36f 엔진·만세력·스코프 테스트 (47)
- 42a7598 결제·인증 테스트 + CI (72)

## 3차 확장 — 커버리지 대폭 확대 (135 테스트)
전체 라인 커버리지 14% → **92%** (함수 91%, 분기 75%).
| 배치 | 모듈 | 누적 |
|------|------|------|
| 1 | preview(engine 교차검증)·tycoon·constants·clients·categories·pains·bizinfo | 104 |
| 2 | people·vault 저장소·kcp 게이트웨이(fetch 목) | 120 |
| 3 | report(computeReport 오케스트레이터)·admin-data·migrateLegacy | 135 |
- report-copy.ts(1079줄)도 computeReport 경유로 94% 커버
- 남은 저커버(store 45%·middleware 41%·admin-data 51%)=Supabase 라이브 DB 분기(자격증명 필요)
- **커버리지 게이트 추가**: vitest thresholds(stmts/lines/funcs 88%, branches 70%),
  CI 를 `npm run test:cov` 로 전환 → 회귀 시 자동 차단
- CI green 확인 (Node 20)

## 알려진 한계 (자격증명 필요·불가)
- 실제 KCP 결제창 end-to-end / Supabase 라이브 DB 경로
- golden 회귀는 날짜 의존이라 CI 제외 (로컬 도구)
