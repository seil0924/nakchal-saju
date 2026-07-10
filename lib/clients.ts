// lib/clients.ts — 발주처 사전 DB (공개정보 · 설립일)
// ⚠️ 설립일은 위키백과/기관 연혁 기준. KEPCO·가스공사는 연·월만 공식 확인돼
//    통용되는 일자를 넣음 → 실서비스 전 공식 연혁으로 재검증 필요.
//    실서비스에서는 이 목록을 Supabase clients 테이블로 옮겨 계속 확장.
export type Client = { name: string; date: string; cat: string };

export const CLIENTS: Client[] = [
  { name: '한국도로공사',        date: '1969-02-15', cat: '도로·건설' },
  { name: '한국수자원공사(K-water)', date: '1967-11-16', cat: '수자원·토목' },
  { name: '한국토지주택공사(LH)', date: '2009-10-01', cat: '주택·토지' },
  { name: '조달청',              date: '1961-10-02', cat: '조달·구매' },
  { name: '한국철도공사(코레일)', date: '2005-01-01', cat: '철도·시설' },
  { name: '인천국제공항공사',     date: '1999-02-01', cat: '공항·건설' },
  { name: '한국전력공사(KEPCO)',  date: '1982-01-01', cat: '전력·설비' },
  { name: '한국가스공사',        date: '1983-08-18', cat: '가스·플랜트' },
];
