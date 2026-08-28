// lib/admin-views.ts — 관리자 조회수 집계.
// page_views 테이블이 아직 없으면 조용히 빈 값을 돌려준다(마이그레이션 전에도 화면이 깨지지 않게).
import 'server-only';
import { adminEnabled, supabaseAdmin } from '@/lib/supabase/admin';
import { SRC_LABEL, isSrc } from '@/lib/track-src';

export type KindStat = { kind: string; label: string; total: number; d7: number; today: number };
export type SlugStat = { slug: string; count: number };
export type SrcStat = { src: string; label: string; total: number; d7: number; today: number };
export type ViewStats = {
  ready: boolean;              // 테이블이 준비됐는지
  srcReady: boolean;           // src 컬럼 마이그레이션이 돌았는지
  kinds: KindStat[];
  srcs: SrcStat[];
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

const EMPTY: ViewStats = { ready: false, srcReady: false, kinds: [], srcs: [], columns: [], balju: [], ceo: [] };

type Row = { kind: string; slug: string | null; created_at: string; src?: string | null };

export async function getViewStats(): Promise<ViewStats> {
  if (!adminEnabled()) return EMPTY;
  try {
    const sb = supabaseAdmin();
    const now = Date.now();
    const dayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const weekStart = new Date(now - 7 * 86400000).toISOString();

    // 한 번에 읽어 메모리에서 집계한다. 초기 규모에서는 이 편이 쿼리 수가 적다.
    // src 는 마이그레이션(supabase/page_views_src.sql)을 돌려야 생기는 컬럼이라,
    // 없으면 select 자체가 실패한다 — 그때 이 화면이 통째로 비면 안 되므로 빼고 한 번 더 읽는다.
    const q = (cols: string) => sb.from('page_views').select(cols)
      .order('created_at', { ascending: false }).limit(50000);

    let srcReady = true;
    let res = await q('kind,slug,created_at,src');
    if (res.error) { srcReady = false; res = await q('kind,slug,created_at'); }
    if (res.error || !res.data) return EMPTY;

    const kinds = new Map<string, KindStat>();
    const srcs = new Map<string, SrcStat>();
    const bySlug: Record<string, Map<string, number>> = { column: new Map(), balju: new Map(), ceo: new Map() };

    for (const r of res.data as unknown as Row[]) {
      const k = kinds.get(r.kind) ?? { kind: r.kind, label: LABEL[r.kind] ?? r.kind, total: 0, d7: 0, today: 0 };
      k.total += 1;
      if (r.created_at >= weekStart) k.d7 += 1;
      if (r.created_at >= dayStart) k.today += 1;
      kinds.set(r.kind, k);

      if (srcReady) {
        // 마이그레이션 전에 쌓인 줄은 src 가 비어 있다. '알 수 없음'으로 따로 세야
        // 네이버가 0인 것과 아직 안 재고 있는 것을 헷갈리지 않는다.
        const raw = r.src ?? '';
        const key = isSrc(raw) ? raw : (raw ? 'other' : 'unknown');
        const label = key === 'unknown' ? '알 수 없음(계측 전)' : SRC_LABEL[key as keyof typeof SRC_LABEL] ?? key;
        const s = srcs.get(key) ?? { src: key, label, total: 0, d7: 0, today: 0 };
        s.total += 1;
        if (r.created_at >= weekStart) s.d7 += 1;
        if (r.created_at >= dayStart) s.today += 1;
        srcs.set(key, s);
      }

      const m = bySlug[r.kind];
      if (m && r.slug) m.set(r.slug, (m.get(r.slug) ?? 0) + 1);
    }

    const top = (m: Map<string, number>, n = 20): SlugStat[] =>
      [...m.entries()].map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count).slice(0, n);

    const order = ['reading', 'ceo', 'column', 'balju', 'home'];
    return {
      ready: true,
      srcReady,
      kinds: [...kinds.values()].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)),
      // 최근 7일이 많은 순 — 지금 어느 채널이 도는지가 알고 싶은 것이지 누적 순위가 아니다.
      srcs: [...srcs.values()].sort((a, b) => (b.d7 - a.d7) || (b.total - a.total)),
      columns: top(bySlug.column),
      balju: top(bySlug.balju),
      ceo: top(bySlug.ceo),
    };
  } catch {
    return EMPTY;
  }
}
