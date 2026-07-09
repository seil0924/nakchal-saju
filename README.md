# 낙찰사주 — Next.js MVP (서버 게이팅)

프로토타입(단일 HTML 엔진)을 **실서비스 구조**로 옮긴 최소 실행본입니다. 핵심은 **유료 콘텐츠를 클라이언트에서 계산하지 않는 것** — 소수점 사정률과 잠금 섹션 텍스트는 오직 서버에서, 결제가 검증된 요청에만 생성해 내려보냅니다.

## 실행

```bash
npm install
npm run build     # 프로덕션 빌드 (타입체크 포함)
npm start         # http://localhost:3000
# 또는 개발모드
npm run dev
```

## 무엇이 검증되었나

`npm run build` 통과 + 런타임 게이팅 스모크 테스트 통과:

1. `POST /api/report` → 무료 리포트. 12섹션 중 무료 2개만 텍스트 포함, **유료 10개 텍스트·정밀값은 응답에 없음**.
2. `GET /api/report/paid?id=…` (결제 전) → **402 payment_required**.
3. `POST /api/payment/prepare` → 서버가 금액(990원) 확정.
4. `POST /api/payment/mock-confirm` → (데모) 결제 완료 시뮬. 실서비스는 포트원 웹훅이 대신.
5. `GET /api/report/paid?id=…` (결제 후) → **200**, 유료 10섹션 + 소수점 99.37% 공개.

## 구조

```
lib/engine.ts       만세력·십성·사정률·음력변환 (server-only). sajeong()이 밴드(무료)/정밀값(유료) 분리
lib/report-copy.ts  섹션 카피 + buildReport (server-only). 무료 티어는 유료 섹션 html 제거
lib/report.ts       입력 → 섹션 리포트. computeReport(input, unlocked)
lib/store.ts        데모 인메모리 스토어 (★실서비스: Supabase로 교체)
lib/portone.ts      포트원 V2 결제 검증 래퍼 (참고)
app/api/report            무료 리포트 + reportId 발급
app/api/report/paid       ★유료 — 결제 검증(isUnlocked) 후에만 200
app/api/payment/prepare   결제 사전등록 (서버가 금액 확정)
app/api/payment/mock-confirm  데모 결제 확정
app/api/payment/webhook   실서비스 포트원 웹훅 (참고 구현)
app/page.tsx        홈 폼 + 리포트 뷰 + 결제 모달
```

`lib/engine.ts`·`report-copy.ts`는 `import 'server-only'`로 잠겨, 클라이언트가 실수로 import하면 빌드가 깨집니다 — 유료 로직 유출을 컴파일 단계에서 차단.

## 데모 → 실서비스 전환 체크리스트

- **스토어**: `lib/store.ts`(인메모리)를 Supabase로 교체. 인메모리는 단일 프로세스에서만 유지되므로 서버리스 다중 인스턴스에는 부적합. 스키마는 아키텍처 문서 3절 참고.
- **인증**: `/api/report/paid`에 `requireUser()`(Supabase 카카오 로그인)를 추가해 소유권까지 확인.
- **결제**: `mock-confirm` 제거 → 프론트에서 포트원 브라우저 SDK로 결제창 호출, `/api/payment/webhook`에서 `verifyPaid()`로 금액·상태 **재검증** 후 `confirmOrder`.
- **환경변수**: `SUPABASE_SERVICE_ROLE_KEY`, `PORTONE_API_SECRET` 등은 절대 `NEXT_PUBLIC_` 접두사 금지.
- **유료 티저**: 지금은 잠긴 섹션에 텍스트를 아예 안 보냅니다(가장 안전). 블러 티저를 원하면 서버가 섹션별 1줄 요약만 별도 필드로 내려주면 됩니다(정밀값·본문은 계속 withhold).

## 면책

재미로 보는 명리 기반 참고 정보입니다. 실제 투찰금액 산정의 근거로 사용할 수 없습니다.
