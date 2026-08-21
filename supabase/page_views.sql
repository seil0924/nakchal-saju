-- supabase/page_views.sql
-- 익명 조회 계측. 개인 식별 정보는 저장하지 않는다 — 무엇을 봤는지와 언제만 남긴다.
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 한 번 실행하면 된다.

create table if not exists public.page_views (
  id         bigint generated always as identity primary key,
  kind       text        not null,   -- 'home' | 'reading' | 'ceo' | 'column' | 'balju'
  slug       text,                   -- 칼럼 슬러그, 발주처 슬러그 등 (없으면 null)
  created_at timestamptz not null default now()
);

create index if not exists page_views_kind_time_idx on public.page_views (kind, created_at desc);
create index if not exists page_views_slug_idx      on public.page_views (slug);
create index if not exists page_views_time_idx      on public.page_views (created_at desc);

-- 서비스 롤로만 읽고 쓴다. 브라우저에서 직접 접근할 일이 없으므로 정책을 열지 않는다.
alter table public.page_views enable row level security;
