// lib/track.ts — 익명 조회 기록(클라이언트 측).
// 같은 기기에서 같은 화면을 하루에 여러 번 봐도 1회만 센다.
// 새로고침·뒤로가기로 숫자가 부풀면 나중에 그 숫자를 쓸 수 없기 때문이다.
'use client';
import { srcOf } from '@/lib/track-src';

type Kind = 'reading' | 'ceo' | 'column' | 'balju' | 'home';

const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
};

// 유입원은 **방문의 첫 화면에서 한 번만** 정하고 세션 내내 그것을 쓴다.
// 두 번째 화면부터는 referrer 가 우리 도메인이라 매번 재계산하면 전부 'direct' 가 된다
// — 네이버에서 온 사람이 두 장을 보면 한 장은 네이버, 한 장은 직접 방문으로 찍힌다.
const SRC_KEY = 'nv:src';
function visitSrc(): string {
  try {
    const kept = sessionStorage.getItem(SRC_KEY);
    if (kept) return kept;
    const s = srcOf(document.referrer || '', window.location.search || '');
    sessionStorage.setItem(SRC_KEY, s);
    return s;
  } catch {
    return 'other';   // 사생활 보호 모드 등 저장소가 막힌 경우
  }
}

export function track(kind: Kind, slug?: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = `nv:${kind}:${slug || '-'}:${today()}`;
    if (localStorage.getItem(key)) return;   // 오늘 이미 셌다
    localStorage.setItem(key, '1');

    const body = JSON.stringify({ kind, slug, src: visitSrc() });
    // 페이지를 떠나도 전송이 끊기지 않게 sendBeacon 우선.
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // 계측은 실패해도 조용히 넘어간다.
  }
}
