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

## 진행 로그
- [x] Vitest + coverage + jsdom 설치
- [x] vitest.config.ts + package.json 스크립트
- [x] manse-core 테스트 (17)
- [x] engine 테스트 (26)
- [x] scope 격리 테스트 (4)
- [x] 47 테스트 green, 핵심 모듈 89~100% 커버
- [ ] (선택) report.ts/tycoon.ts 등 확장

## 남은 확장 후보 (원하면)
- report.ts: computeReport — 이미 scripts/golden.mjs 스냅샷 검증 존재
- tycoon.ts(512줄), pains.ts, categories.ts — 데이터/규칙 로직
