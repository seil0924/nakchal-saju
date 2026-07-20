'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CLIENTS, clientSlug } from '@/lib/clients';
import ScrollReveal from '@/app/_components/ScrollReveal';
import PersonPicker from '@/app/_components/PersonPicker';
import { type Person } from '@/lib/people';

export default function Balju() {
  const [q, setQ] = useState('');
  const router = useRouter();
  const [pick, setPick] = useState<{ name: string; date: string } | null>(null); // 선택된 발주처
  // 발주처 고른 뒤 '본인(대표)' 선택 → 리딩으로 (양쪽 프리필)
  function onSelf(self: Person) {
    if (!pick) return;
    const qs = new URLSearchParams({ cat: 'balju', ck: 'client', cn: pick.name, cd: pick.date, b: self.date, n: self.name || '' });
    router.push(`/reading?${qs.toString()}`);
  }
  const list = CLIENTS.filter(c => c.name.includes(q) || c.cat.includes(q));

  return (
    <div className="app home">
      <ScrollReveal />
      <div className="topbar"><Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>발주처</Link><Link className="ic" href="/more" aria-label="메뉴 · 더보기"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link></div>

      <div className="hero"><div className="kick">發 注 處 宮 合</div>
        <h2 style={{ fontSize: 19 }}>어느 발주처와<br />붙어볼까요</h2>
        <div style={{ color: '#c3cfe3', fontSize: 12, marginTop: 8, fontWeight: 500 }}>발주처 설립일 사주 × 대표님 사주로 궁합을 봅니다</div>
      </div>

      <div className="searchbar">
        <span className="si"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg></span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="발주처 이름·분야로 검색" />
      </div>

      <div className="balist">
        {list.length === 0 && <div className="balnote">‘{q}’에 맞는 발주처가 아직 없습니다. 더 많은 발주처를 계속 추가하고 있어요.</div>}
        {list.map((c, i) => (
          <button key={i} data-reveal className="li" onClick={() => setPick({ name: c.name, date: c.date })}>
            <div className="t"><b>{c.name} {c.core && <span className="corelock">封 핵심</span>}</b><span>{c.date.slice(0, 4)} 설립 · {c.cat}</span></div>
            <div className="r" style={c.core ? undefined : { background: '#eaf3ec', color: '#2f6b42' }}>{c.core ? '🔒 궁합 보기' : '무료 궁합'} ›</div>
          </button>
        ))}
      </div>
      <div className="balnote"><b>封</b> 표시된 <b>핵심 발주처</b>(LH·조달청·도로공사 등 큰 판)의 궁합은 유료입니다. 일반 발주처 궁합은 무료로 열립니다.<br />설립일은 공개 연혁 기준의 자체 구축 DB이며, 더 많은 발주처가 계속 추가됩니다.</div>

      <nav aria-label="발주처별 상세 분석" style={{ padding: '4px 15px 10px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#6b6249', margin: '6px 0 8px' }}>발주처별 상세 분석</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CLIENTS.map(c => (<Link key={c.name} href={`/balju/${clientSlug(c.name)}`} style={{ fontSize: 11.5, fontWeight: 600, color: '#7c7768', background: '#faf6ec', border: '1px solid #e6dcc4', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>{c.name}</Link>))}
        </div>
      </nav>

      <div className="tab">
        <Link className="" href="/"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>홈</Link>
        <a className="on"><svg viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14M3 21h18M9 21v-5h6v5" /></svg>발주처</a>
        <Link className="fab" href="/reading"><span className="fi">士</span><span className="fl">오늘 전망</span></Link>
        <Link href="/vault"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM4 7l2-3h12l2 3" /></svg>보관함</Link>
        <Link href="/more"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>더보기</Link>
      </div>
      <PersonPicker open={!!pick} kind="self" title="궁합 볼 대표를 고르세요" onPick={onSelf} onClose={() => setPick(null)} />
    </div>
  );
}
