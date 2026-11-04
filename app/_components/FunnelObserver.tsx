'use client';
import { useEffect, useRef, useState } from 'react';
import { newJourney, trackFunnel } from '@/lib/funnel-client';
import type { Journey, FunnelEvent } from '@/lib/funnel';
export function useEntryJourney(source: 'ceo' | 'sajang', readyKey: string | null) {
  const [journey, setJourney] = useState<Journey | null>(null);
  const current = useRef<{ key: string; journey: Journey | null } | null>(null);
  useEffect(() => {
    const key = source + ':' + readyKey;
    const j = !readyKey ? null : current.current?.key === key ? current.current.journey : newJourney(source, 'daepyo');
    current.current = { key, journey: j };
    setJourney(j); trackFunnel(j, 'entry_result');
  }, [source, readyKey]);
  return journey;
}
export default function FunnelObserver({ journey, event, children, admin = false }: {
  journey?: Journey | null; event: FunnelEvent; children: React.ReactNode; admin?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el || !journey || admin) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { trackFunnel(journey, event); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el); return () => observer.disconnect();
  }, [journey?.id, event, admin]);
  return <div ref={ref}>{children}</div>;
}
