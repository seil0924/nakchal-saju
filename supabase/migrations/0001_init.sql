-- 낙찰사주 초기 스키마 (Supabase / Postgres)
-- lib/store.ts 어댑터가 사용하는 테이블 정의 + RLS

-- 회원 프로필 (auth.users와 1:1)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now()
);

-- 리포트 (입력 원장 input을 서버가 보관 → 유료는 이걸로 재계산)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  input jsonb not null,               -- ReportInput (생일/시/달력/관계 입력)
  unlocked boolean not null default false,  -- ★결제 검증 후 서버(Service Role)만 true
  created_at timestamptz default now()
);

-- 결제 (포트원 payment_id 기준)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  payment_id text unique not null,    -- 포트원 결제 고유번호
  report_id uuid references reports(id) on delete cascade,
  amount int not null,                -- 서버가 확정한 금액(웹훅에서 재검증)
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- 발주처 설립일 사전 DB (공개정보 → 궁합의 해자)
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text, biz_no text, established_on date, day_el smallint
);

-- 예측 vs 실제 (자동 채점 · 공개 적중 기록)
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  bid_no text, predicted numeric(5,2), actual numeric(5,2),
  hit boolean, scored_at timestamptz
);

-- ── RLS ─────────────────────────────────────────────────
alter table profiles   enable row level security;
alter table reports    enable row level security;
alter table payments   enable row level security;

-- 본인 데이터만 열람. unlocked/status/amount는 클라이언트가 못 쓰게 하고
-- 오직 Service Role(서버)만 갱신 → RLS는 SELECT/INSERT만 열고 UPDATE는 막는다.
create policy "own profile"        on profiles for select using (auth.uid() = id);
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "own reports"        on reports  for select using (auth.uid() = user_id);
create policy "insert own reports" on reports  for insert with check (auth.uid() = user_id);

create policy "own payments"       on payments for select using (auth.uid() = user_id);

-- clients / predictions 는 공개 읽기 (적중 기록·발주처 정보)
alter table clients     enable row level security;
alter table predictions enable row level security;
create policy "public read clients"     on clients     for select using (true);
create policy "public read predictions" on predictions for select using (true);

-- 신규 가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name) values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
