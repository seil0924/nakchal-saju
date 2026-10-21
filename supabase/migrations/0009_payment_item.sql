-- 0009_payment_item.sql
--
-- 결제 행에 무엇을 샀는지 적는다(2026-10-21). 지금까지는 관리자 화면이 금액으로 상품을 짐작했는데,
-- 가격을 전부 990원으로 내리면서 금액만으로는 상품을 가를 수 없게 됐다.
-- 이 컬럼이 없어도 결제는 된다(createOrder 가 없으면 빼고 다시 넣는다).
alter table if exists public.payments
  add column if not exists item text;

comment on column public.payments.item is '결제한 상품 이름(서버가 정함). 예: 투찰 택일 사주, 발주처 프리미엄 패스, 복채';
