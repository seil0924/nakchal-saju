-- Only counters are stored. No questions, answers, birth details or tokens.
create table if not exists public.report_question_usage (
  day date not null,
  scope text not null,
  requests integer not null default 0 check (requests >= 0),
  primary key (day, scope)
);
alter table public.report_question_usage enable row level security;
revoke all on public.report_question_usage from anon, authenticated;
grant all on public.report_question_usage to service_role;

create or replace function public.reserve_report_question(p_report_id text)
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare
  today_kst date := (now() at time zone 'Asia/Seoul')::date;
  report_scope text := 'report:' || p_report_id;
  used_report integer;
  used_global integer;
begin
  if p_report_id is null or length(p_report_id) > 80 then raise exception 'invalid_report'; end if;
  -- Serialize this short counter transaction, including simultaneous server instances.
  perform pg_advisory_xact_lock(91212026);
  delete from public.report_question_usage where day < today_kst - 1;
  insert into public.report_question_usage(day, scope) values (today_kst, report_scope), (today_kst, 'global') on conflict do nothing;
  select requests into used_report from public.report_question_usage where day = today_kst and scope = report_scope;
  select requests into used_global from public.report_question_usage where day = today_kst and scope = 'global';
  if used_report >= 20 or used_global >= 1000 then return -1; end if;
  update public.report_question_usage set requests = requests + 1 where day = today_kst and scope in (report_scope, 'global');
  return 20 - used_report - 1;
end;
$$;
revoke all on function public.reserve_report_question(text) from public, anon, authenticated;
grant execute on function public.reserve_report_question(text) to service_role;
