-- supabase/reviews.sql
-- 이용 후기. Supabase → SQL Editor 에 붙여넣고 한 번 실행하면 /review 가 살아난다.
--
-- **승인제인 이유.** 공개 폼은 반드시 광고·욕설이 들어온다. 기본값을 숨김으로 두고
-- 관리자가 /admin/reviews 에서 하나씩 올린다. 승인 전 글은 아무에게도 안 보인다.
--
-- **개인정보를 안 받는다.** 닉네임과 업종만이고 이메일·전화·회사명 칸이 없다.
-- 후기를 받자고 연락처를 모으기 시작하면 그때부터 파기 의무가 생긴다.
create table if not exists public.reviews (
  id         bigint generated always as identity primary key,
  nickname   text        not null,           -- 표시 이름(예: 대전 K대표)
  biz        text,                           -- 업종(선택) — 전기공사·건설 등
  rating     smallint    not null check (rating between 1 and 5),
  body       text        not null,
  approved   boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_pub_idx on public.reviews (approved, created_at desc);

-- 서비스 롤로만 읽고 쓴다. 브라우저에서 직접 접근할 일이 없으므로 정책을 열지 않는다.
alter table public.reviews enable row level security;
