-- 0007_report_access_token.sql
-- IDOR 방어: 비회원(owner=null) 리포트를 reportId(UUID)만 알면 아무 로그인 유저나
-- 열람하던 문제를 막기 위해, 리포트마다 별도의 접근 토큰을 둔다.
-- 접근 규칙(서버): 소유자(user_id 일치) 또는 access_token 일치(?t=)만 허용.
--
-- 순서 안전: 이 컬럼이 없어도 앱은 기존 동작으로 폴백하므로(토큰 null → 종전 허용),
-- 코드 배포가 이 마이그레이션보다 먼저여도 깨지지 않는다. 적용 시 보호가 활성화된다.

alter table if exists public.reports
  add column if not exists access_token text;

-- 기존 리포트 백필: 토큰을 자신의 id로 설정.
-- 레거시 링크(?t 없음)는 클라이언트가 t=id로 폴백해 열리므로 기존 이용자 접근이 끊기지 않는다.
-- (레거시는 종전과 동일한 "id=베어러" 수준. 신규 리포트는 아래 default로 랜덤 토큰이 부여돼 보호됨.)
update public.reports
  set access_token = id::text
  where access_token is null;

-- 신규 행 기본값: 랜덤 토큰(앱이 명시적으로 넣지 못한 경우의 안전망).
alter table if exists public.reports
  alter column access_token set default gen_random_uuid()::text;
