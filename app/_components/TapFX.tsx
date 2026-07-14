'use client';
import { useEffect } from 'react';

// 인터랙티브 요소를 누르면 그 지점에 금빛 '팡~' 버스트. 요소를 건드리지 않아 안전.
const SEL = 'button, a.li5, a.li, a.ceoband, a.tcta, a.bokline, .cta, .go, .paygo, .pay, .lgbtn, .tunlock, .bokgo, .hcta, .pmrow, .perntog button, .fx, .baljupick, .bjchg';

export default function TapFX() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.(SEL);
      if (!el) return;
      const burst = document.createElement('span');
      burst.className = 'tapfx';
      burst.style.left = e.clientX + 'px';
      burst.style.top = e.clientY + 'px';
      const ring = document.createElement('i');
      burst.appendChild(ring);
      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 560);
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);
  return null;
}
