-- 0008_payment_fail_reason.sql
--
-- 결제가 승인까지 못 가면 지금까지 행이 'pending' 으로만 남았다. 실패 경로가 상태를
-- 바꾸는 코드가 한 줄도 없었기 때문이다. 그래서 관리자 화면에서 이 넷을 구분할 수 없었다.
--   · 결제창을 열자마자 닫음
--   · 카드 인증 실패·취소
--   · 인증은 됐는데 승인 거절
--   · 승인은 났는데 우리 저장이 실패   ← 손님 돈은 나갔는데 리포트를 못 받은 경우
--
-- 마지막 것만 구분하면 되는데, 그러려면 사유를 어딘가 적어 둬야 한다.
alter table if exists public.payments
  add column if not exists fail_reason text;

comment on column public.payments.fail_reason is
  '승인까지 가지 못한 사유. auth:* 인증실패 · approve:* 승인거절 · amount:* 금액불일치 · confirm:* 승인 후 저장실패(주의) · abandoned 사용자 이탈';

