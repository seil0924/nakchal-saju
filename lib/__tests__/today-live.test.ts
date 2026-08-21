import { describe, it, expect } from 'vitest';
import { nextSolarTerm, todayTaekil, stampNow, TERMS, TERMS_HANJA } from '@/lib/today-live';

// 절기는 화면에 D-day로 노출되므로 하루만 어긋나도 사용자가 바로 안다.
// 아래 기준일은 2026년 한국 만세력 절기일(실제 역서 기준)이다.
const TERM_DAYS_2026: [number, number, string][] = [
  [2, 4, '입춘'], [2, 19, '우수'], [3, 5, '경칩'], [3, 20, '춘분'],
  [4, 5, '청명'], [4, 20, '곡우'], [5, 5, '입하'], [5, 21, '소만'],
  [6, 21, '하지'], [7, 7, '소서'], [7, 23, '대서'], [8, 7, '입추'],
  [8, 23, '처서'], [9, 7, '백로'], [9, 23, '추분'], [10, 8, '한로'],
  [10, 23, '상강'], [11, 7, '입동'], [11, 22, '소설'], [12, 7, '대설'],
  [12, 22, '동지'],
];

describe('nextSolarTerm', () => {
  it('2026년 절기 당일을 정확히 판정한다', () => {
    for (const [m, d, name] of TERM_DAYS_2026) {
      const r = nextSolarTerm(new Date(2026, m - 1, d, 10, 0));
      expect(r, `${m}/${d} ${name}`).not.toBeNull();
      expect(r!.isToday, `${m}/${d} 는 ${name} 당일`).toBe(true);
      expect(r!.name).toBe(name);
    }
  });

  it('절기 전날은 D-1 로 센다', () => {
    for (const [m, d, name] of TERM_DAYS_2026) {
      const r = nextSolarTerm(new Date(2026, m - 1, d - 1, 10, 0));
      expect(r, `${m}/${d - 1}`).not.toBeNull();
      expect(r!.isToday).toBe(false);
      expect(r!.dday, `${name} 하루 전`).toBe(1);
      expect(r!.name).toBe(name);
    }
  });

  it('처서(8/23) 이틀 전이면 D-2 이고 이름이 처서다', () => {
    const r = nextSolarTerm(new Date(2026, 7, 21, 12, 0));
    expect(r).not.toBeNull();
    expect(r!.name).toBe('처서');
    expect(r!.hanja).toBe('處暑');
    expect(r!.dday).toBe(2);
    expect(r!.isToday).toBe(false);
  });

  it('절기 사이 아무 날에도 항상 결과가 있고 dday는 0~16 범위다', () => {
    for (let k = 0; k < 365; k += 7) {
      const d = new Date(2026, 0, 1 + k);
      const r = nextSolarTerm(d);
      expect(r, d.toDateString()).not.toBeNull();
      expect(r!.dday).toBeGreaterThanOrEqual(0);
      expect(r!.dday).toBeLessThanOrEqual(16);
      expect(TERMS).toContain(r!.name);
    }
  });

  it('이름과 한자 배열이 24개로 짝이 맞는다', () => {
    expect(TERMS).toHaveLength(24);
    expect(TERMS_HANJA).toHaveLength(24);
  });
});

describe('todayTaekil (건제십이신)', () => {
  it('월지와 일지가 같으면 建(건)이다', () => {
    const t = todayTaekil(5, 5, 0);
    expect(t.key).toBe('建');
    expect(t.name).toBe('건');
  });

  it('월지 다음 지지부터 除·滿·平 순으로 돈다', () => {
    expect(todayTaekil(0, 1, 0).key).toBe('除');
    expect(todayTaekil(0, 2, 0).key).toBe('滿');
    expect(todayTaekil(0, 3, 0).key).toBe('平');
    expect(todayTaekil(0, 11, 0).key).toBe('閉');
  });

  it('지지가 12를 넘어 돌아가도 어긋나지 않는다', () => {
    // 월지 10, 일지 1 → (1-10+12)%12 = 3 → 平
    expect(todayTaekil(10, 1, 0).key).toBe('平');
  });

  it('12지지 전부에 대해 판정이 나오고 길흉이 세 값 중 하나다', () => {
    const seen = new Set<string>();
    for (let m = 0; m < 12; m++) {
      for (let d = 0; d < 12; d++) {
        const t = todayTaekil(m, d, 0);
        expect(['good', 'ok', 'bad']).toContain(t.verdict);
        expect(t.title.length).toBeGreaterThan(0);
        expect(t.body.length).toBeGreaterThan(0);
        seen.add(t.key);
      }
    }
    expect(seen.size).toBe(12);   // 12신이 빠짐없이 나온다
  });

  it('간지 문자열을 함께 돌려준다', () => {
    const t = todayTaekil(0, 0, 0);
    expect(t.ganji).toBe('甲子');
  });
});

describe('stampNow', () => {
  it('YYYY.MM.DD HH:MM 기준 형식으로 찍는다', () => {
    expect(stampNow(new Date(2026, 7, 21, 9, 5))).toBe('2026.08.21 09:05 기준');
  });
});
