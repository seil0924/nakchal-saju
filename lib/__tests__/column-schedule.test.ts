import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// 칼럼 예약 발행(2026-10-21 ~ 2026-12-31, 매일 오전 9시).
// 예약 글은 배포 때 날짜를 지난 것만 열린다(lib/column.ts isPublishedKST). 형식이 틀리면
// 날짜를 못 읽어 바로 공개되거나, YAML 이 깨져 빌드가 멈춘다. 여기서 미리 잡는다.
const DIR = path.resolve(__dirname, '../../content/column');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
const posts = files.map(f => ({ f, ...matter(fs.readFileSync(path.join(DIR, f), 'utf8')) }));

describe('칼럼 frontmatter', () => {
  it('모든 글에 제목·요약·날짜·태그가 있다', () => {
    for (const p of posts) {
      expect(String(p.data.title ?? ''), p.f).not.toBe('');
      expect(String(p.data.description ?? ''), p.f).not.toBe('');
      expect(String(p.data.date ?? ''), p.f).toMatch(/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/);
      expect(Array.isArray(p.data.tags), p.f).toBe(true);
    }
  });
  it('FAQ 가 있으면 질문과 답이 모두 차 있다', () => {
    for (const p of posts) {
      for (const q of (p.data.faq ?? []) as any[]) {
        expect(String(q?.q ?? '').trim(), p.f).not.toBe('');
        expect(String(q?.a ?? '').trim(), p.f).not.toBe('');
      }
    }
  });
});

describe('예약 칼럼', () => {
  const sched = posts.filter(p => String(p.data.date) >= '2026-10-21');
  it('하루에 한 편, 오전 9시', () => {
    const days = sched.map(p => String(p.data.date).slice(0, 10));
    const dup = days.filter((d, i) => days.indexOf(d) !== i);
    expect(dup, '같은 날 두 편').toEqual([]);
    for (const p of sched) expect(String(p.data.date), p.f).toMatch(/ 09:00$/);
  });
  it('본문에 줄표(—)가 없다', () => {
    for (const p of sched) expect((p.content.match(/—/g) || []).length, p.f).toBe(0);
  });
});

// 예전 글도 줄표를 다 걷었다(2026-10-22). uxlint 는 한 줄에 둘 이상일 때만 잡아서 여기서 막는다.
describe('모든 칼럼', () => {
  it('제목·설명·FAQ·본문 어디에도 줄표(—)가 없다', () => {
    for (const p of posts) {
      const all = JSON.stringify(p.data) + p.content;
      expect((all.match(/—/g) || []).length, p.f).toBe(0);
    }
  });
});
