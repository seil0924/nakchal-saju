-- 0004_unlock_level.sql — 2단 언락(택일팩/전체) 지원
-- 언락 레벨: 0 무료 · 1 택일팩(정밀 사정률 + 이번 달 택일) · 2 전체 리포트
alter table reports  add column if not exists unlock_level smallint not null default 0;
alter table payments add column if not exists level        smallint not null default 2;

-- 기존 unlocked=true 데이터를 전체(2)로 이관 (하위호환)
update reports set unlock_level = 2 where unlocked = true and unlock_level = 0;

-- 서버(Service Role)만 갱신. 클라이언트는 select만(기존 RLS 유지).
