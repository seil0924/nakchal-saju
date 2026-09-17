// lib/admin-format.ts — 관리자 화면의 숫자를 맞게 만드는 순수 함수들.
//
// 2026-09-17 점검에서 나온 것:
//  · 서버(Vercel)는 UTC 라 "오늘"이 한국 오전 9시에 시작됐고, 시각도 9시간 늦게 찍혔다.
//  · 결제에 회원(user_id)이 붙지 않아 유료 회원·전환율이 늘 0이었다 → 리포트·패스 키에서 거꾸로 찾는다.
//  · 상품명이 리포트 카테고리에서만 나와, 결제 때 고른 상품·패스·복채는 "N원 상품"으로 떴다.
import { CAT_INFO, isCatKey } from './report-categories';
import { kstYmd } from './kst';

const won = (n: number) => n.toLocaleString('ko-KR');

export function kstDayStartIso(now: Date = new Date()): string {
  return new Date(`${kstYmd(now)}T00:00:00+09:00`).toISOString();
}
export function kstMonthStartIso(now: Date = new Date()): string {
  return new Date(`${kstYmd(now).slice(0, 7)}-01T00:00:00+09:00`).toISOString();
}

// '09.17 14:05' (year=true 면 '26.09.17 14:05') — 한국 시각
export function kstStamp(iso?: string | null, year = false): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(+d)) return '';
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d).map(x => [x.type, x.value]));
  return `${year ? p.year + '.' : ''}${p.month}.${p.day} ${p.hour}:${p.minute}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PayRow = {
  user_id?: string | null; report_id?: string | null; pass_key?: string | null;
  amount?: number | null; level?: number | null;
};

// 결제한 회원 — 결제 줄에 없으면 패스 키, 그다음 리포트 주인으로 찾는다.
export function payerOf(p: PayRow, reportOwner: Record<string, string | null | undefined>): string | null {
  if (p.user_id) return p.user_id;
  const k = p.pass_key || '';
  if (k.startsWith('pass:balju:') && UUID.test(k.slice(11))) return k.slice(11);
  if (p.report_id && reportOwner[p.report_id]) return reportOwner[p.report_id] as string;
  return null;
}

// 결제 상품명
export function payItemName(p: PayRow, reportCat?: string | null): string {
  const amount = p.amount ?? 0;
  if (p.pass_key) return '발주처 프리미엄 패스';
  if (!p.report_id && (p.level ?? 2) === 0) return '복채';
  if (reportCat && isCatKey(reportCat)) return CAT_INFO[reportCat].name;
  if (amount === 990) return '택일팩';
  // 카테고리 없이 뽑은 리포트는 결제 때 고른 상품이 저장되지 않는다 — 금액으로 좁힌다.
  const byPrice = Object.values(CAT_INFO).filter(c => c.price === amount).map(c => c.name);
  if (byPrice.length === 1) return byPrice[0];
  if (byPrice.length > 1) return `${byPrice.join(' / ')} 중`;
  return amount ? `${won(amount)}원 상품` : '리포트';
}

export function payStatusLabel(status?: string | null): string {
  if (status === 'paid') return '완료';
  if (status === 'cancelled' || status === 'refunded') return '환불';
  if (status === 'failed') return '실패';
  if (status === 'pending') return '대기';
  return status || '-';
}
