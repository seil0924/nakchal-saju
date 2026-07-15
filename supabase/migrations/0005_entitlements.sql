-- 0005_entitlements.sql — 사용자 단위 권한(패스). 예: 'pass:balju:<user_id>'
-- 발주처 프리미엄 패스처럼 "한 번 결제로 전부 열기"를 리포트가 아니라 계정에 건다.
create table if not exists entitlements (
  key        text primary key,
  granted_at timestamptz not null default now()
);
-- 서버(Service Role)만 갱신. 클라이언트 접근 불필요(서버에서만 조회).
alter table entitlements enable row level security;
