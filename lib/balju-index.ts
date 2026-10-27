// lib/balju-index.ts — 핵심 발주처 상세 중 사이트맵에 올릴 곳을 가른다(2026-10-27).
//
// 발주처 상세는 분야 템플릿 위에 기관별 사실·계산값을 얹은 글이라, 같은 분야 기관끼리 문장이 많이 겹친다.
// 페이지마다 '가장 비슷한 다른 페이지와 겹치는 정도'(낱말 세 개 묶음 기준 Jaccard)를 재서, 기준 아래인 곳만 올린다.
// 기준 0.65 는 2026-10-27 실측에서 고른 값이다: 64곳 평균 0.60, 발전 5사 0.78~0.79(같은 설립일·같은 분야),
// 0.65 아래 42곳. 얇은 중복은 구글이 사이트 단위로 보므로, 애매하면 빼는 쪽으로 둔다.
// 기관별 사실(lib/data/balju-facts.json)이 세 칸 다 차지 않은 곳은 겹침과 무관하게 뺀다.
import { CLIENTS, type Client } from './clients';
import { baljuContent } from './balju-content';
import { ilganTable, ilganSummary, neighbors } from './balju-ilgan';
import { factsOf, hasFullFacts } from './balju-facts';

export const BALJU_SIM_MAX = 0.65;

function pageText(c: Client): string {
  const f = factsOf(c.name);
  const ct = baljuContent(c, f);
  return [f?.notice ?? '', f?.hq ?? '', f?.biz ?? '', ct.intro, ct.bid, ...ct.prep, ct.founding, ilganSummary(c),
    ...ilganTable(c).map(r => `${r.ilgan} ${r.desc} ${r.rank}위`), ...neighbors(c, 12).map(x => x.name), ...ct.faqs.flat()].join(' ');
}
const grams = (s: string) => {
  const w = s.replace(/\s+/g, ' ').split(' '); const g = new Set<string>();
  for (let i = 0; i + 3 <= w.length; i++) g.add(w.slice(i, i + 3).join(' '));
  return g;
};

let CACHE: Map<string, number> | null = null;
// 핵심 발주처마다 가장 비슷한 이웃과의 겹침(0~1)
export function baljuMaxSim(): Map<string, number> {
  if (CACHE) return CACHE;
  const core = CLIENTS.filter(c => c.core);
  const G = core.map(c => grams(pageText(c)));
  CACHE = new Map(core.map((c, i) => {
    let best = 0;
    G.forEach((g, j) => {
      if (i === j) return;
      let inter = 0; G[i].forEach(x => { if (g.has(x)) inter++; });
      best = Math.max(best, inter / (G[i].size + g.size - inter));
    });
    return [c.name, best];
  }));
  return CACHE;
}

export function indexableBalju(): Client[] {
  const sim = baljuMaxSim();
  return CLIENTS.filter(c => c.core && hasFullFacts(c.name) && (sim.get(c.name) ?? 1) < BALJU_SIM_MAX);
}
