import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// 서버 액션은 관리자 레이아웃의 확인을 거치지 않는다 — 액션 주소만 알면 누구나 POST 할 수 있다.
// /admin/reviews 의 승인·삭제·추가가 확인 없이 열려 있었다(2026-09-11). 새 액션이 또 빠뜨리지 않게 막는다.
function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

describe('관리자 서버 액션은 모두 첫 줄에서 관리자를 확인한다', () => {
  const files = walk(path.join(process.cwd(), 'app', 'admin'));
  const actions: { file: string; line: number; next: string }[] = [];
  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
    lines.forEach((l, i) => {
      if (/^\s*['"]use server['"];?\s*$/.test(l)) {
        const next = lines.slice(i + 1).find((x) => x.trim()) ?? '';
        actions.push({ file: path.relative(process.cwd(), f), line: i + 1, next: next.trim() });
      }
    });
  }
  it('서버 액션이 하나 이상 있다(검사가 헛돌지 않는지)', () => {
    expect(actions.length).toBeGreaterThan(0);
  });
  it.each(actions.map((a) => [`${a.file}:${a.line}`, a.next]))('%s', (_where, next) => {
    expect(next).toMatch(/^if \(!\(await guard\(\)\)\) return;/);
  });
});
