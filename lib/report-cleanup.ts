// 리포트 정리 — 무엇을 지워도 되는가. (관리자 /admin/reports 의 삭제 버튼이 쓴다)
//
// payments.report_id 가 reports(id) 를 ON DELETE CASCADE 로 참조한다(0001_init.sql).
// 리포트를 지우면 거기 딸린 결제 기록도 같이 지워진다. 그래서 결제가 붙었거나
// 유료로 열린 리포트는 지우지 않는다 — 매출 기록이고, 분쟁·CS 때 원문을 봐야 한다.

export type CleanupRow = { id: string; unlockLevel?: number | null };

export function splitDeletable(rows: CleanupRow[], paidIds: Iterable<string>) {
  const paid = new Set(paidIds);
  const deletable: string[] = [];
  const kept: string[] = [];
  for (const r of rows) {
    const keep = paid.has(r.id) || (r.unlockLevel ?? 0) >= 1;
    (keep ? kept : deletable).push(r.id);
  }
  return { deletable, kept };
}

// 리포트 폼의 성함 칸이 12자다. 그보다 길거나 비면 찾지 않는다.
export const NAME_MAX = 12;
export function cleanName(v: unknown): string {
  const s = String(v ?? '').trim();
  return s.length > 0 && s.length <= NAME_MAX ? s : '';
}

export const isReportId = (v: unknown): v is string =>
  typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
