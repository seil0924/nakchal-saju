import { afterEach, describe, expect, it, vi } from 'vitest';
import { computeReport } from '../report';
import { chartFromBirth } from '../engine';
import { interpretChart } from '../saju-interpretation';
import { representativePaidPreview } from '../interpretation-copy';

const input = { birth: '1980-05-15', time: null, cat: 'daepyo' };
const text = (html: string) => html.replace(/<[^>]+>/g, '');
afterEach(() => vi.useRealTimers());

describe('내 사주에 맞는 유료 발췌', () => {
  it('대표 사주의 무료 발췌가 유료 원문에 있고 적용 방법은 전송하지 않는다', () => {
    const free = computeReport(input, 0), paid = computeReport(input, 2);
    const preview = free.purchasePreview!;
    expect(preview.cat).toBe('daepyo');
    expect(preview.question).toContain('실행력과 신중함');
    expect(text(paid.sections.find(s => s.mk === preview.sectionMk)!.html)).toContain(preview.excerpt);
    expect(free.sections.filter(s => !s.free).every(s => s.html === '')).toBe(true);
    const a = interpretChart(chartFromBirth(input.birth, null));
    expect(JSON.stringify(preview)).not.toContain(a.tensions[0].action);
    expect(preview.reason).toContain('시주 제외');
    expect(paid.purchasePreview).toBeNull();
  });
  it('서로 다른 명식은 해당 구성에 맞는 질문·근거·발췌를 고른다', () => {
    const questions = new Set<string>();
    for (let day = 1; day <= 28; day++) {
      const c = chartFromBirth(`1980-05-${String(day).padStart(2, '0')}`, '09:20');
      const a = interpretChart(c), preview = representativePaidPreview(c);
      questions.add(preview.question);
      expect(preview.excerpt).toBe(a.tensions[0].body);
      expect(preview.reason).toBe(a.tensions[0].evidence);
      expect(preview.excerpt.length).toBeLessThan(250);
    }
    expect(questions.size).toBeGreaterThan(2);
  });
  it.each(['2026-11-04T03:00:00Z', '2026-12-29T03:00:00Z'])('택일은 유료 원문의 1일 시진만 발췌하고 달·연도 경계를 지킨다: %s', iso => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(iso));
    const q = { ...input, cat: 'sajeong' };
    const free = computeReport(q, 0), paid = computeReport(q, 1);
    const preview = free.purchasePreview!;
    const html = paid.sections.find(s => s.mk === '擇')!.html;
    const rows = [...html.matchAll(/<div class="gilrow"><b>(.*?)<\/b><span>(.*?)<\/span><\/div>/g)];
    expect(preview.excerpt).toBe(`${rows[0][1]} · ${rows[0][2]}`);
    expect(preview.sectionMk).toBe('擇');
    expect(preview.cat).toBe('sajeong');
    expect(free.sections.find(s => s.mk === '擇')!.html).toBe('');
    expect(free.gauge.precise).toBeUndefined();
    expect(paid.purchasePreview).toBeNull();
    expect(JSON.stringify(preview)).not.toContain(rows[1][1]);
  });
  it('통합 리포트는 처음 잠긴 택일 상품을 안내하고 다른 상품에는 섞지 않는다', () => {
    expect(computeReport({ ...input, cat: undefined }, 0).purchasePreview?.cat).toBe('sajeong');
    for (const cat of ['gunghap', 'calendar', 'calendar_year', 'balju', 'daeun', 'bigyo', 'ijeon']) {
      expect(computeReport({ ...input, cat }, 0).purchasePreview).toBeNull();
    }
    expect(computeReport(input, 1).purchasePreview?.cat).toBe('daepyo');
  });
});
