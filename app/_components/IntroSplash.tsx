'use client';
import { useEffect, useLayoutEffect, useState } from 'react';

// 사이트 진입 인트로 — 士 인장이 찍히고 상호가 드러난 뒤 사라진다. 세션당 1회. 전체 화면(레이아웃 최상단에서 렌더).
// 인트로 영상이 준비되면 아래 INTRO_VIDEO 를 '/intro.mp4' 로 바꾸면 영상이 탁 재생됩니다.
const INTRO_VIDEO: string | null = null;
const DURATION = INTRO_VIDEO ? 3400 : 2200; // 영상이면 좀 더 길게

const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function IntroSplash() {
  const [show, setShow] = useState(true);
  const [leave, setLeave] = useState(false);

  useIso(() => {
    try {
      const seen = sessionStorage.getItem('nakchal_intro');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (seen || reduce) { setShow(false); return; }
      sessionStorage.setItem('nakchal_intro', '1');
    } catch { /* SSR/no-storage: 그냥 재생 */ }
  }, []);

  useEffect(() => {
    if (!show) return;
    const t1 = setTimeout(() => setLeave(true), DURATION - 600);
    const t2 = setTimeout(() => setShow(false), DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show]);

  if (!show) return null;
  return (
    <div className={'intro' + (leave ? ' leave' : '') + (INTRO_VIDEO ? ' hasvid' : '')} aria-hidden
      onClick={() => { setLeave(true); setTimeout(() => setShow(false), 450); }}>
      {INTRO_VIDEO && (
        <video className="introvid" autoPlay muted playsInline preload="auto">
          <source src={INTRO_VIDEO} type="video/mp4" />
        </video>
      )}
      <div className="introin">
        <span className="introseal">
          <svg viewBox="0 0 40 40" width="88" height="88">
            <defs>
              <linearGradient id="introinju" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b23a2b" /><stop offset="1" stopColor="#7d1d12" /></linearGradient>
            </defs>
            <rect x="2" y="2" width="36" height="36" rx="9" fill="url(#introinju)" />
            <rect x="2" y="2" width="36" height="36" rx="9" fill="none" stroke="#5c140b" strokeWidth="1" />
            <rect className="introring" x="5" y="5" width="30" height="30" rx="6.5" fill="none" stroke="#e6c680" strokeWidth="1" opacity="0.9" />
            <text x="20" y="21.5" textAnchor="middle" dominantBaseline="central" fontFamily="'Noto Serif KR',serif" fontWeight="900" fontSize="21" fill="#f7ecd4">士</text>
          </svg>
        </span>
        <div className="introttl">낙찰사주</div>
        <div className="introsub">落札四柱 · 會社 사주 전문</div>
        <div className="introrule" />
      </div>
    </div>
  );
}
