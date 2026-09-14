'use client';
// 홈 화면에 추가 권유. '오늘의 투찰 택일'은 매일 볼 이유가 있는 화면인데
// 다시 부르는 길이 하나도 없었다 — 알림톡·메일은 계정과 심사가 필요해 당장 못 붙인다.
//
// 규칙을 좁게 잡는다. 광고처럼 굴면 그 순간 신뢰를 깎는다.
//  · 결과를 한 번이라도 본 사람에게만(nk_seen_result). 처음 온 사람의 첫 화면을 막아서지 않는다 —
//    예전엔 첫 방문 8초 뒤에 홈·입력 화면 바닥을 덮었다(2026-09-14 모바일 비교에서 청월당 팝업과 같은 문제로 지적).
//  · 홈 · /reading · /report 에서만
//  · 이미 설치된 상태(standalone)면 안 띄운다
//  · 휴대폰에선 화면 위쪽에 띄운다 — 바닥은 하단 탭과 결제 막대 자리다
//  · 닫으면 60일간 안 뜬다
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const KEY = 'nk_a2hs_dismissed_until';
const SEEN_KEY = 'nk_seen_result';

export function markResultSeen() {
  try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch { /* 저장소를 막아 둔 브라우저도 있다 */ }
}

type Prompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function AddToHome() {
  const path = usePathname() || '/';
  const [deferred, setDeferred] = useState<Prompt | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const where = path === '/' || path === '/reading' || path.startsWith('/report/');
    if (!where) return;
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    if (standalone) return;
    try {
      const until = Number(localStorage.getItem(KEY) || 0);
      if (until > Date.now()) return;
    } catch { /* noop */ }

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = isIos && !/crios|fxios|edgios/i.test(navigator.userAgent);
    setIos(isSafari);

    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as Prompt); };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // 결과를 본 뒤에만. /reading 에서 방금 결과가 나온 경우도 잡으려고 조건은 시간이 지난 뒤에 읽는다.
    const t = setTimeout(() => {
      let seen = false;
      try { seen = !!localStorage.getItem(SEEN_KEY); } catch { /* noop */ }
      if (seen) setShow(true);
    }, 8000);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); clearTimeout(t); };
  }, [path]);

  if (!show) return null;
  if (!deferred && !ios) return null;   // 설치할 방법이 없으면 말도 꺼내지 않는다

  const close = () => {
    setShow(false);
    try { localStorage.setItem(KEY, String(Date.now() + 60 * 86400000)); } catch { }
  };

  const add = async () => {
    if (!deferred) return;
    try { await deferred.prompt(); await deferred.userChoice; } catch { }
    close();
  };

  return (
    <div className="a2hs" role="dialog" aria-label="홈 화면에 추가">
      <style>{`
        .a2hs{position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top));z-index:60;
          display:flex;align-items:center;gap:11px;padding:11px 12px;background:#fff;
          border:1px solid #e6e8ea;border-radius:14px;box-shadow:0 8px 28px rgba(32,36,44,.14)}
        @media (min-width:900px){.a2hs{left:auto;right:20px;top:auto;bottom:20px;max-width:380px}}
        .a2hs .a2i{flex:none;width:38px;height:38px;border-radius:11px;background:#3f6be0;display:flex;align-items:center;justify-content:center}
        .a2hs .a2i svg{width:22px;height:22px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .a2hs .a2t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
        .a2hs .a2t b{font-size:15px;font-weight:800;color:#1e2124;line-height:1.4}
        .a2hs .a2t span{font-size:13px;color:#58616a;line-height:1.5}
        .a2hs .a2b{flex:none;border:0;border-radius:9px;background:#3f6be0;color:#fff;
          font-weight:800;font-size:13px;padding:0 14px;min-height:40px;cursor:pointer}
        .a2hs .a2x{flex:none;border:0;background:transparent;color:#636d77;font-size:15px;
          min-width:40px;min-height:40px;cursor:pointer;line-height:1}
      `}</style>
      <div className="a2i" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 6h14v14H5zM8.5 4v4M15.5 4v4M5 10h14M9.5 15l2 2 3.5-3.5" /></svg></div>
      <div className="a2t">
        <b>매일 아침 여기부터 보신다면</b>
        <span>{ios ? '아래 공유 버튼 → 「홈 화면에 추가」 하시면 앱처럼 바로 열립니다.' : '홈 화면에 추가해 두면 오늘의 투찰 택일이 바로 열립니다.'}</span>
      </div>
      {deferred && <button type="button" className="a2b" onClick={add}>추가</button>}
      <button type="button" className="a2x" onClick={close} aria-label="닫기">✕</button>
    </div>
  );
}
