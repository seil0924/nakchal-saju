-- 관리자 역할 + 소셜 로그인 자동 프로필 생성
alter table profiles add column if not exists role  text not null default 'user';
alter table profiles add column if not exists email text;
alter table profiles add column if not exists provider text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='profiles_role_chk') then
    alter table profiles add constraint profiles_role_chk check (role in ('user','admin'));
  end if;
end $$;

-- auth.users 생성 시 profiles 자동 생성 (소셜 로그인 포함)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nickname'),
    new.email,
    coalesce(new.raw_app_meta_data->>'provider', new.raw_user_meta_data->>'provider')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 관리자 판별 (security definer → RLS 재귀 방지)
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- 관리자는 전 회원·결제·리포트 조회 가능 (대시보드)
drop policy if exists "admin read profiles" on profiles;
drop policy if exists "admin read payments" on payments;
drop policy if exists "admin read reports"  on reports;
create policy "admin read profiles" on profiles for select using (public.is_admin());
create policy "admin read payments" on payments for select using (public.is_admin());
create policy "admin read reports"  on reports  for select using (public.is_admin());
