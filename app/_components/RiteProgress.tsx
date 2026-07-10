'use client';
// 로딩 리추얼 — 계산 과정을 단계로 보여주는 오버레이 (labor illusion)
// 실제 연산은 즉시 끝나지만, 절차를 보여줄수록 결과의 지각 가치가 올라간다.
import { useEffect, useState } from 'react';

export default function RiteProgress({ open, title, steps, stepMs = 430 }: {
  open: boolean; title: string; steps: string[]; stepMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!open) { setIdx(0); return; }
    let i = 0; let t: ReturnType<typeof setTimeout>;
    const next = () => { i += 1; if (i >= steps.length) return; setIdx(i); t = setTimeout(next, stepMs); };
    t = setTimeout(next, stepMs);
    return () => clearTimeout(t);
  }, [open, steps, stepMs]);
  if (!open) return null;
  const pct = Math.min(94, Math.round(((idx + 0.72) / steps.length) * 100));
  return (
    <div className="riteov" role="status" aria-live="polite">
      <div className="rite">
        <div className="ritevid">
          <video autoPlay muted loop playsInline poster="/ritual-poster.jpg">
            <source src="/ritual.webm" type="video/webm" />
            <source src="/ritual.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="rtitle">{title}</div>
        <div className="rsteps">
          {steps.map((s, i) => (
            <div key={i} className={'rstep' + (i < idx ? ' done' : i === idx ? ' now' : '')}>
              <span className="rdot">{i < idx ? '✓' : ''}</span>{s}
            </div>
          ))}
        </div>
        <div className="rbar"><i style={{ width: pct + '%' }} /></div>
      </div>
    </div>
  );
}
