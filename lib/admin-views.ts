// lib/admin-views.ts — 관리자 조회수 집계.
// page_views 테이블이 아직 없으면 조용히 빈 값을 돌려준다(마이그레이션 전에도 화면이 깨지지 않게).
import 'server-only';
import { adminEnabled, supabaseAdmin } from '@/lib/supabase/admin';

export type KindStat = { kind: string; label: string; total: number; d7: number; today: number };
export type SlugStat = { slug: string; count: number };
export type ViewStats = {
  ready: boolean;              // 테이블이 준비됐는지
  kinds: KindStat[];
  columns: SlugStat[];
  balju: SlugStat[];
  ceo: SlugStat[];
};

const LABEL: Record<string, string> = {
  home: '홈',
  reading: '무료 열람 · 리포트',
  ceo: '나와 닮은 CEO',
  column: '칼럼',
  balju: '발주처',
};

const EMPTY: ViewStats = { ready: false, kinds: [], columns: [], balju: [], ceo: [] };

export async function getViewStats(): Promise<ViewStats> {
  if (!adminEnabled()) return EMPTY;
  try {
    const sb = supabaseAdmin();
    const now = Date.now();
    const dayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const weekStart = new Date(now - 7 * 86400000).toISOString();

    // 한 번에 읽어 메모리에서 집계한다. 초기 규모에서는 이 편이 쿼리 수가 적다.
    const { data, error } = await sb
      .from('page_views')
      .select('kind,slug,created_at')
      .order('created_at', { ascending: false })
      .limit(50000);

    if (error || !data) return EMPTY;

    const kinds = new Map<string, KindStat>();
    const bySlug: Record<string, Map<string, number>> = { column: new Map(), balju: new Map(), ceo: new Map() };

    for (const r of data as { kind: string; slug: string | null; created_at: string }[]) {
      const k = kinds.get(r.kind) ?? { kind: r.kind, label: LABEL[r.kind] ?? r.kind, total: 0, d7: 0, today: 0 };
      k.total += 1;
      if (r.created_at >= weekStart) k.d7 += 1;
      if (r.created_at >= dayStart) k.today += 1;
      kinds.set(r.kind, k);

      const m = bySlug[r.kind];
      if (m && r.slug) m.set(r.slug, (m.get(r.slug) ?? 0) + 1);
    }

    const top = (m: Map<string, number>, n = 20): SlugStat[] =>
      [...m.entries()].map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count).slice(0, n);

    const order = ['reading', 'ceo', 'column', 'balju', 'home'];
    return {
      ready: true,
      kinds: [...kinds.values()].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)),
      columns: top(bySlug.column),
      balju: top(bySlug.balju),
      ceo: top(bySlug.ceo),
    };
  } catch {
    return EMPTY;
  }
}
