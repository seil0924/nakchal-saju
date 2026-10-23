-- 0010_payment_tno_keep.sql (2026-10-23)
--
-- 1) KCP 거래번호(tno)를 남긴다. 환불·취소·대사 때 KCP 관리자에서 손으로 찾지 않게.
alter table if exists public.payments
  add column if not exists tno text;

-- 2) 리포트를 지워도 결제 기록은 남긴다. 예전엔 payments.report_id 가 ON DELETE CASCADE 라
--    대시보드에서 리포트를 지우면 결제 기록까지 사라졌다(전자상거래법 거래기록 5년 보관).
alter table if exists public.payments
  drop constraint if exists payments_report_id_fkey;
alter table if exists public.payments
  add constraint payments_report_id_fkey foreign key (report_id) references public.reports(id) on delete set null;
