// lib/balju-facts.ts — 핵심 발주처별 확인된 사실(2026-10-27).
// 공고를 어디서 내는지, 본사가 어디인지, 주로 무엇을 발주하는지. 출처 URL 과 함께 lib/data/balju-facts.json 에 둔다.
// 확인 못 한 칸은 null 이다. 지어서 채우지 않는다.
// 이 세 칸이 다 찬 발주처만 사이트맵에 올린다. 템플릿 문장만으로는 이웃 페이지와 67% 가 겹쳐 얇은 페이지로 읽힌다.
import data from './data/balju-facts.json';

export type BaljuFacts = { hq: string | null; notice: string | null; noticeUrl: string | null; biz: string | null; src: string[] };

const FACTS = data as Record<string, BaljuFacts>;

export const factsOf = (name: string): BaljuFacts | null => FACTS[name] ?? null;

export function hasFullFacts(name: string): boolean {
  const f = FACTS[name];
  return !!(f && f.hq && f.notice && f.biz);
}

// 출처 표기용: 주소에서 도메인만
export const srcHost = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
