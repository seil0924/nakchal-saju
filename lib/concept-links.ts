// lib/concept-links.ts — 칼럼에서 개념 페이지(/saju/*)로 가는 다리.
//
// **왜 필요했나.** /saju/* 18장은 사이트맵에 있고 검색으로는 사람이 들어오는데,
// 사이트 안에서 그리로 가는 링크가 /glossary 한 곳뿐이었다(STATUS '남은 것' 참조).
// 네이버에서 "식신생재"를 검색해 온 사람이 착지한 뒤 갈 데가 없고,
// 크롤러도 그 18장을 고아로 본다. 칼럼 126편이 걸어 주면 둘 다 풀린다.
//
// 매칭은 제목+태그를 공백 제거해 개념 키워드가 들어 있는지로만 본다.
// 본문까지 뒤지지 않는 이유: 한 번 스친 낱말로 링크가 걸리면 관련 없는 다리가 생긴다.
import { CONCEPTS, type Concept } from './seo-concepts';

const squeeze = (s: string) => s.replace(/\s+/g, '').toLowerCase();

/**
 * 칼럼 제목·태그에 맞는 개념 페이지를 점수순으로 고른다.
 * 점수 = 들어맞은 키워드 수. 동점이면 CONCEPTS 선언 순서를 따른다(십성이 뒤라 우연에 안 맡긴다).
 */
export function conceptsFor(title: string, tags: string[] = [], max = 3): Concept[] {
  const hay = squeeze([title, ...tags].join(' '));
  if (!hay) return [];

  const scored = CONCEPTS.map((c, i) => {
    // label 에서 한자 괄호를 떼어 낸 맨 이름도 후보에 넣는다 —
    // 칼럼 태그는 '갑목'처럼 짧게 다는데 키워드에는 '갑목 일간'만 있어 안 걸렸다.
    // '목(木)' 같은 한 글자는 length 검사에서 걸러진다(아무 데나 붙으면 안 되는 낱말이다).
    const bare = c.label.replace(/[(（][^)）]*[)）]/g, '');
    const words = [c.label, bare, ...c.keywords].map(squeeze).filter((w) => w.length >= 2);
    let hit = 0;
    for (const w of new Set(words)) if (hay.includes(w)) hit += 1;
    return { c, hit, i };
  }).filter((x) => x.hit > 0);

  scored.sort((a, b) => (b.hit - a.hit) || (a.i - b.i));
  return scored.slice(0, max).map((x) => x.c);
}
