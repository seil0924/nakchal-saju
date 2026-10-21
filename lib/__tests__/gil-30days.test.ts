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
