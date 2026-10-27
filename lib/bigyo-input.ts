// lib/bigyo-input.ts — 후보 날짜 비교(較)의 입력 규칙. 화면과 서버가 같이 쓴다(계산 없음).
//
// 대표님이 직접 고른 날짜 2~3개만 받는다. 공고 마감일 같은 외부 데이터는 받지도 묻지도 않는다.
// 택일 화면(/taekil)에서 날짜를 고르면 /reading?cat=bigyo&p=계약일&d=2027-01-12,2027-01-15 로 넘어온다.

// 무엇을 하려는 날인지. lib/taekil 의 슬러그와 같아야 건제십이신 순서를 그대로 빌려 쓴다.
export const BIGYO_PURPOSES = ['계약일', '입찰일', '법인설립일', '사무실이전', '개업일'] as const;
export type BigyoPurpose = typeof BIGYO_PURPOSES[number];
export const BIGYO_LABEL: Record<BigyoPurpose, string> = {
  계약일: '계약 서명', 입찰일: '투찰·서류 확정', 법인설립일: '법인 설립 등기', 사무실이전: '사무실 이전', 개업일: '개업',
};
export const BIGYO_MIN = 2;
export const BIGYO_MAX = 3;

export const isPurpose = (s: unknown): s is BigyoPurpose =>
  typeof s === 'string' && (BIGYO_PURPOSES as readonly string[]).includes(s);

// 실제로 있는 날짜만(2월 30일 같은 것은 버린다), 겹치면 하나로, 날짜 순으로, 최대 셋.
export function parseCands(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',') : [];
  const ok = new Set<string>();
  for (const v of list) {
    const s = String(v ?? '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) continue;
    const [y, m, d] = s.split('-').map(Number);
    if (y < 1950 || y > 2100) continue;
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) continue;
    ok.add(s);
  }
  return [...ok].sort().slice(0, BIGYO_MAX);
}

export function bigyoHref(purpose: BigyoPurpose, dates: string[]): string {
  const q = new URLSearchParams({ cat: 'bigyo', p: purpose, d: parseCands(dates).join(',') });
  return '/reading?' + q.toString();
}
