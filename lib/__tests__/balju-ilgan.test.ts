import { describe, it, expect } from 'vitest';
import { CLIENTS } from '../clients';
import { ilganTable, ilganSummary, neighbors } from '../balju-ilgan';

describe('발주처 일간별 표', () => {
  const c = CLIENTS.find(x => x.core)!;
  it('일간 10개, 순위는 1부터 발주처 수 안', () => {
    const rows = ilganTable(c);
    expect(rows).toHaveLength(10);
    for (const r of rows) { expect(r.rank).toBeGreaterThanOrEqual(1); expect(r.rank).toBeLessThanOrEqual(CLIENTS.length); }
  });
  it('요약 문장에 조사가 어긋나지 않는다(판라·곳로)', () => {
    for (const x of CLIENTS) {
      const s = ilganSummary(x);
      expect(s).not.toMatch(/판라|곳로|자리이라|판로,/);
      expect(s).not.toMatch(/,\S/);   // 쉼표 뒤 띄어쓰기

    }
  });
  it('이웃 발주처에 자기 자신이 없고, 페이지마다 같은 목록이 아니다', () => {
    const lists = CLIENTS.filter(x => x.core).map(x => neighbors(x, 12).map(y => y.name));
    CLIENTS.filter(x => x.core).forEach((x, i) => expect(lists[i]).not.toContain(x.name));
    expect(new Set(lists.map(l => l.join(','))).size).toBeGreaterThan(20);
  });
});
