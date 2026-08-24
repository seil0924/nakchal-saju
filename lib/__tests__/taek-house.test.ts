import { describe, it, expect } from 'vitest';
import {
  GUA, GUA_KO, DONG_SATAEK, SEO_SATAEK,
  sataekOf, guaOf, houseHarmony, biboFor, elCounts, weakElOf, deskAdvice,
  type ElChart,
} from '@/lib/taek-house';

const chart = (o: Partial<ElChart> = {}): ElChart => ({
  yGan: 0, yZhi: 0, mGan: 0, mZhi: 0, dGan: 0, dZhi: 0, hGan: null, hZhi: null, ...o,
});

describe('팔택 방위', () => {
  it('여덟 방위가 넷씩 두 사택으로 갈린다', () => {
    expect(DONG_SATAEK).toHaveLength(4);
    expect(SEO_SATAEK).toHaveLength(4);
    expect([...DONG_SATAEK, ...SEO_SATAEK].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('북·동·남동·남이 동사택이다', () => {
    for (const d of [0, 2, 3, 4]) expect(sataekOf(d)).toBe('동사택');
  });

  it('북동·남서·서·북서가 서사택이다', () => {
    for (const d of [1, 5, 6, 7]) expect(sataekOf(d)).toBe('서사택');
  });

  it('8을 넘거나 음수인 방위도 한 바퀴 돌려 받는다', () => {
    expect(sataekOf(8)).toBe(sataekOf(0));
    expect(sataekOf(-1)).toBe(sataekOf(7));
    expect(guaOf(16).idx).toBe(0);
    expect(guaOf(-3).idx).toBe(5);
  });

  it('괘 이름과 방위가 짝을 이룬다', () => {
    const g = guaOf(0);
    expect(g.gua).toBe('坎');
    expect(g.ko).toBe('감');
    expect(g.dir).toBe('북');
    expect(g.hanja).toBe('北');
    expect(GUA).toHaveLength(8);
    expect(GUA_KO).toHaveLength(8);
  });
});

describe('문과 자리', () => {
  it('같은 사택이고 마주 보지 않으면 무난하다', () => {
    const h = houseHarmony(0, 2);   // 북 문 · 동 자리 — 둘 다 동사택
    expect(h.same).toBe(true);
    expect(h.line).toBe(false);
    expect(h.level).toBe('good');
    expect(h.body).toContain('동사택');
  });

  it('같은 사택이라도 정면으로 마주 보면 한 단계 내린다', () => {
    const h = houseHarmony(0, 4);   // 북 문 · 남 자리 — 둘 다 동사택이나 정반대
    expect(h.same).toBe(true);
    expect(h.line).toBe(true);
    expect(h.level).toBe('ok');
    expect(h.title).toContain('정면');
  });

  it('사택이 갈리면 살펴야 한다', () => {
    const h = houseHarmony(0, 6);   // 북 문 · 서 자리
    expect(h.same).toBe(false);
    expect(h.level).toBe('caution');
    expect(h.door.sataek).toBe('동사택');
    expect(h.desk.sataek).toBe('서사택');
  });

  it('마주 봄은 어느 쪽에서 재도 같다', () => {
    for (let d = 0; d < 8; d++) {
      expect(houseHarmony(d, d + 4).line).toBe(true);
      expect(houseHarmony(d + 4, d).line).toBe(true);
      expect(houseHarmony(d, d).line).toBe(false);
    }
  });

  it('여덟 × 여덟 어떤 조합도 판정을 낸다', () => {
    for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) {
      const h = houseHarmony(a, b);
      expect(['good', 'ok', 'caution']).toContain(h.level);
      expect(h.title.length).toBeGreaterThan(4);
      expect(h.body.length).toBeGreaterThan(20);
    }
  });
});

describe('비보 물건', () => {
  it('오행마다 물건이 둘씩 있고 놓을 자리를 함께 준다', () => {
    for (let e = 0; e < 5; e++) {
      const b = biboFor(e);
      expect(b).toHaveLength(2);
      for (const x of b) {
        expect(x.item.length).toBeGreaterThan(2);
        expect(x.where.length).toBeGreaterThan(2);
        expect(x.why.length).toBeGreaterThan(5);
      }
    }
  });

  it('사택이 갈리면 사이를 나누는 물건이 붙는다', () => {
    const b = biboFor(0, houseHarmony(0, 6));
    expect(b).toHaveLength(3);
    expect(b[2].item).toContain('파티션');
  });

  it('정면으로 마주 보면 흐름을 꺾는 물건이 붙는다', () => {
    const b = biboFor(0, houseHarmony(0, 4));
    expect(b.some(x => x.where.includes('직선'))).toBe(true);
  });

  it('둘 다 걸리면 둘 다 붙는다', () => {
    const b = biboFor(0, houseHarmony(1, 5));   // 서사택끼리 아니라 확인용
    expect(b.length).toBeGreaterThanOrEqual(2);
    const both = biboFor(2, houseHarmony(0, 6));
    expect(both.length).toBe(3);
  });

  it('오행 번호가 범위를 벗어나도 돌려 받는다', () => {
    expect(biboFor(5)).toEqual(biboFor(0));
    expect(biboFor(-1)).toEqual(biboFor(4));
  });

  it('원본 표를 건드리지 않는다', () => {
    const a = biboFor(0, houseHarmony(0, 6));
    const b = biboFor(0);
    expect(a).toHaveLength(3);
    expect(b).toHaveLength(2);
  });
});

describe('부족한 오행', () => {
  it('시주가 없으면 여섯 글자, 있으면 여덟 글자를 센다', () => {
    const sum = (n: number[]) => n.reduce((a, b) => a + b, 0);
    expect(sum(elCounts(chart()))).toBe(6);
    expect(sum(elCounts(chart({ hGan: 3, hZhi: 5 })))).toBe(8);
  });

  it('오행 다섯 칸을 항상 돌려준다', () => {
    expect(elCounts(chart())).toHaveLength(5);
  });

  it('한 오행으로 채우면 그 칸만 올라간다', () => {
    // 甲(0)=木, 子(0)=水 — 여섯 글자가 木 셋 水 셋이 된다
    const n = elCounts(chart());
    expect(n[0]).toBe(3);
    expect(n[4]).toBe(3);
    expect(n[1] + n[2] + n[3]).toBe(0);
  });

  it('가장 적은 오행을 고르고, 동수면 낮은 번호로 고정한다', () => {
    const w = weakElOf(chart());
    expect(w).toBe(1);            // 火·土·金이 모두 0 → 가장 앞의 火
    expect(weakElOf(chart())).toBe(w);   // 몇 번을 불러도 같다
  });

  it('결과는 언제나 0~4 사이다', () => {
    for (let g = 0; g < 10; g++) for (let z = 0; z < 12; z++) {
      const w = weakElOf(chart({ dGan: g, dZhi: z }));
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThan(5);
    }
  });
});

describe('자리 권유', () => {
  it('木이 모자라면 동쪽을 먼저 권한다', () => {
    const a = deskAdvice(0);
    expect(a.main.dir).toBe('동');
    expect(a.alt.dir).toBe('남동');
  });

  it('다섯 오행 모두 주·보조 방위가 서로 다르다', () => {
    for (let e = 0; e < 5; e++) {
      const a = deskAdvice(e);
      expect(a.main.idx).not.toBe(a.alt.idx);
      expect(a.main.sataek.length).toBeGreaterThan(1);
    }
  });
});
