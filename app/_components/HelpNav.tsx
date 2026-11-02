import Link from 'next/link';

const LINKS = [
  ['/pricing', '이용안내·요금'],
  ['/faq', '자주 묻는 질문'],
  ['/contact', '문의하기'],
  ['/refund', '환불 안내'],
] as const;

export default function HelpNav({ current }: { current: string }) {
  return <nav className="support-tabs" aria-label="이용안내와 고객센터">
    {LINKS.map(([href, label]) => <Link key={href} href={href} aria-current={current === href ? 'page' : undefined}>{label}</Link>)}
  </nav>;
}
