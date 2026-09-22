// lib/sb-page.ts — Supabase 는 한 번에 1000줄까지만 돌려준다.
// .limit(50000) 을 줘도 잘린다 — 관리자 조회수가 1000에서 멈춰 있던 이유다(2026-09-17).
// range 로 끝까지 나눠 읽는다. 마지막 장은 1000줄이 안 차므로 거기서 멈춘다.
export const PAGE = 1000;

export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>,
  max = 200000,
): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < max; i += PAGE) {
    const { data, error } = await page(i, i + PAGE - 1);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}
