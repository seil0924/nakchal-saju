'use client';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Slide = { src: string; poster: string; kick: string; title: string; href: string };

const BASE_SLIDES: Slide[] = [
  { src: '/hero-1.mp4', poster: '/hero-1-poster.jpg', kick: '運七技三 · 會社 사주 전문', title: '대표와 회사의 사주,<br>그 <b>운칠(運七)</b>을 짚어드립니다', href: '/reading' },
  { src: '/hero-2.mp4', poster: '/hero-2-poster.jpg', kick: '鏡 · 닮은 사주', title: '나와 닮은<br><b>세계적 CEO</b>는 누구일까', href: '/ceo' },
  { src: '/hero-3.mp4', poster: '/hero-3-poster.jpg', kick: '擇 · 오늘의 택일', title: '오늘 이 투찰,<br><b>유리한 날</b>인가', href: '/reading' },
  { src: '/hero-4.mp4', poster: '/hero-4-poster.jpg', kick: '運 · 대표님께', title: '그 일, 대표님<br><b>잘못</b>이 아닙니다', href: '/why' },
  { src: '/hero-5.mp4', poster: '/hero-5-poster.jpg', kick: '曆 · 사업운 캘린더', title: '이달, <b>언제 움직일까</b><br>계약·채용·발표의 날', href: '/reading?cat=calendar' },
  { src: '/hero-1.mp4', poster: '/hero-1-poster.jpg', kick: '正 · 정통 만세력', title: '한 줄의 사정률을 위해,<br><b>십 년</b>을 다듬었습니다', href: '/reading' },
];

const DUR = 3800;

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [SLIDES, setSlides] = useState(BASE_SLIDES);
  // 진입할 때마다 슬라이드 순서 랜덤. paint 직전(useLayoutEffect)에 셔플해 항상 hero-1이 먼저 보이는 문제를 없앰.
  useIso(() => {
    const a = [...BASE_SLIDES];
    for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; }
    setSlides(a); setI(0);
  }, []);
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  const touch = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = (n: number) => setI((n + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    // 활성 슬라이드만 재생
    vids.current.forEach((v, k) => { if (!v) return; if (k === i) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause(); });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => go(i + 1), DUR);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [i]);

  const onStart = (e: React.TouchEvent) => { touch.current = e.touches[0].clientX; };
  const onEnd = (e: React.TouchEvent) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current; touch.current = null;
    if (dx < -40) go(i + 1); else if (dx > 40) go(i - 1);
  };

  return (
    <div className="herocar" onTouchStart={onStart} onTouchEnd={onEnd}>
      {SLIDES.map((s, k) => (
        <Link key={k} href={s.href} className={'hcslide' + (k === i ? ' on' : '')} tabIndex={k === i ? 0 : -1} aria-hidden={k !== i}>
          <video ref={el => { vids.current[k] = el; }} muted loop playsInline preload="metadata" poster={s.poster}>
            <source src={s.src} type="video/mp4" />
          </video>
          <div className="hcin">
            <div className="hckick">{s.kick}</div>
            <h2 className="hctitle" dangerouslySetInnerHTML={{ __html: s.title }} />
            <div className="hcgo">열기 →</div>
          </div>
        </Link>
      ))}
      <div className="hcdots">
        {SLIDES.map((_, k) => (
          <button key={k} className={'hcdot' + (k === i ? ' on' : '')} aria-label={`슬라이드 ${k + 1}`} onClick={() => go(k)} />
        ))}
      </div>
    </div>
  );
}
