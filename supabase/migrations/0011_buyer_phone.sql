-- 0011_buyer_phone.sql (2026-10-23)
--
-- 로그인 대신 휴대폰 번호로 산 것을 묶는다(창업레이더와 같은 방식). 결제하기로 한 순간에만 받는다.
--   buyer_name · buyer_phone : 결제 확인·문의 응대용. 거래기록과 같이 5년 보관 뒤 지운다(lib/buyer purge)
--   buyer_key                : 이름+번호를 서버 비밀값으로 섞은 해시. '산 리포트 찾기'·패스 확인에 쓴다
alter table if exists public.payments add column if not exists buyer_name text;
alter table if exists public.payments add column if not exists buyer_phone text;
alter table if exists public.payments add column if not exists buyer_key text;
create index if not exists payments_buyer_key_idx on public.payments (buyer_key);

-- '산 리포트 찾기' 남용 막기: 같은 곳에서 한 시간 10번. 접속 주소는 해시로만, 한 시간 지나면 지운다.
create table if not exists public.report_find_log (
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists report_find_log_idx on public.report_find_log (ip_hash, created_at);
alter table public.report_find_log enable row level security;
