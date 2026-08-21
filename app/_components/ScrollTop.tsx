'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/track';

// 라우트(경로) 변경 시 두 가지를 한다.
// ① 스크롤을 상단으로 초기화 — 이동 후 이전 스크롤이 남아 빈 화면처럼 보이던 문제 방지
// ② 무엇을 봤는지 익명으로 기록 — 페이지마다 심지 않고 여기 한 곳에서 경로로 판별한다
export default function ScrollTop() {
  const pathname = usePathname();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  useEffect(() => {
    if (!pathname) return;
    if (/^\/(admin|api|auth|login)/.test(pathname)) return;   // 운영자·시스템 화면은 세지 않는다

    const seg = pathname.split('/').filter(Boolean);
    const sub = (i: number) => (seg[i] ? decodeURIComponent(seg[i]) : undefined);

    if (seg.length === 0) track('home');
    else if (seg[0] === 'column' && seg[1]) track('column', sub(1));
    else if (seg[0] === 'balju') track('balju', sub(1));
    else if (seg[0] === 'ceo') track('ceo', sub(1));
    else if (seg[0] === 'reading' || seg[0] === 'report') track('reading');
  }, [pathname]);

  return null;
}
