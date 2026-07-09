# 배포 가이드 — 낙찰사주

로컬/데모는 키 없이 그냥 돌아갑니다(`npm run dev`). 아래는 **실서비스로 올리는** 순서입니다. 순서대로 하면 Supabase(카카오 로그인) + 포트원 결제 + Vercel 배포가 연결됩니다.

## 0. 준비물

GitHub 계정, Vercel 계정, Supabase 계정, 포트원(PortOne) 계정. 전부 무료로 시작 가능합니다.

## 1. GitHub 올리기

```bash
git init && git add -A && git commit -m "init: 낙찰사주 MVP"
git branch -M main
git remote add origin https://github.com/<본인>/nakchal-saju.git
git push -u origin main
```

## 2. Supabase (DB + 카카오 로그인)

1. supabase.com에서 새 프로젝트 생성 → **Project URL**, **anon key**, **service_role key** 확보.
2. SQL Editor에 `supabase/migrations/0001_init.sql` 붙여넣고 실행(테이블 + RLS 생성).
3. **카카오 로그인**: [카카오 개발자](https://developers.kakao.com)에서 앱 생성 → REST API 키 발급 → Supabase Dashboard → Authentication → Providers → **Kakao** 켜고 키 입력. Redirect URL은 `https://<your-app>.vercel.app/auth/callback` (로컬은 `http://localhost:3000/auth/callback`)로 등록.

## 3. 포트원 (결제)

1. [포트원](https://portone.io) 가입 → **Store ID** 확보, 관리자콘솔에서 **채널** 생성(카카오페이·토스·카드) → **Channel Key** 확보.
2. **API Secret** 발급(단건조회·검증용, 서버 전용).
3. **웹훅** 등록: `https://<your-app>.vercel.app/api/payment/webhook` → 웹훅 시크릿 확보.

## 4. Vercel 배포

1. vercel.com → New Project → 방금 올린 GitHub 저장소 Import (Next.js 자동 인식).
2. **Environment Variables**에 `.env.example`의 값들을 채워 넣기:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_PORTONE_STORE_ID`, `NEXT_PUBLIC_PORTONE_CHANNEL_KEY`, `PORTONE_API_SECRET`, `PORTONE_WEBHOOK_SECRET`
   - (선택) `DATA_GO_KR_KEY`
   - ⚠️ `SERVICE_ROLE_KEY`·`API_SECRET`·`WEBHOOK_SECRET`은 절대 `NEXT_PUBLIC_` 접두사 금지.
3. Deploy. `vercel.json`의 크론이 매일 09:00 자동 채점을 돌립니다.

## 5. 동작 방식 (환경변수에 따라 자동 전환)

| 환경변수 | 없을 때 (로컬/데모) | 있을 때 (실서비스) |
|---|---|---|
| Supabase | 인메모리 스토어 | Postgres + RLS |
| 포트원 | mock-confirm로 결제 시뮬 | 실제 결제창 + 웹훅 재검증 |
| 카카오 | 로그인 없이 익명 | 카카오 OAuth |

즉 이 저장소는 키를 채우기 전에도 `npm run dev`로 완전히 돌아가고, 키를 채우면 그대로 실서비스가 됩니다. 코드 수정 없이 환경변수만으로 전환됩니다.

## 6. 실서비스 전 마지막 점검

- `/api/report/paid`에 `requireUser()`(`lib/supabase/server.ts`)를 넣어 **본인 리포트만** 열람하도록 소유권 확인 추가.
- 웹훅 서명 검증(`PORTONE_WEBHOOK_SECRET`)을 `/api/payment/webhook`에 실제 구현.
- 무료 티어 잠금 섹션에 블러 티저를 원하면, 서버가 섹션별 1줄 요약만 별도 필드로 내려주기(본문·정밀값은 계속 withhold).
