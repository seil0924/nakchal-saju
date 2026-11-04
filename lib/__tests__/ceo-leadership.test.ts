import { describe, expect, it } from 'vitest';
import { POST } from '../../app/api/twin/route';
import { computeReport } from '../report';

describe('CEO 결과에서 대표 사주로 이어지는 성향', () => {
  it.each([
    { birth: '1980-05-15', cal: 'solar', leap: false },
    { birth: '1980-05-15', cal: 'lunar', leap: false },
    { birth: '1979-06-01', cal: 'lunar', leap: true },
  ] as const)('달력 구분이 같은 대표 사주의 무료 풀이와 일치한다: %j', async input => {
    const response = await POST(new Request('http://localhost/api/twin', {
      method: 'POST', body: JSON.stringify(input),
    }));
    expect(response.status).toBe(200);
    const data = await response.json();
    const report = computeReport({ ...input, time: null, cat: 'daepyo' }, 0);
    const free = report.sections.filter(section => section.free).map(section => section.html).join('');
    expect(data.leadership.themes.length).toBeGreaterThan(0);
    for (const theme of data.leadership.themes) {
      expect(free).toContain(theme.label);
      expect(free).toContain(theme.strength);
      expect(Object.keys(theme).sort()).toEqual(['label', 'strength']);
    }
    expect(data.leadership.mixed).toBe(data.leadership.themes.length > 1);
    expect(report.sections.filter(section => !section.free).every(section => !section.html)).toBe(true);
  });
});
