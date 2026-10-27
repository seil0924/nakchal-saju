import { describe, it, expect } from 'vitest';
import { chukmun, gosaDays } from '../gosa';

describe('착공 고사 축문', () => {
  it('설날(2026-02-17)은 병오 정월 초일일', () => {
    const c = chukmun({ ymd: '2026-02-17', company: '대영건설', ceo: '홍길동', project: '증축공사' });
    expect(c.hanja[0]).toBe('維歲次 丙午 正月 壬戌朔 初一日 壬戌');
    expect(c.reading[0]).toBe('유세차 병오 정월 임술삭 초일일 임술');
  });
  it('윤달은 閏 을 붙인다(2025 윤6월 첫날 7/25)', () => {
    const c = chukmun({ ymd: '2025-07-25', company: '', ceo: '', project: '' });
    expect(c.hanja[0]).toContain('閏六月');
    expect(c.reading[0]).toContain('윤유월');
  });
  it('『가례』 후토 축문 글자를 바꾸지 않는다', () => {
    const c = chukmun({ ymd: '2026-10-27', company: '가', ceo: '나', project: '다' });
    expect(c.hanja.slice(1).join(' ')).toBe('가 代表 나 敢昭告于 土地之神 今爲 다 起工 神其保佑 俾無後艱 謹以淸酌脯醢 祗薦于神 尙饗');
  });
  it('조사가 받침에 맞는다', () => {
    expect(chukmun({ ymd: '2026-10-27', company: 'a', ceo: '홍길동', project: '증축공사' }).meaning).toContain('홍길동이');
    expect(chukmun({ ymd: '2026-10-27', company: 'a', ceo: '김철수', project: '도로 보수' }).meaning).toContain('김철수가');
  });
  it('고사 날짜에는 파·위·폐가 없다', () => {
    const d = gosaDays(new Date(2026, 9, 27), 90);
    expect(d.length).toBeGreaterThan(10);
    expect(d.every(x => ['建', '成', '開', '定'].includes(x.hanja))).toBe(true);
  });
});
