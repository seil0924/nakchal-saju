// lib/clients.ts — 발주처 사전 DB (공개정보 · 설립일)
// ⚠️ 설립일은 위키백과/기관 연혁 기준. KEPCO·가스공사는 연·월만 공식 확인돼
//    통용되는 일자를 넣음 → 실서비스 전 공식 연혁으로 재검증 필요.
//    실서비스에서는 이 목록을 Supabase clients 테이블로 옮겨 계속 확장.
//    ⚠️ 2001-04-02(발전 6사 분할) 등은 통용 일자 — 각 기관 공식 연혁으로 최종 확인 요망.
// core:true = 핵심 발주처(큰 판) → 궁합 유료. core 미지정 = 일반 발주처 → 궁합 무료.
export type Client = { name: string; date: string; cat: string; core?: boolean };

export const CLIENTS: Client[] = [
  // ── 핵심 발주처 (유료 · 封) — 낙찰 한 건이 수억~수십억 오가는 큰 판 ──
  { name: '한국도로공사',        date: '1969-02-15', cat: '도로·건설', core: true },
  { name: '한국수자원공사(K-water)', date: '1967-11-16', cat: '수자원·토목', core: true },
  { name: '한국토지주택공사(LH)', date: '2009-10-01', cat: '주택·토지', core: true },
  { name: '조달청',              date: '1961-10-02', cat: '조달·구매', core: true },
  { name: '한국철도공사(코레일)', date: '2005-01-01', cat: '철도·시설', core: true },
  { name: '국가철도공단',        date: '2004-01-01', cat: '철도·건설', core: true },
  { name: '인천국제공항공사',     date: '1999-02-01', cat: '공항·건설', core: true },
  { name: '한국전력공사(KEPCO)',  date: '1982-01-01', cat: '전력·설비', core: true },
  { name: '한국가스공사',        date: '1983-08-18', cat: '가스·플랜트', core: true },
  { name: '한국수력원자력(한수원)', date: '2001-04-02', cat: '원자력·발전', core: true },
  { name: '한국남동발전',        date: '2001-04-02', cat: '전력·발전', core: true },
  { name: '한국중부발전',        date: '2001-04-02', cat: '전력·발전', core: true },
  { name: '한국서부발전',        date: '2001-04-02', cat: '전력·발전', core: true },
  { name: '한국남부발전',        date: '2001-04-02', cat: '전력·발전', core: true },
  { name: '한국동서발전',        date: '2001-04-02', cat: '전력·발전', core: true },
  { name: '한국공항공사(KAC)',   date: '2002-03-02', cat: '공항·건설', core: true },
  { name: '한국석유공사',        date: '1979-03-03', cat: '자원·플랜트', core: true },
  { name: '한국지역난방공사',    date: '1985-11-01', cat: '에너지·설비', core: true },
  { name: '방위사업청',          date: '2006-01-02', cat: '국방·조달', core: true },
  { name: '한국조폐공사',        date: '1951-10-01', cat: '제조·조달', core: true },
  { name: '우정사업본부',        date: '2000-07-01', cat: '우정·물류', core: true },
  { name: '대한무역투자진흥공사(KOTRA)', date: '1962-06-21', cat: '무역·진흥', core: true },
  { name: '한국관광공사',        date: '1962-06-26', cat: '관광·진흥', core: true },
  { name: '서울교통공사',        date: '2017-05-31', cat: '도시철도', core: true },
  { name: '부산교통공사',        date: '2006-01-01', cat: '도시철도', core: true },
  { name: '부산항만공사',        date: '2004-01-16', cat: '항만·건설', core: true },
  { name: '인천항만공사',        date: '2005-07-11', cat: '항만·건설', core: true },
  { name: '서울주택도시공사(SH)', date: '1989-02-27', cat: '주택·도시', core: true },
  { name: '경기주택도시공사(GH)', date: '1997-08-01', cat: '주택·도시', core: true },
  { name: '국민건강보험공단',    date: '2000-07-01', cat: '공공·복지', core: true },
  { name: '국민연금공단',        date: '1987-09-18', cat: '공공·기금', core: true },
  { name: '근로복지공단',        date: '1995-05-01', cat: '공공·복지', core: true },
  { name: '한국농수산식품유통공사(aT)', date: '1967-01-01', cat: '농식품·유통', core: true },
  { name: '수도권매립지관리공사(SL)', date: '2000-07-18', cat: '환경·설비', core: true },
  // ── 일반 발주처 (무료) — 지자체·중견기관 ──
  { name: '서울특별시',          date: '1946-08-15', cat: '지자체·관급' },
  { name: '경기도',              date: '1896-08-04', cat: '지자체·관급' },
  { name: '부산광역시',          date: '1963-01-01', cat: '지자체·관급' },
  { name: '인천광역시',          date: '1981-07-01', cat: '지자체·관급' },
  { name: '대구광역시',          date: '1981-07-01', cat: '지자체·관급' },
  { name: '한국농어촌공사',      date: '2000-01-01', cat: '농촌·토목' },
  { name: '한국환경공단',        date: '2010-01-01', cat: '환경·설비' },
  { name: '한국국토정보공사(LX)', date: '1977-07-01', cat: '측량·정보' },
];
export const isCoreClient = (name?: string | null) => !!CLIENTS.find(c => c.name === name)?.core;
