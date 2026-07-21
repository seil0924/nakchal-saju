'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
// 라우트(경로) 변경 시 스크롤을 상단으로 초기화 — 페이지 이동 후 이전 스크롤이 남아 빈 화면처럼 보이던 문제 방지
export default function ScrollTop() {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
