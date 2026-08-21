'use client';
// 숫자가 0에서 올라간다. 그냥 "71편"이라고 써 두면 안 읽히는데
// 세어 올라가면 눈이 따라가고 규모가 체감된다. 장식이 아니라 전달이 목적이다.
import { useEffect, useRef, useState } from 'react';

type Props = { n: number; ms?: number };

// 끝에서 부드럽게 멎도록 감속만 준다(easeOutCubic).
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export default function CountUp({ n, ms = 1100 }: Props) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // 움직임을 줄이는 설정이거나 관측이 안 되면 그냥 최종값으로 둔다.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { setV(n); return; }

    let raf = 0;
    let finished = false;
    const settle = () => { finished = true; setV(n); };

    const run = () => {
      if (done.current) return;
      done.current = true;
      // 백그라운드 탭에서는 rAF 가 멈춘다. 세다 만 숫자가 0으로 굳으면 안 되니
      // 숨은 상태로 시작하면 애니메이션 없이 최종값을 바로 넣는다.
      if (document.visibilityState === 'hidden') { settle(); return; }
      const t0 = performance.now();
      const step = (now: number) => {
        if (finished) return;
        const p = Math.min(1, (now - t0) / ms);
        setV(Math.round(n * ease(p)));
        if (p < 1) raf = requestAnimationFrame(step); else finished = true;
      };
      raf = requestAnimationFrame(step);
    };

    // 도중에 탭을 벗어났다가 돌아와도 숫자가 어정쩡하게 남지 않게 한다.
    const onHide = () => { if (done.current && !finished && document.visibilityState === 'hidden') settle(); };
    document.addEventListener('visibilitychange', onHide);

    const io = new IntersectionObserver((ents) => {
      for (const e of ents) if (e.isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(node);

    // 이미 화면 안이면 바로 시작
    const r = node.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) { run(); io.disconnect(); }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [n, ms]);

  return <span ref={ref}>{v}</span>;
}
