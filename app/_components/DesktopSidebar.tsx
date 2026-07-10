'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 데스크톱(≥900px) 전용 좌측 내비. 모바일에서는 CSS로 숨김.
const NAV = [
  { href: '/', label: '홈', d: 'M3 10.5 12 3l9 7.5V21H3z' },
  { href: '/balju', label: '발주처', d: 'M3 21V7l9-4 9 4v14M3 21h18M9 21v-5h6v5' },
  { href: '/vault', label: '보관함', d: 'M4 7h16v13H4zM4 7l2-3h12l2 3' },
  { href: '/more', label: '더보기', d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z' },
];

export default function DesktopSidebar() {
  const path = usePathname() || '/';
  const active = (h: string) => (h === '/' ? path === '/' : path.startsWith(h));
  return (
    <aside className="dsidebar">
      <Link href="/" className="dbrand"><span className="ds">士</span><span className="dbt">낙찰사주<small>會社 사주 전문</small></span></Link>
      <Link href="/reading" className="dcta"><span className="dci">士</span> 오늘의 사정률 전망</Link>
      <nav className="dnav">
        {NAV.map(n => (
          <Link key={n.href} href={n.href} className={'dnavi' + (active(n.href) ? ' on' : '')}>
            <svg viewBox="0 0 24 24"><path d={n.d} /></svg>{n.label}
          </Link>
        ))}
      </nav>
      <div className="dfoot">
        <div className="dkick">運 七 技 三</div>
        명리 기반 참고 정보입니다.<br />투찰금액 산정 근거가 아닙니다.
        <div className="dlinks"><Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보</Link></div>
      </div>
    </aside>
  );
}
