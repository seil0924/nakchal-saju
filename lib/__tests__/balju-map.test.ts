import { describe, it, expect } from 'vitest';
import {
  sipsungOf, jiModifier, fitOf, rankBalju, splitForMap, dominantOh, SIP_META,
} from '@/lib/balju-map';
import { CLIENTS, type Client } from '@/lib/clients';

// 천간: 0갑 1을 2병 3정 4무 5기 6경 7신 8임 9계
// 오행: 갑을=목 병정=화 무기=토 경신=금 임계=수
describe('sipsungOf', () => {
  it('같은 오행이면 음양에 따라 비견/겁재', () => {
    expect(sipsungOf(0, 0)).toBe('비견');
    expect(sipsungOf(0, 1)).toBe('겁재');
  });
  it('내가 생하는 오행이면 식신/상관', () => {
    expect(sipsungOf(0, 2)).toBe('식신');
    expect(sipsungOf(0, 3)).toBe('상관');
  });
  it('내가 극하는 오행이면 편재/정재', () => {
    expect(sipsungOf(0, 4)).toBe('편재');
    expect(sipsungOf(0, 5)).toBe('정재');
  });
  it('나를 극하는 오행이면 편관/정관', () => {
    expect(sipsungOf(0, 6)).toBe('편관');
    expect(sipsungOf(0, 7)).toBe('정관');
  });
  it('나를 생하는 오행이면 편인/정인', () => {
    expect(sipsungOf(0, 8)).toBe('편인');
    expect(sipsungOf(0, 9)).toBe('정인');
  });
  it('10천간 전 조합에서 십성 10종이 빠짐없이 나온다', () => {
    const seen = new Set<string>();
    for (let me = 0; me < 10; me++) for (let td = 0; td < 10; td++) seen.add(sipsungOf(me, td));
    expect(seen.size).toBe(10);
    expect(Object.keys(SIP_META).sort()).toEqual([...seen].sort());
  });
});

describe('SIP_META 점수표', () => {
  it('정인이 가장 높고 편관이 가장 낮다', () => {
    const v = Object.values(SIP_META).map(m => m.base);
    expect(Math.max(...v)).toBe(SIP_META.정인.base);
    expect(Math.min(...v)).toBe(SIP_META.편관.base);
  });
  it('상위권이 죄다 만점처럼 보이지 않게 상한을 눌러 둔다', () => {
    // 최고 기본점 + 최대 가산(삼합 7 + 핵심 2)이 90을 넘으면 다시 광고처럼 읽힌다.
    expect(SIP_META.정인.base + 7 + 2).toBeLessThanOrEqual(90);
  });
  it('십성 열 개의 기본점이 서로 겹치지 않는다', () => {
    const v = Object.values(SIP_META).map(m => m.base);
    expect(new Set(v).size).toBe(10);
  });
});

describe('jiModifier', () => {
  it('여섯 칸 떨어지면 충', () => {
    expect(jiModifier(0, 6).name).toBe('충(沖)');
    expect(jiModifier(0, 6).delta).toBeLessThan(0);
  });
  it('네 칸·여덟 칸이면 삼합', () => {
    expect(jiModifier(0, 4).name).toBe('삼합');
    expect(jiModifier(0, 8).name).toBe('삼합');
    expect(jiModifier(0, 4).delta).toBeGreaterThan(0);
  });
  it('합이 12로 떨어지면 육합', () => {
    expect(jiModifier(1, 0).name).toBe('육합');
    expect(jiModifier(2, 11).name).toBe('육합');
  });
  it('세 칸·아홉 칸이면 형', () => {
    expect(jiModifier(0, 3).name).toBe('형(刑)');
    expect(jiModifier(0, 9).name).toBe('형(刑)');
  });
  it('아무 관계 없으면 가감이 없다', () => {
    expect(jiModifier(0, 5).delta).toBe(0);
    expect(jiModifier(0, 5).name).toBe('');
  });
  it('순서를 바꿔도 충은 충이다', () => {
    expect(jiModifier(6, 0).name).toBe('충(沖)');
  });
});

const C = (name: string, date: string, core = false): Client =>
  ({ name, date, cat: '테스트', ...(core ? { core: true } : {}) });

describe('fitOf', () => {
  it('설립연도로 년주 간지와 오행을 뽑는다', () => {
    const f = fitOf({ gan: 4, ji: 6 }, C('테스트공사', '1984-01-01'));
    expect(f.year).toBe(1984);
    expect(f.ganji).toBe('甲子');
    expect(f.oh).toBe(0);
  });
  it('핵심 발주처는 같은 조건에서 점수가 조금 더 높다', () => {
    const a = fitOf({ gan: 0, ji: 0 }, C('일반', '1990-01-01'));
    const b = fitOf({ gan: 0, ji: 0 }, C('핵심', '1990-01-01', true));
    expect(b.score).toBe(a.score + 2);
  });
  it('점수는 20~92 범위를 벗어나지 않는다', () => {
    for (let g = 0; g < 10; g++) {
      for (let j = 0; j < 12; j++) {
        for (const c of CLIENTS) {
          const f = fitOf({ gan: g, ji: j }, c);
          expect(f.score).toBeGreaterThanOrEqual(20);
          expect(f.score).toBeLessThanOrEqual(92);
        }
      }
    }
  });
  it('입찰 언어 라벨과 설명이 항상 붙는다', () => {
    const f = fitOf({ gan: 4, ji: 6 }, CLIENTS[0]);
    expect(f.label.length).toBeGreaterThan(0);
    expect(f.desc.length).toBeGreaterThan(0);
    expect(f.slug.length).toBeGreaterThan(0);
  });
});

describe('rankBalju', () => {
  const me = { gan: 4, ji: 6 };
  it('발주처를 하나도 빠뜨리지 않는다', () => {
    expect(rankBalju(me)).toHaveLength(CLIENTS.length);
  });
  it('궁합 높은 순으로 정렬한다', () => {
    const r = rankBalju(me);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].score).toBeGreaterThanOrEqual(r[i].score);
  });
  it('같은 입력이면 순서가 항상 같다 (새로고침마다 순위가 바뀌면 안 된다)', () => {
    expect(rankBalju(me).map(x => x.name)).toEqual(rankBalju(me).map(x => x.name));
  });
  it('일간이 다르면 1위도 달라진다', () => {
    const a = rankBalju({ gan: 0, ji: 0 })[0];
    const b = rankBalju({ gan: 5, ji: 6 })[0];
    expect(a.sip === b.sip && a.name === b.name).toBe(false);
  });
  it('어느 일간에서도 상위 20곳이 한 점수로 뭉치지 않는다', () => {
    for (let g = 0; g < 10; g++) {
      const top = rankBalju({ gan: g, ji: 6 }).slice(0, 20);
      const spread = top[0].score - top[19].score;
      expect(spread, `일간 ${g}`).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('splitForMap', () => {
  const ranked = rankBalju({ gan: 4, ji: 6 });
  it('상위 20곳을 5곳 잠김 + 15곳 공개로 가른다', () => {
    const { locked, free, top } = splitForMap(ranked);
    expect(top).toHaveLength(20);
    expect(locked).toHaveLength(5);
    expect(free).toHaveLength(15);
  });
  it('잠기는 쪽이 항상 더 높은 점수다 (가장 좋은 곳을 잠근다)', () => {
    const { locked, free } = splitForMap(ranked);
    expect(Math.min(...locked.map(x => x.score))).toBeGreaterThanOrEqual(Math.max(...free.map(x => x.score)));
  });
  it('개수를 바꿔도 합이 맞는다', () => {
    const { locked, free, top } = splitForMap(ranked, 12, 3);
    expect(top).toHaveLength(12);
    expect(locked).toHaveLength(3);
    expect(free).toHaveLength(9);
  });
});

describe('dominantOh', () => {
  it('상위권이 한 오행으로 몰리면 알려준다', () => {
    const top = splitForMap(rankBalju({ gan: 4, ji: 6 })).top;
    const d = dominantOh(top);
    if (d) {
      expect(d.count).toBeGreaterThanOrEqual(Math.ceil(top.length / 2));
      expect(d.oh).toBeGreaterThanOrEqual(0);
      expect(d.oh).toBeLessThan(5);
    }
  });
  it('비어 있으면 null', () => {
    expect(dominantOh([])).toBeNull();
  });
});
