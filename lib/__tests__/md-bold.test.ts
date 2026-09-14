import { describe, it, expect } from 'vitest';
import { boldToStrong } from '../md-bold';

describe('boldToStrong — 한글 굵게', () => {
  it('닫는 ** 앞이 괄호이고 뒤가 한글이어도 굵게가 된다', () => {
    expect(boldToStrong('사주는 **계절의 흐름(절기)**을 기준으로')).toBe('사주는 <strong>계절의 흐름(절기)</strong>을 기준으로');
  });
  it('한 줄에 여러 개', () => {
    expect(boldToStrong('**가**와 **나(다)**가')).toBe('<strong>가</strong>와 <strong>나(다)</strong>가');
  });
  it('코드 칸과 줄을 넘는 짝은 그대로 둔다', () => {
    expect(boldToStrong('`**x**` 그대로')).toBe('`**x**` 그대로');
    expect(boldToStrong('**앞\n뒤**')).toBe('**앞\n뒤**');
  });
  it('공백으로 감싼 별표는 굵게가 아니다', () => {
    expect(boldToStrong('2 ** 3 ** 4')).toBe('2 ** 3 ** 4');
  });
});
