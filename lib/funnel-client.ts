'use client';
import { cleanJourney, encodeEvent, type Journey, type FunnelEvent } from './funnel';
import { SKIP_KEY } from './track';
const sent = new Set<string>();
export function newJourney(source: Journey['source'], cat: string): Journey | null {
  if (typeof window === 'undefined' || !['daepyo', 'sajeong'].includes(cat)) return null;
  return { id: crypto.randomUUID().replace(/-/g, ''), source, cat };
}
export function trackFunnel(j: Journey | null | undefined, event: FunnelEvent, admin = false) {
  if (!j || admin || typeof window === 'undefined' || !cleanJourney(j)) return;
  const key = encodeEvent(j, event);
  try { if (localStorage.getItem(SKIP_KEY) || sessionStorage.getItem('nf:' + key)) return; } catch { /* 메모리 중복 방지 유지 */ }
  if (sent.has(key)) return;
  sent.add(key);
  void fetch('/api/funnel', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ journey: j, event }), keepalive: true }).then(r => {
      if (!r.ok) { sent.delete(key); return; }
      try { sessionStorage.setItem('nf:' + key, '1'); } catch { /* optional */ }
    }).catch(() => sent.delete(key));
}
