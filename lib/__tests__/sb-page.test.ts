import { describe, it, expect } from 'vitest';
import { fetchAll, PAGE } from '../sb-page';

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ i }));

describe('fetchAll — Supabase 1000줄 제한 넘기기', () => {
  it('한 장으로 끝나면 한 번만 읽는다', async () => {
    let calls = 0;
    const out = await fetchAll(async () => { calls++; return { data: rows(12), error: null }; });
    expect(out.length).toBe(12);
    expect(calls).toBe(1);
  });
  it('가득 찬 장이 이어지면 계속 읽는다', async () => {
    const seen: [number, number][] = [];
    const out = await fetchAll(async (from, to) => {
      seen.push([from, to]);
      return { data: rows(seen.length < 3 ? PAGE : 7), error: null };
    });
    expect(out.length).toBe(PAGE * 2 + 7);
    expect(seen[0]).toEqual([0, PAGE - 1]);
    expect(seen[1]).toEqual([PAGE, PAGE * 2 - 1]);
    expect(seen.length).toBe(3);
  });
  it('max 를 넘겨 읽지 않는다', async () => {
    let calls = 0;
    const out = await fetchAll(async () => { calls++; return { data: rows(PAGE), error: null }; }, PAGE * 2);
    expect(calls).toBe(2);
    expect(out.length).toBe(PAGE * 2);
  });
  it('오류는 삼키지 않고 던진다 — 반쯤 읽은 값을 진짜 합계로 쓰면 안 된다', async () => {
    await expect(fetchAll(async () => ({ data: null, error: new Error('끊김') }))).rejects.toThrow('끊김');
  });
  it('data 가 null 이면 거기서 멈춘다', async () => {
    const out = await fetchAll<{ i: number }>(async () => ({ data: null, error: null }));
    expect(out).toEqual([]);
  });
});
