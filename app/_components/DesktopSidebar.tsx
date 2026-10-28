'use client';
import Link from 'next/link';
import { bizFooterLine } from '@/lib/bizinfo';
import { usePathname } from 'next/navigation';
import BrandMark from './BrandMark';
import { IC, FEATURED, GROUPS, MINE } from '@/lib/nav';

// 데스크톱(≥900px) 전용 좌측 내비. 모바일에서는 CSS로 숨김.
// 홈 목록과 같은 이름·아이콘·묶음으로 보인다(lib/nav, 2026-10-28). 예전엔 '발주처'와 '발주처 사주'처럼 같은 것을 달리 불렀다.
// 회사 사주·택일·발주처는 검색으로 들어오는 입구라 계속 전역에 걸린다. 보관함·리포트 찾기·문의는 결제 뒤 손님이 찾는 자리라 맨 아래 묶음에 둔다.
const SECTIONS: { title: string | null; items: { href: string; label: string; d: string }[] }[] = [
  { title: null, items: [{ href: '/', label: '홈', d: IC.home }] },
  { title: '사주 보기', items: [...FEATURED, ...GROUPS[0].items] },
  ...GROUPS.slice(1).map(g => ({ title: g.title, items: g.items })),
  { title: '내 리포트', items: MINE },
];

// /en/, /zh/ 는 한국어 껍데기를 물려받으면 안 된다. 사정률·투찰은 조달청 복수예비가격이 있어야 성립하는
// 한국 전용 상품이라 바깥에서는 팔지 않는다. 그래서 CTA도 계산기로 보낸다.
type Loc = { brand: string; sub: string; cta: string; ctaHref: string; disc: string; biz: string;
  nav: { href: string; label: string; d: string }[] };
const LIC = {
  calc: 'M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2',
  cal: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
  diff: 'M4 6h7v12H4zM13 6h7v12h-7M11 12h2',
};
const LOC: Record<'en' | 'zh', Loc> = {
  en: {
    brand: 'BaZi', sub: 'Four Pillars · true solar time',
    cta: 'Free BaZi calculator', ctaHref: '/en/bazi',
    nav: [
      { href: '/en/bazi', label: 'Calculator', d: LIC.calc },
      { href: '/en/date-picker', label: 'Date picker', d: LIC.cal },
      { href: '/en/why-charts-differ', label: 'Why charts differ', d: LIC.diff },
    ],
    disc: 'For reference and interest. Not professional advice.',
    biz: 'Nine Goods · Daejeon, Korea',
  },
  zh: {
    brand: '八字', sub: '四柱 · 真太陽時',
    cta: '免費八字排盤', ctaHref: '/zh/bazi',
    nav: [
      { href: '/zh/bazi', label: '八字排盤', d: LIC.calc },
      { href: '/en/date-picker', label: '擇日 (EN)', d: LIC.cal },
      { href: '/zh/why-charts-differ', label: '各家排盤為何不同', d: LIC.diff },
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
      <Link href={loc.ctaHref} className="dbrand"><span className="ds"><BrandMark size={44} /></span><span className="dbt">{loc.brand}<small>{loc.sub}</small></span></Link>
      <Link href={loc.ctaHref} className="dcta"><span className="dci">士</span> {loc.cta}</Link>
      <nav className="dnav">
        {loc.nav.map(n => (
          <Link key={n.href} href={n.href} className={'dnavi' + (path === n.href ? ' on' : '')}>
            <svg viewBox="0 0 24 24"><path d={n.d} /></svg>{n.label}
          </Link>
        ))}
      </nav>
      <div className="dfoot">
        {loc.disc}
        <div className="dfoot-biz">{loc.biz}</div>
      </div>
    </aside>
  );
  return (
    <aside className="dsidebar">
      <Link href="/" className="dbrand"><span className="ds"><BrandMark size={44} /></span><span className="dbt">낙찰사주<small>공공입찰 대표를 위한 사주</small></span></Link>
      <Link href="/reading" className="dcta">오늘, 넣을 날인가 →</Link>
      <nav className="dnav dnav-g">
        {SECTIONS.map((s, i) => (
          <div key={i} className="dgrp">
            {s.title && <div className="dgt">{s.title}</div>}
            {s.items.map(n => (
              <Link key={n.href} href={n.href} className={'dnavi' + (active(n.href) ? ' on' : '')} aria-current={active(n.href) ? 'page' : undefined}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={n.d} /></svg>{n.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="dfoot">
        명리 기반 참고 정보입니다.<br />투찰금액 산정 근거가 아닙니다.
        <div className="dlinks"><Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보</Link> · <Link href="/refund">청약철회·환불</Link> · <Link href="/pricing">이용안내</Link></div>
        <div className="dfoot-biz">{bizFooterLine()}</div>
      </div>
    </aside>
  );
}
