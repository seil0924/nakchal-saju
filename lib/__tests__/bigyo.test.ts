import { describe, it, expect } from 'vitest';
import { parseCands, bigyoHref, isPurpose } from '../bigyo-input';
import { rankCands, bigyoPaidHtml, bigyoFreeHtml, bigyoTeaser } from '../bigyo';
import { canSellCat, sellableCats } from '../report-categories';
import { chartFromBirth, todayPillar } from '../engine';

const c = chartFromBirth('1972-03-15', null, 'solar', false);

describe('후보 날짜 입력', () => {
  it('없는 날·겹친 날은 버리고 날짜순 최대 셋', () => {
    expect(parseCands('2027-02-30,2027-01-26,2027-01-14,2027-01-14,abc,2027-03-01,2027-04-01'))
      .toEqual(['2027-01-14', '2027-01-26', '2027-03-01']);
    expect(parseCands(undefined)).toEqual([]);
  });
  it('주소에는 날짜와 일이 실린다', () => {
    expect(bigyoHref('계약일', ['2027-01-26', '2027-01-14'])).toBe('/reading?cat=bigyo&p=%EA%B3%84%EC%95%BD%EC%9D%BC&d=2027-01-14%2C2027-01-26');
    expect(isPurpose('계약일')).toBe(true);
    expect(isPurpose('아무날')).toBe(false);
  });
  it('날짜가 둘 미만이면 팔지 않는다', () => {
    expect(canSellCat('bigyo', { cands: ['2027-01-14'] })).toBe(false);
    expect(canSellCat('bigyo', { cands: ['2027-01-14', '2027-01-26'] })).toBe(true);
    expect(sellableCats({}).some(x => x.key === 'bigyo')).toBe(false);
  });
});

describe('후보 날짜 순위', () => {
  it('일지와 충하는 날은 충 없는 같은 조건의 날보다 뒤로 간다', () => {
    // 대표 일지와 충하는 지지의 날을 하나 찾는다
    let chungDay = '', okDay = '';
    for (let d = 1; d <= 60 && (!chungDay || !okDay); d++) {
      const dt = new Date(Date.UTC(2027, 0, d)); const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, dd = dt.getUTCDate();
      const ymd = `${y}-${String(m).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
      const z = todayPillar(y, m, dd).zhi;
      if ((z - c.dZhi + 12) % 12 === 6) chungDay ||= ymd; else okDay ||= ymd;
    }
    const rows = rankCands(c, '계약일', [chungDay, okDay]);
    const ch = rows.find(r => r.ymd === chungDay)!;
    expect(ch.chung).toBe(true);
    const other = rows.find(r => r.ymd === okDay)!;
    if (!ch.offAvoid && !other.offAvoid && other.passed >= ch.passed) expect(rows[0].ymd).toBe(okDay);
  });
  it('파·위·폐 날은 통과 수와 상관없이 맨 뒤', () => {
    // 2027-01 에서 파(6)인 날과 정(4)인 날
    const rows = rankCands(c, '계약일', ['2027-01-14', '2027-01-26', '2027-01-20', '2027-01-21', '2027-01-22']);
    const avoidIdx = rows.findIndex(r => r.offAvoid);
    if (avoidIdx >= 0) expect(rows.slice(avoidIdx).every(r => r.offAvoid)).toBe(true);
  });
  it('공휴일·주말이면 따로 알린다', () => {
    const html = bigyoPaidHtml(c, '법인설립일', ['2027-02-09', '2027-02-13']);
    expect(html).toContain('설날 대체공휴일');
    expect(html).toContain('주말입니다');
  });
  it('유료 본문은 결과를 약속하지 않는다', () => {
    const html = bigyoPaidHtml(c, '입찰일', ['2027-01-14', '2027-01-26']);
    expect(html).toContain('결과를 보장하지 않습니다');
    expect(html).not.toMatch(/낙찰(이|을)? ?(됩|보장)|확률이 오/);
    expect(html).toContain('1순위');
  });
  it('무료 칸과 잠긴 칸 문구는 순위를 드러내지 않는다', () => {
    const free = bigyoFreeHtml('계약일', ['2027-01-14', '2027-01-26']);
    expect(free).not.toContain('순위</');
    expect(free).toContain('다른 업체 대표님도 똑같이');
    expect(bigyoTeaser(c, '계약일', ['2027-01-14', '2027-01-26'])).not.toContain('1월');
  });
});
