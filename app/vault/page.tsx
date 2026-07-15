'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listVault, removeVault, type VaultItem } from '@/lib/vault';

const KIND_LABEL: Record<string, string> = { self: '대표 사주', legal: '법인', client: '발주처', partner: '동업 상대', ally: '상대 회사' };
type Saved = { kind: string; name: string; date: string };

export default function Vault() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [saved, setSaved] = useState<Saved[]>([]);

  useEffect(() => {
    // 리포트 기록: 이 기기 + 서버(로그인 시) 병합
    const local = listVault();
    setItems(local);
    fetch('/api/reports/mine').then(r => r.json()).then(d => {
      const server: VaultItem[] = (d.reports || []).map((r: any) => ({ id: r.id, label: r.label || '리포트', when: 0, unlocked: r.unlocked }));
      const map = new Map<string, VaultItem>();
      [...local, ...server].forEach(x => { const p = map.get(x.id); map.set(x.id, p ? { ...p, unlocked: p.unlocked || x.unlocked } : x); });
      setItems([...map.values()].sort((a, b) => b.when - a.when));
    }).catch(() => {});
    // 저장된 대상
    try { const s = localStorage.getItem('nakchal_saved_targets_v1'); if (s) setSaved(JSON.parse(s)); } catch {}
  }, []);

  const del = (id: string) => { removeVault(id); setItems(listVault()); };

  return (
    <div className="app home">
      <div className="topbar"><Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>보관함</Link><Link className="ic" href="/more" aria-label="메뉴 · 더보기"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link></div>
      <div className="hero"><div className="kick">保 管 函</div><h2 style={{ fontSize: 19 }}>내 리포트와<br />저장된 사주</h2>
        <div style={{ color: '#c3cfe3', fontSize: 12, marginTop: 8, fontWeight: 500 }}>결제한 리포트는 여기서 다시 볼 수 있어요</div>
      </div>

      <div className="sechd"><span className="t"><span className="b" />내 리포트</span><span className="m">{items.length}건</span></div>
      {items.length === 0 && (
        <div className="emptybox">
          <div className="ebseal">封</div>
          <div className="ebtit">아직 열어본 리포트가 없습니다</div>
          <div className="ebtx">대표님의 사주와 오늘의 사정률부터<br />무료로 확인해 보세요.</div>
          <Link className="ebcta" href="/reading">오늘의 전망 열기 <span>· 무료 · 30초 →</span></Link>
        </div>
      )}
      {items.map(it => (
        <Link key={it.id} className="li" href={`/report/${it.id}`}>
          <div className="t"><b>{it.label}</b><span>{it.unlocked ? '✓ 전체 열람됨' : '무료 · 잠긴 섹션 있음'}</span></div>
          <div className="r">다시 보기 ›</div>
        </Link>
      ))}

      <div className="sechd" style={{ marginTop: 16 }}><span className="t"><span className="b" />저장된 사주·대상</span></div>
      {saved.length === 0 && <div className="balnote">리포트에서 대표·발주처·동업 상대를 넣으면 여기에 저장돼 다음에 재사용됩니다.</div>}
      {saved.map((s, i) => (
        <div key={i} className="li" style={{ cursor: 'default' }}>
          <div className="t"><b>{s.name}</b><span>{KIND_LABEL[s.kind] || s.kind} · {s.date}</span></div>
          <div className="r" style={{ background: '#f3ead6', color: '#8a6a2a' }}>저장됨</div>
        </div>
      ))}
      <div className="balnote">데모에서는 이 기기에 저장됩니다. 카카오 로그인을 연결하면 계정별로 기기 간 동기화됩니다.</div>

      <div className="tab">
        <Link href="/"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>홈</Link>
        <Link href="/balju"><svg viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14M3 21h18M9 21v-5h6v5" /></svg>발주처</Link>
        <Link className="fab" href="/reading"><span className="fi">士</span><span className="fl">오늘 전망</span></Link>
        <a className="on"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM4 7l2-3h12l2 3" /></svg>보관함</a>
        <Link href="/more"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>더보기</Link>
      </div>
    </div>
  );
}
