import { describe, it, expect } from 'vitest';
import { judgeJaeda, judgeJesal, siksinVerdict, verdictFor, PATTERN_LABEL, type Pattern } from '@/lib/sipsung';
import { type Chart8 } from '@/lib/siksin';

// 천간 0~9 = 갑을병정무기경신임계 · 지지 0~11 = 자축인묘진사오미신유술해
const ch = (o: Partial<Chart8> = {}): Chart8 => ({
  yGan: 0, yZhi: 0, mGan: 0, mZhi: 0, dGan: 0, dZhi: 0, hGan: null, hZhi: null, ...o,
});

describe('재다신약', () => {
  // 갑목 일간에 토(무·기·진·축)가 재성이다. 재가 넘치고 일간을 받칠 것이 없다.
  const HEAVY = ch({ yGan: 4, yZhi: 4, mGan: 4, mZhi: 4, dGan: 0, dZhi: 4, hGan: 4, hZhi: 4 });

  it('재성이 넘치고 일간이 얇으면 해당한다', () => {
    const r = judgeJaeda(HEAVY);
    expect(r.level).toBe('clear');
    expect(r.tone).toBe('warn');
    expect(r.strength.strong).toBe(false);
    expect(r.headline).toContain('재다신약');
  });

  it('재가 많아도 일간이 버티면 재다신약이 아니라고 말한다', () => {
    // 비겁·인성이 받치는 자리
    const r = judgeJaeda(ch({ yGan: 0, yZhi: 2, mGan: 8, mZhi: 2, dGan: 0, dZhi: 3, hGan: 4, hZhi: 4 }));
    expect(r.strength.strong).toBe(true);
    expect(['weak', 'none']).toContain(r.level);
    expect(r.tone).toBe('good');
  });

  it('재성이 없으면 아예 해당하지 않는다', () => {
    const r = judgeJaeda(ch({ yGan: 0, yZhi: 2, mGan: 2, mZhi: 6, dGan: 0, dZhi: 3 }));
    expect(r.level).toBe('none');
    expect(r.notes.join(' ')).toContain('재성이 없습니다');
  });

  it('무거울 때는 사람과 자격을 처방으로 내놓는다', () => {
    const n = judgeJaeda(HEAVY).notes.join(' ');
    expect(n).toContain('비겁');
    expect(n).toContain('자격');
  });

  it('태어난 달이 재성이면 그 사실을 짚는다', () => {
    expect(judgeJaeda(HEAVY).notes.join(' ')).toContain('태어난 달이 재성');
  });

  it('칩 묶음은 재성·비겁·인성 셋이다', () => {
    expect(judgeJaeda(HEAVY).groups.map(g => g.title)).toEqual(['재성', '비겁', '인성']);
  });
});

describe('식신제살', () => {
  // 갑목 일간에 경금이 편관, 병화가 식신. 월간 경 · 년간 병으로 이웃해 둔다.
  const OK = ch({ yGan: 2, yZhi: 2, mGan: 6, mZhi: 2, dGan: 0, dZhi: 3, hGan: 2, hZhi: 5 });

  it('편관과 식신이 붙어 있으면 구조가 선다', () => {
    const r = judgeJesal(OK);
    expect(r.groups[0].list.length).toBeGreaterThan(0);   // 편관
    expect(r.groups[1].list.length).toBeGreaterThan(0);   // 식신
    expect(['clear', 'yes']).toContain(r.level);
    expect(r.tone).toBe('good');
  });

  it('편관이 없으면 볼 자리가 아니라고 말한다', () => {
    const r = judgeJesal(ch({ yGan: 2, yZhi: 2, mGan: 2, mZhi: 6, dGan: 0, dZhi: 3 }));
    expect(r.level).toBe('none');
    expect(r.notes.join(' ')).toContain('편관(칠살)이 없습니다');
  });

  it('편관만 있고 식신이 없으면 다른 길을 일러 준다', () => {
    const r = judgeJesal(ch({ yGan: 6, yZhi: 8, mGan: 6, mZhi: 8, dGan: 0, dZhi: 8 }));
    expect(r.level).toBe('none');
    expect(r.tone).toBe('warn');
    expect(r.body).toContain('돌려 푸는');
  });

  it('상관뿐이면 부딪힘이 크다고 알려 준다', () => {
    const r = judgeJesal(ch({ yGan: 3, yZhi: 5, mGan: 6, mZhi: 8, dGan: 0, dZhi: 8 }));
    expect(r.notes.join(' ')).toContain('상관');
  });

  it('칩 묶음은 편관·식신·상관 셋이다', () => {
    expect(judgeJesal(OK).groups.map(g => g.title)).toEqual(['편관', '식신', '상관']);
  });
});

describe('공통 그릇', () => {
  it('식신생재도 같은 모양으로 나온다', () => {
    const r = siksinVerdict(ch({ yGan: 9, yZhi: 4, mGan: 2, mZhi: 2, dGan: 0, dZhi: 3, hGan: 4, hZhi: 11 }));
    expect(r.pattern).toBe('siksin');
    expect(r.level).toBe('clear');
    expect(r.tone).toBe('good');
    expect(r.groups.map(g => g.title)).toEqual(['식신', '상관', '재성']);
  });

  it('세 갈래 모두 이름이 있다', () => {
    for (const p of ['siksin', 'jaeda', 'jesal'] as Pattern[]) {
      expect(PATTERN_LABEL[p].length).toBeGreaterThan(1);
    }
  });

  it('어떤 명식·어떤 갈래를 넣어도 판정이 나온다', () => {
    for (const p of ['siksin', 'jaeda', 'jesal'] as Pattern[]) {
      for (let g = 0; g < 10; g++) for (let z = 0; z < 12; z++) {
        const r = verdictFor(p, ch({ yGan: g, yZhi: z, mGan: (g + 4) % 10, mZhi: (z + 7) % 12, dGan: g, dZhi: (z + 3) % 12 }));
        expect(r.pattern).toBe(p);
        expect(['clear', 'yes', 'weak', 'none']).toContain(r.level);
        expect(['good', 'warn', 'flat']).toContain(r.tone);
        expect(r.tag.length).toBeGreaterThan(1);
        expect(r.headline.length).toBeGreaterThan(5);
        expect(r.body.length).toBeGreaterThan(10);
        expect(r.notes.length).toBeGreaterThan(0);
        expect(r.groups).toHaveLength(3);
      }
    }
  });

  // 판정이 늘 같은 답만 내면 그건 판정이 아니라 장식이다.
  it('갈래마다 답이 갈린다', () => {
    for (const p of ['siksin', 'jaeda', 'jesal'] as Pattern[]) {
      const seen = new Set<string>();
      for (let dg = 0; dg < 10; dg++) for (let mz = 0; mz < 12; mz++) for (let mg = 0; mg < 10; mg += 3) {
        seen.add(verdictFor(p, ch({
          yGan: (dg + 2) % 10, yZhi: (mz + 3) % 12,
          mGan: mg, mZhi: mz, dGan: dg, dZhi: (mz + 6) % 12,
          hGan: (mg + 4) % 10, hZhi: (mz + 9) % 12,
        })).level);
      }
      expect(seen.size).toBeGreaterThanOrEqual(3);
    }
  });
});
