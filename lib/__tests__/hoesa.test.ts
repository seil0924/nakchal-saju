import { describe, it, expect } from 'vitest';
import { companyChart, companyDaeun, companySeun, elBalance, PHASE_LABEL, PHASE_HINT, DAEUN_LINE, eunNeun } from '../hoesa';
import { compute } from '../engine';

describe('hoesa: companyChart', () => {
  it('설립일 하나로 삼주를 낸다 — 등기 시각을 아는 회사가 없으므로 시주는 없다', () => {
    const c = companyChart('1988-08-15')!;
    expect(c.pillars).toEqual(['戊辰', '庚申', '壬寅']);   // 엔진 검증값과 같은 날짜
    expect(c.dist.reduce((a, b) => a + b, 0)).toBe(6);      // 삼주 = 여섯 글자
  });

  it('서버 엔진과 같은 명식을 낸다 — 두 벌로 갈라지면 화면마다 답이 달라진다', () => {
    for (const d of ['1988-08-15', '2001-02-03', '1975-12-31', '2020-06-01']) {
      const [y, m, dd] = d.split('-').map(Number);
      const a = companyChart(d)!, b = compute(y, m, dd, null);
      expect([a.yGan, a.yZhi, a.mGan, a.mZhi, a.dGan, a.dZhi])
        .toEqual([b.yGan, b.yZhi, b.mGan, b.mZhi, b.dGan, b.dZhi]);
    }
  });

  it('없는 날짜와 망가진 입력은 null 이다', () => {
    for (const bad of ['', '2020-02-30', '20200601', '2020-13-01', '1899-01-01', 'abc'])
      expect(companyChart(bad)).toBeNull();
  });
});

describe('hoesa: companyDaeun', () => {
  it('설립 후 몇 년째인지로 지금 칸을 고른다', () => {
    const c = companyChart('2005-03-10')!;
    expect(companyDaeun(c, 2026).age).toBe(21);
    expect(companyDaeun(c, 2026).curBlock).toBe(2);      // 20~29년차
    expect(companyDaeun(c, 2005).curBlock).toBe(0);
  });

  it('여덟 칸이 끊기지 않고 이어진다', () => {
    const d = companyDaeun(companyChart('2010-01-01')!, 2026);
    expect(d.list).toHaveLength(8);
    d.list.forEach((b, i) => { expect(b.from).toBe(i * 10); expect(b.to).toBe(i * 10 + 9); });
    expect(d.list.filter(b => b.cur)).toHaveLength(1);
  });

  it('아주 오래된 회사도 마지막 칸에 머물고 넘치지 않는다', () => {
    expect(companyDaeun(companyChart('1900-01-01')!, 2026).curBlock).toBe(7);
  });

  it('모든 구간에 판정과 설명이 붙는다 — 빈 칸이 화면에 나가면 안 된다', () => {
    for (const day of ['1990-04-04', '2001-09-09', '2014-11-20', '2022-07-07']) {
      const d = companyDaeun(companyChart(day)!, 2026);
      expect(PHASE_LABEL[d.phase]).toBeTruthy();
      expect(PHASE_HINT[d.phase]).toBeTruthy();
      expect(DAEUN_LINE[d.rel]).toBeTruthy();
    }
  });

  it('머리글과 설명이 서로 반대말을 하지 않는다', () => {
    // 재성 구간 설명은 "벌이는 것보다 챙기고 굳힐 때"인데 이걸 확장으로 묶었더니
    // 화면에서 "확장 구간 / 벌이지 마십시오"가 나란히 찍혔다. 그 조합을 막는다.
    const rels = ['in', 'jae', 'bi', 'sik', 'gwan'];
    const expand = rels.filter(r => {
      const days = ['1990-04-04', '2001-09-09', '2014-11-20', '2022-07-07', '2005-03-10', '1978-06-06'];
      return days.some(d => { const x = companyDaeun(companyChart(d)!, 2026); return x.rel === r && x.phase === 'expand'; });
    });
    expect(expand.every(r => r === 'in')).toBe(true);          // 확장은 인성 구간뿐
    for (const d of ['1990-04-04', '2001-09-09', '2014-11-20', '2022-07-07', '2005-03-10']) {
      const x = companyDaeun(companyChart(d)!, 2026);
      if (x.phase === 'expand') expect(DAEUN_LINE[x.rel]).not.toMatch(/벌이는 것보다|무리한 확장/);
    }
  });
});

describe('hoesa: companySeun · elBalance', () => {
  it('올해가 어떤 해인지 이름표와 한 줄이 나온다', () => {
    const s = companySeun(companyChart('2005-03-10')!, 2026);
    expect(s.hanja).toBe('丙午');
    expect(s.tag).toBeTruthy(); expect(s.line).toBeTruthy();
  });

  it('넘치는 오행과 빈 오행을 고른다', () => {
    const b = elBalance(companyChart('1988-08-15')!);
    expect(b.dist[b.strong]).toBeGreaterThanOrEqual(b.dist[b.weak]);
    expect(b.zero).toBe(b.dist[b.weak] === 0);
  });
});

describe('hoesa: eunNeun', () => {
  it('받침을 보고 은/는을 고른다 — 회사명이 그대로 문장에 들어간다', () => {
    expect(eunNeun('대전건설')).toBe('은');   // ㄹ 받침
    expect(eunNeun('나인굿즈')).toBe('는');   // 받침 없음
    expect(eunNeun('이 회사')).toBe('는');
    expect(eunNeun('한백')).toBe('은');
  });
  it('한글이 아니거나 비어 있으면 기본값', () => {
    expect(eunNeun('')).toBe('는');
    expect(eunNeun('ABC')).toBe('는');
  });
});
