-- 0006_payment_pass_key.sql — 패스(엔타이틀먼트) 결제 지원
-- 발주처 프리미엄 패스처럼 리포트가 아닌 "계정 권한"을 사는 주문은
-- report_id(uuid) 대신 pass_key(text)에 'pass:balju:<user_id>' 를 저장한다.
alter table payments add column if not exists pass_key text;
