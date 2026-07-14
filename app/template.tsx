'use client';
// 라우트 진입마다 재마운트되어 페이지가 '팡~' 들어온다.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="pagein">{children}</div>;
}
