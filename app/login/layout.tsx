// page.tsx 가 'use client' 라 metadata 를 여기 둔다.
// 로그인 화면은 제목이 홈과 똑같았고 canonical 도 없어서, 구글이 홈의 사본으로 볼 여지가 있었다.
// 색인은 막는다 — 검색으로 들어올 이유가 없는 화면이다.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인',
  description: '낙찰사주 로그인 — 저장한 명식과 리포트를 보관함에서 다시 보실 수 있습니다.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/login' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
