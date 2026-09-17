import { describe, it, expect } from 'vitest';
import { radarSvg, barsSvg, lineSvg, ringSvg } from '../report-charts';

describe('report-charts', () => {
  it('레이더는 축마다 이름과 값을 적는다', () => {
    const s = radarSvg(['木', '火', '土', '金', '水'], [{ values: [2, 0, 1, 1, 2], color: '#3f6be0' }, { values: [0, 2, 3, 0, 1], color: '#d9822b', name: '상대' }], 3, { title: '오행' });
    expect(s).toContain('<svg');
    expect(s).toContain('2 : 0');
    expect(s).toContain('rc-legend');
    expect(s).not.toMatch(/NaN|undefined/);
  });
  it('막대는 지금 칸을 표시하고, 범위를 넘는 값은 자른다', () => {
    const s = barsSvg([{ label: '1월', v: 9, color: '#000', now: true }, { label: '2월', v: -3, color: '#000', dim: true }], 5, { top: '좋음', bottom: '조임' });
    expect(s).toContain('지금');
    expect(s).toContain('위로 높을수록');
    expect(s).not.toMatch(/NaN|undefined|height="-/);
  });
  it('꺾은선·고리', () => {
    expect(lineSvg([{ label: 'a', v: 1, color: '#000' }, { label: 'b', v: 5, color: '#000', now: true }], 5)).not.toMatch(/NaN|undefined/);
    expect(ringSvg(69, '#123456')).toContain('>69<');
    expect(ringSvg(140, '#123456')).toContain('>100<');
  });
  it('글자는 이스케이프한다', () => {
    expect(barsSvg([{ label: '<b>', v: 1, color: '#000' }], 5)).toContain('&lt;b&gt;');
  });
});
