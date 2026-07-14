'use client';
import { useEffect, useLayoutEffect } from 'react';

// 스크롤 진입 시 요소를 부드럽게 드러낸다. [data-reveal] 요소에 .in 을 붙인다.
// JS가 없거나 IO 미지원이면 전부 보이게(안전). 이미 보이는 건 즉시 표시(플래시 없음).
const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function ScrollReveal() {
  useIso(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!els.length) return;
    const root = document.documentElement;
    root.classList.add('reveal-on');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const vh = window.innerHeight;
    const io = new IntersectionObserver((ents) => {
      ents.forEach(en => { if (en.isIntersecting) { (en.target as HTMLElement).classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px 6% 0px', threshold: 0.01 });
    els.forEach(e => {
      const top = e.getBoundingClientRect().top;
      if (top < vh * 0.94) e.classList.add('in'); // 첫 화면에 이미 보이면 즉시
      else io.observe(e);
    });
    // 안전장치: 스크롤이 끝까지 갔는데 아직 숨은 게 있으면 드러낸다
    const safety = () => {
      if (Math.ceil(window.innerHeight + window.scrollY) >= document.body.scrollHeight - 4) {
        els.forEach(e => e.classList.add('in'));
        window.removeEventListener('scroll', safety);
      }
    };
    window.addEventListener('scroll', safety, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', safety); };
  }, []);
  return null;
}
