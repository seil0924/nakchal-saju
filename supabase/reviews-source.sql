-- supabase/reviews-source.sql
-- 관리자가 직접 입력하는 후기용. Supabase → SQL Editor 에서 한 번 실행.
--
-- source: 이 후기를 어디서 받았는지(전화·카톡·문자·방문·이메일).
--   폼으로 직접 들어온 건 null 이다. 관리자가 옮겨 적은 건 어디서 받았는지가 남아야
--   나중에 "이 후기 어디서 났냐"는 질문에 답할 수 있다. 공개 화면에는 안 나온다.
alter table public.reviews add column if not exists source text;
