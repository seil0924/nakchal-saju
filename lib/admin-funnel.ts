import 'server-only';
import { adminEnabled, supabaseAdmin } from './supabase/admin';
import { fetchAll } from './sb-page';
import { aggregateFunnel, cleanJourney, FUNNEL_KIND, type FunnelRow, type Journey } from './funnel';

export async function getFunnelStats() {
  if (!adminEnabled()) return { ready: false, paidReady: false, rows: aggregateFunnel([], []), first: null as string | null };
  const sb = supabaseAdmin();
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  let events: FunnelRow[];
  try {
    events = await fetchAll<FunnelRow>((a,b) => sb.from('page_views').select('slug,created_at').eq('kind', FUNNEL_KIND)
      .gte('created_at', since).order('id').range(a,b));
  } catch { return { ready: false, paidReady: false, rows: aggregateFunnel([], []), first: null }; }
  let paidReady = true;
  const paid: Journey[] = [];
  try {
    // 결제 상태를 브라우저에서 받지 않는다. 실제 결제 원장과 저장한 여정만 연결한다.
    const payments = await fetchAll<any>((a,b) => sb.from('payments').select('report_id,paid_at')
      .eq('status', 'paid').gte('paid_at', since).order('payment_id').range(a,b));
    const ids = [...new Set<string>(payments.map(p => p.report_id).filter(Boolean))];
    for (let i=0;i<ids.length;i+=200) {
      const { data, error } = await sb.from('reports').select('journey:input->journey').in('id', ids.slice(i,i+200));
      if (error) throw error;
      for (const record of data ?? []) { const j = cleanJourney(record.journey); if (j) paid.push(j); }
    }
  } catch { paidReady = false; }
  return { ready: true, paidReady, rows: aggregateFunnel(events, paid), first: events[0]?.created_at ?? null };
}
