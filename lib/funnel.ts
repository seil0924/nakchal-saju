// 한 번의 풀이 여정만 묶는 무작위 값. 이름·생일·전화번호·접근 토큰은 담지 않는다.
export const FUNNEL_KIND = 'funnel_v1';
export const SOURCES = ['ceo', 'sajang', 'direct'] as const;
export const EVENTS = ['entry_result', 'bridge_click', 'input_view', 'free_result', 'preview_view', 'checkout_open', 'checkout_close', 'payment_start', 'payment_cancel', 'payment_pending', 'payment_error', 'paid_open'] as const;
export type FunnelEvent = typeof EVENTS[number];
export type Journey = { id: string; source: typeof SOURCES[number]; cat: string };
export function cleanJourney(v: any): Journey | null {
  if (!v || typeof v.id !== 'string' || !/^[a-f0-9]{32}$/.test(v.id) || !SOURCES.includes(v.source)
    || !['daepyo', 'sajeong'].includes(v.cat)) return null;
  return { id: v.id, source: v.source, cat: v.cat };
}
export function encodeEvent(j: Journey, event: FunnelEvent) { return [j.id, j.source, j.cat, event].join('.'); }
export function decodeEvent(slug: unknown) {
  if (typeof slug !== 'string') return null;
  const parts = slug.split('.');
  if (parts.length !== 4 || !EVENTS.includes(parts[3] as FunnelEvent)) return null;
  const journey = cleanJourney({ id: parts[0], source: parts[1], cat: parts[2] });
  return journey ? { journey, event: parts[3] as FunnelEvent } : null;
}
export type FunnelRow = { slug: string | null; created_at: string };
// 동일 여정·단계의 재전송은 한 번만 센다. 빠진 단계를 추정해서 채우지 않는다.
export function aggregateFunnel(rows: FunnelRow[], paid: Journey[]) {
  const groups = new Map<string, { journey: Journey; stages: Set<string> }>();
  for (const row of rows) {
    const parsed = decodeEvent(row.slug); if (!parsed) continue;
    const key = `${parsed.journey.id}.${parsed.journey.source}.${parsed.journey.cat}`;
    if (!groups.has(key)) groups.set(key, { journey: parsed.journey, stages: new Set() });
    groups.get(key)!.stages.add(parsed.event);
  }
  for (const j of paid) groups.get(`${j.id}.${j.source}.${j.cat}`)?.stages.add('paid');
  return SOURCES.flatMap(source => ['daepyo', 'sajeong'].map(cat => {
    const journeys = [...groups.values()].filter(g => g.journey.source === source && g.journey.cat === cat);
    const count = (stage: string) => journeys.filter(g => g.stages.has(stage)).length;
    const next = (from: string, to: string) => {
      const reached = journeys.filter(g => g.stages.has(from));
      const advanced = reached.filter(g => g.stages.has(to)).length;
      return { from, to, total: reached.length, advanced, missing: reached.length - advanced };
    };
    return { source, cat, counts: Object.fromEntries([...EVENTS, 'paid'].map(e => [e, count(e)])),
      transitions: [...(source === 'direct' ? [] : [next('entry_result', 'bridge_click'), next('bridge_click', 'input_view')]), next('input_view', 'free_result'), next('free_result', 'preview_view'), next('preview_view', 'checkout_open'), next('checkout_open', 'payment_start'), next('payment_start', 'paid'), next('paid', 'paid_open')] };
  }));
}
