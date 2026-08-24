import { describe, it, expect } from 'vitest';
import {
  bearing, dirOf, distanceKm, yearCaution, nextClearYear,
  favorDir, moveDays, judgeMove, DIR8, DIR8_HANJA,
} from '@/lib/taek-map';

const DJ = { lat: 36.3504, lng: 127.3845 };
const SEOUL = { lat: 37.5663, lng: 126.9779 };
const BUSAN = { lat: 35.1798, lng: 129.0750 };

describe('bearing / dirOf', () => {
  it('정동·정서·정남·정북을 정확히 가른다', () => {
    const o = { lat: 36.35, lng: 127.38 };
    expect(dirOf(bearing(o, { lat: 36.35, lng: 128.38 })).name).toBe('동');
    expect(dirOf(bearing(o, { lat: 36.35, lng: 126.38 })).name).toBe('서');
    expect(dirOf(bearing(o, { lat: 37.35, lng: 127.38 })).name).toBe('북');
    expect(dirOf(bearing(o, { lat: 35.35, lng: 127.38 })).name).toBe('남');
  });

  it('방위각은 0~360 범위를 벗어나지 않는다', () => {
    for (const p of [SEOUL, BUSAN, { lat: 33.5, lng: 126.5 }, { lat: 38.0, lng: 128.6 }]) {
      const b = bearing(DJ, p);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(360);
    }
  });

  it('대전에서 서울은 북쪽이다', () => {
    expect(dirOf(bearing(DJ, SEOUL)).name).toBe('북');
  });

  it('반대로 가면 대략 180도 차이가 난다', () => {
    const a = bearing(DJ, SEOUL), b = bearing(SEOUL, DJ);
    expect(Math.abs(((a - b + 540) % 360) - 180)).toBeLessThan(3);
  });

  it('음수·360 이상 각도도 8방위로 접힌다', () => {
    expect(dirOf(-90).name).toBe('서');
    expect(dirOf(450).name).toBe('동');
    expect(dirOf(360).name).toBe('북');
  });

  it('8방위 이름과 한자가 짝이 맞는다', () => {
    expect(DIR8).toHaveLength(8);
    expect(DIR8_HANJA).toHaveLength(8);
  });
});

describe('distanceKm', () => {
  it('대전~서울은 약 140km다', () => {
    expect(distanceKm(DJ, SEOUL)).toBeGreaterThan(130);
    expect(distanceKm(DJ, SEOUL)).toBeLessThan(150);
  });
  it('같은 자리면 0이다', () => {
    expect(distanceKm(DJ, DJ)).toBeLessThan(0.001);
  });
});

describe('yearCaution', () => {
  it('2026년은 대장군 동, 삼살 북이다', () => {
    const c = yearCaution(2026);
    expect(DIR8[c.daejanggun]).toBe('동');
    expect(DIR8[c.samsal]).toBe('북');
  });

  it('대장군방은 3년씩 같은 방면을 가리킨다', () => {
    for (const y of [2025, 2026, 2027]) expect(DIR8[yearCaution(y).daejanggun]).toBe('동');
    for (const y of [2028, 2029, 2030]) expect(DIR8[yearCaution(y).daejanggun]).toBe('남');
  });

  it('삼살방은 삼합 국의 반대편이다', () => {
    expect(DIR8[yearCaution(2024).samsal]).toBe('남');
    expect(DIR8[yearCaution(2025).samsal]).toBe('동');
    expect(DIR8[yearCaution(2026).samsal]).toBe('북');
    expect(DIR8[yearCaution(2027).samsal]).toBe('서');
  });

  it('두 방위가 겹치는 해가 있다', () => {
    expect(yearCaution(2025).same).toBe(true);
    expect(yearCaution(2026).same).toBe(false);
  });

  it('어느 해든 두 방위가 모두 정해진다', () => {
    for (let y = 2020; y < 2040; y++) {
      const c = yearCaution(y);
      expect(c.daejanggun).toBeGreaterThanOrEqual(0);
      expect(c.samsal).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('nextClearYear', () => {
  it('막힌 방면이 언제 열리는지 알려준다', () => {
    expect(nextClearYear(2, 2026)).toBe(2028);
  });
  it('이미 열려 있으면 그해를 돌려준다', () => {
    expect(nextClearYear(4, 2026)).toBe(2026);
  });
  it('찾는 기간을 넘기면 null', () => {
    expect(nextClearYear(2, 2026, 1)).toBeNull();
  });
});

describe('favorDir', () => {
  it('부족한 오행이 채워지는 방면을 준다', () => {
    expect(DIR8[favorDir(0).main]).toBe('동');
    expect(DIR8[favorDir(1).main]).toBe('남');
    expect(DIR8[favorDir(3).main]).toBe('서');
    expect(DIR8[favorDir(4).main]).toBe('북');
  });
  it('주 방면과 보조 방면이 다르다', () => {
    for (let e = 0; e < 5; e++) expect(favorDir(e).main).not.toBe(favorDir(e).alt);
  });
});

describe('moveDays', () => {
  const days = moveDays(new Date(2026, 7, 21), 60);

  it('60일 중 이사에 쓰는 날만 골라낸다', () => {
    expect(days.length).toBeGreaterThan(10);
    expect(days.length).toBeLessThan(30);
  });

  it('滿·定·成·開 네 신만 나온다', () => {
    for (const d of days) expect(['滿', '定', '成', '開']).toContain(d.key);
  });

  it('날짜가 오름차순이고 오늘은 포함하지 않는다', () => {
    for (let i = 1; i < days.length; i++) expect(days[i - 1].ymd < days[i].ymd).toBe(true);
    expect(days[0].ymd > '2026-08-21').toBe(true);
  });

  it('간지·요일·설명이 빠짐없이 붙는다', () => {
    for (const d of days) {
      expect(d.ganji).toHaveLength(2);
      expect('일월화수목금토').toContain(d.dow);
      expect(d.why.length).toBeGreaterThan(0);
    }
  });

  it('成이 가장 높은 순위다', () => {
    const s = days.find(d => d.key === '成');
    const m = days.find(d => d.key === '滿');
    if (s && m) expect(s.rank).toBeLessThan(m.rank);
  });
});

describe('judgeMove', () => {
  it('흉방이면 caution 이고 풀리는 해를 알려준다', () => {
    const v = judgeMove(DJ, SEOUL, 0, 2026);
    expect(v.dirName).toBe('북');
    expect(v.isSamsal).toBe(true);
    expect(v.level).toBe('caution');
    expect(v.clearYear).toBe(2027);
  });

  it('체질에 맞고 흉방이 아니면 good', () => {
    const v = judgeMove({ lat: 36.35, lng: 127.38 }, { lat: 36.35, lng: 128.38 }, 0, 2028);
    expect(v.dirName).toBe('동');
    expect(v.isFavor).toBe(true);
    expect(v.level).toBe('good');
  });

  it('흉방도 길방도 아니면 ok', () => {
    const v = judgeMove(DJ, BUSAN, 0, 2026);
    if (!v.isDaejanggun && !v.isSamsal && !v.isFavor) expect(v.level).toBe('ok');
  });

  it('거리와 각도를 함께 돌려준다', () => {
    const v = judgeMove(DJ, SEOUL, 0, 2026);
    expect(v.km).toBeGreaterThan(130);
    expect(v.deg).toBeGreaterThan(300);
  });

  it('흉방이 아니면 clearYear 는 비운다', () => {
    const v = judgeMove({ lat: 36.35, lng: 127.38 }, { lat: 36.35, lng: 128.38 }, 0, 2028);
    expect(v.clearYear).toBeNull();
  });
});
