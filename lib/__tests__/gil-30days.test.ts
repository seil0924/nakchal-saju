import { describe, it, expect, vi, afterEach } from 'vitest';
import { computeReport } from '../report';

// 투찰 길일은 달력의 이번 달이 아니라 '오늘부터 30일'이다(2026-10-21).
// 21일에 결제한 손님이 남은 열흘치만 받던 문제.
describe('투찰 택일 · 오늘부터 30일', () => {
  afterEach(() => vi.useRealTimers());
  it('10월 21일에 보면 11월 19일까지 보이고, 다음 달 날짜가 섞인다', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-21T03:00:00Z'));   // KST 정오
    const r: any = computeReport({ birth: '1971-07-16', cat: 'sajeong' } as any, 1);
    const tk = r.sections.find((s: any) => s.mk === '擇');
    expect(tk.t).toBe('오늘부터 30일 투찰 길일');
    expect(tk.html).toContain('11월 19일</b>까지 30일');
    // 칸 30개(앞쪽 빈칸 제외)
    expect((tk.html.match(/<div class="cd(?: gil)?">/g) || []).length).toBe(30);
    const rate = r.sections.find((s: any) => s.mk === '率');
    expect(rate.html).toContain('오늘부터 <b>30일</b> 명리 흐름 달력');
    expect(rate.html).not.toContain('이번 달');
  });
});

describe('투찰 결과의 명리 표현과 무료·유료 경계', () => {
  afterEach(() => vi.useRealTimers());

  it.each(['2026-11-02T03:00:00Z', '2026-12-29T03:00:00Z'])('무료 달력은 7일만 공개하고 나머지 23일을 명시한다: %s', iso => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(iso));
    const result = computeReport({ birth: '1971-07-16', cat: 'sajeong' }, 0);
    const rate = result.sections.find(s => s.mk === '率')!;
    expect((rate.html.match(/class="scm" style=/g) || []).length).toBe(7);
    expect((rate.html.match(/class="scm lockm" aria-label="[^"]+">미공개/g) || []).length).toBe(23);
    expect(rate.html).toContain('오늘부터 7일 무료');
    expect(rate.html).toContain('990원 결제 후');
    expect(rate.html).not.toContain('class="scm lockm">·');
    expect(result.sections.find(s => s.mk === '擇')!.html).toBe('');
  });

  it.each([1, 2])('유료 레벨 %i에서는 30일 모두 공개하고 추가 결제를 요구하지 않는다', level => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-02T03:00:00Z'));
    const result = computeReport({ birth: '1971-07-16', cat: 'sajeong' }, level);
    const rate = result.sections.find(s => s.mk === '率')!;
    expect((rate.html.match(/class="scm" style=/g) || []).length).toBe(30);
    expect(rate.html).not.toContain('lockm');
    expect(rate.html).not.toContain('990원 결제 후');
    expect(rate.html).toContain('30일 전체 열람 중');
    expect(result.sections.find(s => s.mk === '擇')!.html).toContain('길일마다 유리한 시진');
  });

  it.each([0, 1, 2])('레벨 %i 결과에 사정률 백분율·상하단 예측을 표시하지 않는다', level => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-02T03:00:00Z'));
    const result = computeReport({ birth: '1971-07-16', cat: 'sajeong' }, level);
    const html = result.sections.map(s => s.html).join('');
    expect(html).not.toMatch(/100\.0|101\.2|98\.6|class="gmeter"|상단|하단|사정률이/);
    expect(html).toContain('공고의 마감 시각');
    expect(result.hero.label).toBe('오늘의 명리 해석 점수');
    expect(result.hero.sub).toContain('낙찰 확률이 아닙니다');
  });
});

describe('길일·시진·사주의 해 (2026-10-21 수정)', () => {
  afterEach(() => vi.useRealTimers());
  const tk = (birth: string) => {
    const r: any = computeReport({ birth, cat: 'sajeong' } as any, 1);
    return r.sections.find((s: any) => s.mk === '擇');
  };
  it('일지 충을 빼서 길일 수가 사람마다 달라진다 (누구나 12일이 아니다)', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-21T03:00:00Z'));
    const counts = new Set<number>();
    for (let d = 1; d <= 24; d++) {
      const html: string = tk(`1971-07-${String(d).padStart(2, '0')}`).html;
      counts.add((html.match(/<div class="cd gil">/g) || []).length);
    }
    expect(counts.size).toBeGreaterThan(1);
    for (const n of counts) expect(n).toBeLessThanOrEqual(12);
  });
  it('유료 택일에 길일마다 유리한 시진이 붙는다', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-21T03:00:00Z'));
    const html: string = tk('1971-07-16').html;
    expect(html).toContain('길일마다 유리한 시진');
    expect((html.match(/class="gilrow"/g) || []).length).toBe((html.match(/<div class="cd gil">/g) || []).length);
  });
  it('시진은 날마다 달라진다', () => {
    const rate = (iso: string) => { vi.useFakeTimers(); vi.setSystemTime(new Date(iso));
      const r: any = computeReport({ birth: '1971-07-16', cat: 'sajeong' } as any, 0);
      return (r.sections.find((s: any) => s.mk === '率').html.match(/<div class="sijin12">[\s\S]*?<\/div><p/) || [''])[0]; };
    const a = rate('2026-10-21T03:00:00Z'), b = rate('2026-10-22T03:00:00Z');
    expect(a).not.toBe('');
    expect(a).not.toBe(b);
  });
  it('한국 새벽(UTC 전날)에도 오늘은 한국 날짜다', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-20T20:00:00Z'));   // KST 10-21 05:00
    const r: any = computeReport({ birth: '1971-07-16', cat: 'sajeong' } as any, 1);
    expect(r.sections.find((s: any) => s.mk === '擇').html).toContain('11월 19일</b>까지 30일');
  });
});
