'use client';
import Link from 'next/link';
import { bizFooterLine } from '@/lib/bizinfo';
import { usePathname } from 'next/navigation';

// 데스크톱(≥900px) 전용 좌측 내비. 모바일에서는 CSS로 숨김.
const NAV = [
  { href: '/', label: '홈', d: 'M3 10.5 12 3l9 7.5V21H3z' },
  // 회사 사주 — 무료 입구이자 사장만 검색하는 자리라 전역에 건다.
  { href: '/hoesa', label: '회사 사주', d: 'M4 21V6l7-3 7 3v15M4 21h14M9 21v-4h4v4M8 10h1M12 10h1M8 14h1M12 14h1' },
  { href: '/balju', label: '발주처', d: 'M3 21V7l9-4 9 4v14M3 21h18M9 21v-5h6v5' },
  { href: '/column', label: '칼럼', d: 'M5 4h9l5 5v11H5zM14 4v5h5M8 13h8M8 16h8' },
  // 택일은 검색으로 들어오는 입구라 사이트 전역에서 한 번씩 걸어 준다.
  { href: '/taekil', label: '택일', d: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4' },
  { href: '/vault', label: '보관함', d: 'M4 7h16v13H4zM4 7l2-3h12l2 3' },
  { href: '/more', label: '더보기', d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z' },
];

// /en/, /zh/ 는 한국어 껍데기를 물려받으면 안 된다. 사정률·투찰은 조달청 복수예비가격이 있어야 성립하는
// 한국 전용 상품이라 바깥에서는 팔지 않는다. 그래서 CTA도 계산기로 보낸다.
type Loc = { brand: string; sub: string; cta: string; ctaHref: string; disc: string; biz: string;
  nav: { href: string; label: string; d: string }[] };
const IC = {
  calc: 'M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2',
  cal: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
  diff: 'M4 6h7v12H4zM13 6h7v12h-7M11 12h2',
};
const LOC: Record<'en' | 'zh', Loc> = {
  en: {
    brand: 'BaZi', sub: 'Four Pillars · true solar time',
    cta: 'Free BaZi calculator', ctaHref: '/en/bazi',
    nav: [
      { href: '/en/bazi', label: 'Calculator', d: IC.calc },
      { href: '/en/date-picker', label: 'Date picker', d: IC.cal },
      { href: '/en/why-charts-differ', label: 'Why charts differ', d: IC.diff },
    ],
    disc: 'For reference and interest. Not professional advice.',
    biz: 'Nine Goods · Daejeon, Korea',
  },
  zh: {
    brand: '八字', sub: '四柱 · 真太陽時',
    cta: '免費八字排盤', ctaHref: '/zh/bazi',
    nav: [
      { href: '/zh/bazi', label: '八字排盤', d: IC.calc },
      { href: '/en/date-picker', label: '擇日 (EN)', d: IC.cal },
      { href: '/zh/why-charts-differ', label: '各家排盤為何不同', d: IC.diff },
    ],
    disc: '僅供參考，非專業建議。',
    biz: 'Nine Goods · 韓國大田',
  },
};

export default function DesktopSidebar() {
  const path = usePathname() || '/';
  const active = (h: string) => (h === '/' ? path === '/' : path.startsWith(h));
  const hideShell = path.startsWith('/admin') || path === '/login' || path === '/signup';
  if (hideShell) return null;

  // 외국어 구역: 같은 .dsidebar 골격을 쓰되 문구와 링크만 갈아끼운다. 레이아웃 그리드가 그대로 유지된다.
  const loc = path.startsWith('/zh') ? LOC.zh : path.startsWith('/en') ? LOC.en : null;
  if (loc) return (
    <aside className="dsidebar" lang={path.startsWith('/zh') ? 'zh-Hant' : 'en'}>
      <Link href={loc.ctaHref} className="dbrand"><span className="ds"><svg viewBox="0 0 40 40" width="24" height="24" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="9" fill="#3f6be0"/><rect x="10" y="19" width="3.8" height="12" rx="1.9" fill="#f2ede0"/><rect x="16" y="14" width="3.8" height="17" rx="1.9" fill="#f2ede0"/><rect x="22" y="17" width="3.8" height="14" rx="1.9" fill="#f2ede0"/><rect x="28" y="11" width="3.8" height="20" rx="1.9" fill="#f2ede0"/><circle cx="29.9" cy="8.2" r="2.6" fill="#b3382c"/></svg></span><span className="dbt">{loc.brand}<small>{loc.sub}</small></span></Link>
      <Link href={loc.ctaHref} className="dcta"><span className="dci">士</span> {loc.cta}</Link>
      <nav className="dnav">
        {loc.nav.map(n => (
          <Link key={n.href} href={n.href} className={'dnavi' + (path === n.href ? ' on' : '')}>
            <svg viewBox="0 0 24 24"><path d={n.d} /></svg>{n.label}
          </Link>
        ))}
      </nav>
      <div className="dfoot">
        <div className="dkick">運 七 技 三</div>
        {loc.disc}
        <div className="dfoot-biz">{loc.biz}</div>
      </div>
    </aside>
  );
  return (
    <aside className="dsidebar">
      <Link href="/" className="dbrand"><span className="ds"><svg viewBox="0 0 40 40" width="24" height="24" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="9" fill="#3f6be0"/><rect x="10" y="19" width="3.8" height="12" rx="1.9" fill="#f2ede0"/><rect x="16" y="14" width="3.8" height="17" rx="1.9" fill="#f2ede0"/><rect x="22" y="17" width="3.8" height="14" rx="1.9" fill="#f2ede0"/><rect x="28" y="11" width="3.8" height="20" rx="1.9" fill="#f2ede0"/><circle cx="29.9" cy="8.2" r="2.6" fill="#b3382c"/></svg></span><span className="dbt">낙찰사주<small>會社 사주 전문</small></span></Link>
      <Link href="/reading" className="dcta"><span className="dci">擇</span> 오늘, 넣을 날인가</Link>
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
        <div className="dlinks"><Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보</Link> · <Link href="/refund">청약철회·환불</Link> · <Link href="/pricing">이용안내</Link></div>
        <div className="dfoot-biz">{bizFooterLine()}</div>
      </div>
    </aside>
  );
}
