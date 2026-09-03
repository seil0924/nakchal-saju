
// metadata 는 page.tsx 의 generateMetadata 로 옮겼다 — layout 은 searchParams 를 못 받아서
// ?cat= 별 제목을 만들 수 없었다(회사 대운으로 들어와도 제목이 투찰 택일로 나갔다).

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

