import { describe, it, expect } from 'vitest';
import { josa } from '../josa';

describe('josa — 받침에 맞는 조사', () => {
  it('한글 낱말', () => {
    expect(josa('대한건설', '는')).toBe('은');
    expect(josa('대영토건', '는')).toBe('은');
    expect(josa('회사', '은')).toBe('는');
    expect(josa('물', '으로')).toBe('로');
    expect(josa('방향', '로')).toBe('으로');
  });
  it('오행·간지 한자는 읽는 소리로', () => {
    expect(josa('火', '이')).toBe('가');
    expect(josa('木', '가')).toBe('이');
    expect(josa('金', '를')).toBe('을');
    expect(josa('<b>水</b>', '과')).toBe('와');
    expect(josa('寅', '가')).toBe('이');
  });
  it('숫자·영문', () => {
    expect(josa('2026', '은')).toBe('은');
    expect(josa('3', '이')).toBe('이');
    expect(josa('KT', '는')).toBe('는');
  });
});
