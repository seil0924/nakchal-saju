'use client';
// 홈 화면에 추가 권유. '오늘의 사정률'은 매일 볼 이유가 있는 화면인데
// 다시 부르는 길이 하나도 없었다 — 알림톡·메일은 계정과 심사가 필요해 당장 못 붙인다.
//
// 규칙을 좁게 잡는다. 광고처럼 굴면 그 순간 신뢰를 깎는다.
//  · 홈과 /reading 에서만
//  · 이미 설치된 상태(standalone)면 안 띄운다
//  · 8초 머문 뒤에 뜬다 — 들어오자마자 막아서지 않는다
//  · 닫으면 60일간 안 뜬다
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const KEY = 'nk_a2hs_dismissed_until';
const WHERE = ['/', '/reading'];

type Prompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function AddToHome() {
  const path = usePathname() || '/';
  const [deferred, setDeferred] = useState<Prompt | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!WHERE.includes(path)) return;
    // 이미 홈 화면에서 연 것이면 권할 이유가 없다.
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    if (standalone) return;
    try {
      const until = Number(localStorage.getItem(KEY) || 0);
      if (until > Date.now()) return;
    } catch { /* 저장소를 막아 둔 브라우저도 있다 */ }

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = isIos && !/crios|fxios|edgios/i.test(navigator.userAgent);
    setIos(isSafari);

    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as Prompt); };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // 사파리는 beforeinstallprompt 가 없다. 안내만 띄운다.
    const t = setTimeout(() => setShow(true), 8000);
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
      <div className="a2i" aria-hidden="true">擇</div>
      <div className="a2t">
        <b>매일 아침 여기부터 보신다면</b>
        <span>{ios ? '아래 공유 버튼 → 「홈 화면에 추가」 하시면 앱처럼 바로 열립니다.' : '홈 화면에 추가해 두면 오늘의 사정률이 바로 열립니다.'}</span>
      </div>
      {deferred && <button type="button" className="a2b" onClick={add}>추가</button>}
      <button type="button" className="a2x" onClick={close} aria-label="닫기">✕</button>
    </div>
  );
}

