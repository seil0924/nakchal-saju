import type { Metadata } from 'next';

// 보관함은 이 기기·계정에 저장된 개인 화면이다. 검색에 올릴 이유가 없다.
export const metadata: Metadata = { title: '보관함', robots: { index: false, follow: false } };

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
