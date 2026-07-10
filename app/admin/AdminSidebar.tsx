'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BASIC = [
  { href: '/admin', label: '대시보드', d: 'M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z' },
  { href: '/admin/members', label: '회원 관리', d: 'M9 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M16 11h5M18.5 8.5v5' },
  { href: '/admin/payments', label: '결제·주문 내역', d: 'M3 6h18v12H3zM3 10h18' },
];
const OWN = [
  { href: '/admin/clients', label: '발주처 DB', d: 'M3 21V7l9-4 9 4v14M3 21h18M9 21v-5h6v5' },
  { href: '/admin/reports', label: '리포트 원문 조회', d: 'M6 2h9l5 5v15H6zM9 12h7M9 16h7' },
];

export default function AdminSidebar() {
  const path = usePathname() || '/admin';
  const on = (h: string) => (h === '/admin' ? path === '/admin' : path.startsWith(h));
  const item = (n: { href: string; label: string; d: string }) => (
    <Link key={n.href} href={n.href} className={'anav' + (on(n.href) ? ' on' : '')}>
      <svg viewBox="0 0 24 24"><path d={n.d} /></svg>{n.label}
    </Link>
  );
  return (
    <aside className="aside">
      <Link href="/admin" className="abrand"><span className="s">士</span><span className="n">낙찰사주<em>ADMIN</em></span></Link>
      <div className="agrp">기본 관리</div>
      {BASIC.map(item)}
      <div className="agrp">낙찰사주 관리</div>
      {OWN.map(item)}
      <div className="afoot"><span className="av">士</span><span>운영자</span></div>
    </aside>
  );
}
