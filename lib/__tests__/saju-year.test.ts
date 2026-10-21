import { describe, it, expect } from 'vitest';
import { sajuYearOf, compute } from '../engine';
import { TYCOONS } from '../tycoon';
import { bizVerdict } from '../biz-check';
import { judgeJaeda } from '../sipsung';
import { CLIENTS, CORE_CLIENT_COUNT, CLIENT_COUNT } from '../clients';

describe('사주의 해는 입춘에 바뀐다', () => {
  it('2027년 1월 15일은 아직 2026년(병오), 2월 10일은 2027년(정미)', () => {
    expect(sajuYearOf(2027, 1, 15)).toBe(2026);
    expect(sajuYearOf(2027, 2, 10)).toBe(2027);
    expect(sajuYearOf(2026, 10, 21)).toBe(2026);
  });
});

describe('재다신약 판정은 거장 화면과 /saju 확인 화면이 같다', () => {
  it('재성 2개 이상인 거장 전원: heavy 여부가 judgeJaeda 와 일치', () => {
    for (const t of TYCOONS) {
      const [y, m, d] = t.born.split('-').map(Number);
      const c = compute(y, m, d, null);
      const v = bizVerdict(c);
      if (v.jae < 2) continue;
      const j = judgeJaeda(c);
      expect(v.key === 'heavy', t.name).toBe(j.level === 'clear' || j.level === 'yes');
    }
  });
});

describe('발주처 수', () => {
  it('핵심·전체 수는 데이터에서 센다', () => {
    expect(CLIENT_COUNT).toBe(CLIENTS.length);
    expect(CORE_CLIENT_COUNT).toBe(CLIENTS.filter(c => c.core).length);
  });
});
