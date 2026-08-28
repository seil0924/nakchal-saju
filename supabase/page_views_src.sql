-- supabase/page_views_src.sql
-- 유입원 한 낱말을 page_views 에 더한다. Supabase → SQL Editor 에 붙여넣고 한 번 실행.
--
-- 'naver' | 'google' | 'daum' | 'kakao' | 'instagram' | 'threads'
-- | 'facebook' | 'youtube' | 'bing' | 'pwa' | 'direct' | 'other'
--
-- 전체 URL 이 아니라 낱말만 남긴다 — 검색어·경로가 붙으면 그건 개인정보다.
-- 이 표는 IP·UA·쿠키를 남기지 않기로 한 표이고, 그 원칙은 그대로다.
alter table public.page_views add column if not exists src text;

create index if not exists page_views_src_time_idx on public.page_views (src, created_at desc);
