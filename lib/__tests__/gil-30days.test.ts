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
    expect(rate.html).toContain('오늘부터 <b>30일</b> 사정률');
    expect(rate.html).not.toContain('이번 달');
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
