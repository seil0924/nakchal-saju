import { describe, it, expect } from 'vitest';
import { sellableCats, canSellCat, CAT_INFO } from '../report-categories';

// 카테고리 없이 들어온 리포트를 결제 시점에 팔 때, "무엇을 팔아도 되는가"를 정하는 곳.
// 값이 없는 상품을 팔면 돈은 받고 빈 화면을 주게 된다.
const 대표만 = {};
const 법인있음 = { legal: '2016-02-05' };
const 발주처있음 = { client: '1998-03-02' };
const 다있음 = { legal: '2016-02-05', client: '1998-03-02', partner: '1980-05-05', ally: '2005-03-10' };

describe('sellableCats — 값이 있는 것만 판다', () => {
  it('생년월일만 있으면 추가 입력이 필요없는 상품만 나온다', () => {
    const keys = sellableCats(대표만).map(c => c.key);
    expect(keys).toContain('daepyo');
    expect(keys).toContain('sajeong');
    expect(keys).not.toContain('daeun');   // 법인 설립일 필요
    expect(keys).not.toContain('balju');   // 발주처 설립일 필요
    expect(keys).not.toContain('gunghap'); // 상대 날짜 필요
  });

  it('법인 설립일이 있으면 회사 대운이 열린다', () => {
    expect(sellableCats(법인있음).map(c => c.key)).toContain('daeun');
  });

  it('발주처 설립일이 있으면 발주처 사주가 열린다', () => {
    expect(sellableCats(발주처있음).map(c => c.key)).toContain('balju');
  });

  it('다 있으면 전 상품이 나온다', () => {
    expect(sellableCats(다있음)).toHaveLength(Object.keys(CAT_INFO).length);
  });
});

describe('canSellCat — 결제 직전 서버 검증', () => {
  it('필요한 입력이 없으면 거절한다 — 빈 화면을 팔지 않기 위해', () => {
    expect(canSellCat('daeun', 대표만)).toBe(false);
    expect(canSellCat('balju', 대표만)).toBe(false);
  });
  it('입력이 갖춰지면 통과한다', () => {
    expect(canSellCat('daeun', 법인있음)).toBe(true);
  });
  it('카테고리 키가 아니면 거절한다 — 폼을 우회한 값이 들어온다', () => {
    for (const bad of ['', 'free', 'admin', null, undefined, 1, {}]) {
      expect(canSellCat(bad as any, 다있음)).toBe(false);
    }
  });
});
