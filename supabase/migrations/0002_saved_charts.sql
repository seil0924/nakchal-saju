-- 계정별 저장: 저장된 사주/대상 (대표·법인·발주처·동업·협정)
create table if not exists saved_charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  kind text not null,                 -- self | legal | client | partner | ally
  name text,
  birth_date date not null,
  birth_time time,
  calendar text default 'solar',
  is_leap boolean default false,
  created_at timestamptz default now()
);
alter table saved_charts enable row level security;
create policy "own charts select" on saved_charts for select using (auth.uid() = user_id);
create policy "own charts insert" on saved_charts for insert with check (auth.uid() = user_id);
create policy "own charts delete" on saved_charts for delete using (auth.uid() = user_id);

-- 보관함: reports 테이블에 라벨 추가(리포트 기록 목록 표시용)
alter table reports add column if not exists label text;
alter table reports add column if not exists day_key date default current_date;
