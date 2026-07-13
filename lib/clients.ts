// lib/clients.ts — 발주처 사전 DB (공개정보 · 설립일)
// ⚠️ 설립일은 위키백과/기관 연혁 기준. KEPCO·가스공사는 연·월만 공식 확인돼
//    통용되는 일자를 넣음 → 실서비스 전 공식 연혁으로 재검증 필요.
//    실서비스에서는 이 목록을 Supabase clients 테이블로 옮겨 계속 확장.
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
