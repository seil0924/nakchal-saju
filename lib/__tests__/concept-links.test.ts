import { describe, it, expect } from 'vitest';
import { conceptsFor } from '../concept-links';
import { CONCEPTS } from '../seo-concepts';

describe('concept-links: conceptsFor', () => {
  it('네이버 유입 1위 키워드가 같은 이름의 개념 페이지로 간다', () => {
    // 8/17~8/23 네이버 검색 유입의 44.68% 가 '식신생재' 였다.
    const r = conceptsFor('식신생재 — 아이디어가 돈이 되는 구조', ['식신생재', '십성']);
    expect(r[0].slug).toBe('식신생재');
  });

  it('태그만 있어도 잡는다 — 제목이 은유일 때가 많다', () => {
    const r = conceptsFor('돈이 많아도 못 쥐는 사람', ['재다신약']);
    expect(r.map(c => c.slug)).toContain('재다신약');
  });

  it('띄어쓰기가 달라도 같은 개념으로 본다', () => {
    const r = conceptsFor('식신 생재 구조 읽기', ['식신생재']);
    expect(r[0].slug).toBe('식신생재');
  });

  it('맞는 개념이 없으면 빈 배열이다 — 억지 링크를 만들지 않는다', () => {
    expect(conceptsFor('낙찰 후 계약·검수·대금 회수 체크리스트', ['계약', '대금'])).toEqual([]);
    expect(conceptsFor('', [])).toEqual([]);
  });

  it('최대 개수를 넘기지 않는다', () => {
    const r = conceptsFor('갑목 을목 병화 정화 무토 일간 총정리', ['갑목', '을목', '병화', '정화', '무토']);
    expect(r.length).toBeLessThanOrEqual(3);
    expect(conceptsFor('갑목 을목 병화', ['갑목', '을목', '병화'], 2).length).toBe(2);
  });

  it('돌려주는 것은 실제 존재하는 개념 페이지다', () => {
    const slugs = new Set(CONCEPTS.map(c => c.slug));
    for (const c of conceptsFor('임수 일간과 수 기운', ['임수', '수 기운'])) {
      expect(slugs.has(c.slug)).toBe(true);
    }
  });
});
