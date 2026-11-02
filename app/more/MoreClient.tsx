'use client';
import Link from 'next/link';
import { useState } from 'react';
import SiteTop from '@/app/_components/SiteTop';
import { FREE_START, GROUPS, MINE, type NavItem } from '@/lib/nav';
import './menu.css';

function MenuLinks({ items }: { items: NavItem[] }) {
  return <ul className="menu-links">{items.map(n => (
    <li key={n.href}><Link href={n.href}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={n.d} /></svg>
      <span><b>{n.label}</b><small>{n.sub}</small></span><span className="menu-arrow" aria-hidden="true">→</span>
    </Link></li>
  ))}</ul>;
}

export default function MoreClient({ initial }: { initial: { loggedIn: boolean; email?: string; name?: string } }) {
  const [acct, setAcct] = useState(initial.loggedIn ? { email: initial.email, name: initial.name } : null);
  async function logout() {
    try { await fetch('/api/auth/signout', { method: 'POST' }); } catch {}
    setAcct(null);
    window.location.href = '/';
  }
  return (
    <div className="app menu-page">
      <SiteTop />
      <div className="menu-content">
        <header className="menu-heading"><h1>전체 메뉴</h1><p>궁금한 내용에 맞춰 골라보세요. 처음이라면 오늘의 흐름부터 무료로 확인할 수 있습니다.</p></header>
        <Link className="menu-start" href={FREE_START.href}>{FREE_START.label}<span aria-hidden="true">→</span></Link>
        <nav className="menu-jumps" aria-label="분야 바로가기">
          {GROUPS.map(g => <a key={g.key} href={'#' + g.key}>{g.title}</a>)}
          <a href="#reports">내 리포트</a><a href="#help">이용안내·문의</a>
        </nav>
        <nav className="menu-jumps" aria-label="이용안내와 고객센터 바로가기"><Link href="/pricing">처음 이용안내·요금 →</Link><Link href="/faq">자주 묻는 질문 →</Link><Link href="/contact">문의하기 →</Link><Link href="/refund">환불 안내·요청 방법 →</Link></nav>
        <p className="menu-note">서비스마다 무료 열람 범위가 다르며, 상세 풀이의 요금은 각 서비스에서 안내합니다.</p>
        <div className="menu-groups">
          {GROUPS.map(g => (
            <section id={g.key} key={g.key} className="menu-group" aria-labelledby={'menu-' + g.key}>
              <h2 id={'menu-' + g.key}>{g.title}</h2><p>{g.sub}</p><MenuLinks items={g.items} />
            </section>
          ))}
          <section id="reports" className="menu-group" aria-labelledby="menu-reports">
            <h2 id="menu-reports">내 리포트</h2><p>저장한 결과나 구매한 리포트를 다시 볼 때</p>
            <MenuLinks items={MINE.filter(n => n.href === '/vault' || n.href === '/find')} />
            {acct && <div className="menu-account"><span>{acct.name || '대표님'}<small>{acct.email}</small></span><button className="acctbtn ghost" onClick={logout}>로그아웃</button></div>}
          </section>
          <section id="help" className="menu-group" aria-labelledby="menu-help">
            <h2 id="menu-help">이용안내·문의</h2><p>시작 방법·가격·구매 후 다시 보기가 궁금할 때</p>
            <ul className="menu-help-links">
              <li><Link href="/pricing">이용안내·요금 →</Link></li>
              <li><Link href="/samples">리포트 예시 →</Link></li>
              <li><Link href="/faq">자주 묻는 질문 →</Link></li>
              <li><Link href="/method">계산 방법 →</Link></li>
              <li><Link href="/glossary">용어사전 →</Link></li>
              <li><Link href="/why">서비스 소개 →</Link></li>
              <li><Link href="/bokchae">복채 →</Link></li>
              <li><Link href="/contact">문의하기 →</Link></li><li><Link href="/refund">환불 안내·요청 방법 →</Link></li>
            </ul>
          </section>
        </div>
        <footer className="menu-footer"><Link href="/terms">이용약관</Link><Link href="/privacy">개인정보처리방침</Link><Link href="/refund">청약철회·환불</Link><p>명리 기반 참고 정보입니다. 투찰금액 산정 근거가 아닙니다.</p></footer>
      </div>
    </div>
  );
}
