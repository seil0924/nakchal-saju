# 출시 준비 가이드 (KCP 기준) — LAUNCH-READINESS

> ⚠️ **`DEPLOY.md`는 낡았습니다.** 그 문서는 PortOne + `PORTONE_*` 환경변수 + `/api/payment/webhook`
> 웹훅을 전제하지만, **실제 코드는 NHN KCP**를 쓰고 그 웹훅 라우트·시크릿은 존재하지 않습니다.
> 배포 시 이 문서를 기준으로 하세요. (`lib/kcp.ts`, `NEXT_PUBLIC_KCP_*`, `KCP_CERT_INFO` 기준)

---

## A. 환경변수 (Vercel Project Settings → Environment Variables)

### NEXT_PUBLIC_ — 클라이언트 노출됨(공개 안전)
| 변수 | 용도 | 없을 때 |
|------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL. 인증+DB 게이트 | **조용히 저하** → 인메모리 폴백(휘발성), 로그인 게이트 off |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저/SSR 인증용 anon 키 | 위와 동일 저하 |
| `NEXT_PUBLIC_KCP_SITE_CD` | KCP 사이트코드 | 없으면 결제 비활성, mock 재개 |
| `NEXT_PUBLIC_KCP_TEST` | `0`=운영 실결제 · 그 외=테스트 | 미설정 시 **테스트모드**(실결제 안 됨). 실서비스는 반드시 `0` |

### SERVER-ONLY — 비밀(절대 `NEXT_PUBLIC_` 금지)
| 변수 | 용도 | 없을 때 |
|------|------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | RLS 우회 서버 키. 언락/결제상태의 **유일한 기록자** | **조용히 인메모리 저하** — 돈 받고 언락 휘발 |
| `KCP_CERT_INFO` | KCP 서비스 인증서(PEM, 한 줄). `KCP_ENABLED` 결정 | 없으면 실결제 승인 불가 + 데모 우회 재개 |

> 🔴 **반쪽 설정 함정:** store는 URL+SERVICE_ROLE_KEY **둘 다** 있어야 Supabase를 쓴다.
> URL만 있고 SERVICE_ROLE_KEY가 없으면 → **로그인은 되는데 결제·리포트가 휘발성 메모리**에 저장돼
> 재시작 시 사라진다. Supabase 3종(URL·ANON·SERVICE_ROLE)은 **항상 함께** 설정할 것.

---

## B. Supabase 마이그레이션 (SQL Editor에서 순서대로 전부)
```
0001_init.sql → 0002_saved_charts.sql → 0003_auth_roles.sql →
0004_unlock_level.sql → 0005_entitlements.sql → 0006_payment_pass_key.sql
```
`unlock_level`·`pass_key`·`entitlements`는 `confirmOrder`/`hasEntitlement`가 쓴다.
**0001만 돌리면 언락·패스가 깨진다.** (DEPLOY.md는 0001만 안내 — 틀림)

---

## C. KCP 운영 설정
1. **사이트코드 확정** — `.env.example`=ALVVY, 인증서 파일명=ALTGP로 **불일치**.
   KCP 파트너관리자(partner.kcp.co.kr) → 사이트 관리에서 **실제 5자리** 확인 후 `NEXT_PUBLIC_KCP_SITE_CD`에.
2. `NEXT_PUBLIC_KCP_TEST=0` (실결제).
3. `KCP_CERT_INFO` = 인증서 PEM 한 줄(BEGIN~END 포함), Vercel server-only 변수로.
4. KCP 관리자에 **운영 리턴 URL** 화이트리스트 등록(도메인 강제 시). 코드는 `req.url` origin으로 생성 → Vercel https 정상.
5. ✅ 인증서는 git 히스토리에 없음 확인됨(로테이션 불필요). `.env.local`은 절대 커밋 금지.

---

## D. 출시 전 보안 필수 (2026-07-17 리뷰 기준)

### 🔴 CRITICAL — 주인없는 리포트 IDOR (`app/api/report/paid/route.ts:18`, `app/api/report/get`)
`if (owner && owner !== user.id)` 의 `owner &&` 단축 때문에 **owner=null 리포트**(비로그인 게스트가
`/api/report`로 생성)를 아무 로그인 유저가 유료 열람 가능. 운영(authEnabled) 모드에서만 발생.
**두 수정안 — 결제 흐름 테스트 후 택1:**
- **(A) 로그인 필수화(간단):** 리포트 생성/결제에 로그인 요구 → owner가 항상 존재. 그 뒤
  `if (owner !== user.id) return forbidden`(`owner &&` 제거). 전환율 ↓ 가능.
- **(B) 캡ability 토큰(게스트 유지):** `saveReport` 시 리포트별 랜덤 비밀토큰 발급→반환,
  `report/get`·`report/paid`가 그 토큰(또는 user_id 일치)을 요구. 게스트 흐름 유지, 코드 추가.
> ⚠️ 단순히 `owner &&`만 제거하면 **게스트 생성→로그인 후 열람** 흐름이 깨질 수 있어 실흐름 검증 필수.

### 🟠 HIGH — 레이트리밋 없음
`payment/*`·`auth/*`에 도배·brute-force 방어 없음. 런칭 전 IP/세션 제한(예: Upstash Redis +
`@upstash/ratelimit`, 429 반환) 권장. 특히 `report/get?id=` UUID 열거 방어(IDOR와 상승작용).

### ✅ 적용 완료 — 멱등 가드
`confirmOrder`가 이미 `paid`인 주문을 재처리 없이 반환(재생/중복 승인 방어). (`lib/store.ts`)

### 🟡 MEDIUM — /api 인증 단일 실패점
미들웨어가 `/api` 전체를 공개로 두어, 새 라우트가 `requireUser()`를 깜빡하면 무인증 노출.
특히 미래 `app/api/admin/**`는 미들웨어가 안 막으니 `isAdmin()` 필수. 공유 `withAuth/withAdmin` 래퍼 권장.

---

## E. 이미 잘 된 것 (안심)
- 가격 서버 상수 고정, KCP 승인금액 재검증, 다운그레이드 방지
- mock-confirm 운영 이중 차단(`NODE_ENV==='production'` + `KCP_ENABLED`)
- 관리자 서버단 강제(`app/admin/layout.tsx` `isAdmin()`), Supabase RLS
- 보안 헤더(HSTS·X-Frame·nosniff·Permissions-Policy), robots/sitemap 정상
- 인증서 git 유출 없음

---

## F. 출시 순서 요약
1. Supabase 프로젝트 생성 → 마이그레이션 0001~0006 전부
2. Vercel에 A절 환경변수 전부(3종 Supabase + 3종 KCP) — server-only 구분 준수
3. **D절 CRITICAL(IDOR) 수정 + 결제 흐름 테스트**
4. `NEXT_PUBLIC_KCP_TEST=0` + 소액 실결제→환불로 KCP 검증
5. (권장) 레이트리밋 추가 후 정식 오픈
