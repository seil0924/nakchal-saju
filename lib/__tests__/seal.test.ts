import { describe, it, expect } from 'vitest';
import { sealSvg, ganEl } from '../seal';

describe('sealSvg — 인장 SVG 생성 (순수 함수)', () => {
  it('유효한 SVG 문자열 반환, 중앙 글자 포함', () => {
    const svg = sealSvg([2, 1, 1, 2, 2], '甲');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('</svg>');
    expect(svg).toContain('>甲</text>');
  });
  it('size 파라미터가 width/height/viewBox 에 반영', () => {
    const svg = sealSvg([1, 1, 1, 1, 1], '丙', 200);
    expect(svg).toContain('width="200"');
    expect(svg).toContain('height="200"');
    expect(svg).toContain('viewBox="0 0 200 200"');
  });
  it('빈 분포(합 0)여도 0-나눗셈 없이 렌더', () => {
    expect(() => sealSvg([0, 0, 0, 0, 0], '戊')).not.toThrow();
    expect(() => sealSvg([], '戊')).not.toThrow();
  });
  it('값 있는 오행만 ring 세그먼트 생성 (木만 → 木 색 등장)', () => {
    const svg = sealSvg([5, 0, 0, 0, 0], '甲');
    expect(svg).toContain('stroke="#2e8b57"'); // 木
    expect(svg).not.toContain('stroke="#b5402f"'); // 火 없음
  });
});

describe('ganEl — 천간→오행', () => {
  it('甲乙=木, 丙丁=火, 壬癸=水', () => {
    expect(ganEl('甲')).toBe('木');
    expect(ganEl('乙')).toBe('木');
    expect(ganEl('丁')).toBe('火');
    expect(ganEl('癸')).toBe('水');
  });
  it('알 수 없는 문자는 빈 문자열', () => {
    expect(ganEl('X')).toBe('');
  });
});
