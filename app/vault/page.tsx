'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listVault, type VaultItem } from '@/lib/vault';
import { requestJSON } from '@/lib/purchase-client';
import { sget } from '@/lib/scope';
import SiteTop from '@/app/_components/SiteTop';
import SupportLinks from '@/app/_components/SupportLinks';
import '@/app/_components/checkout.css';
import Mascot from '@/app/_components/Mascot';

const KIND_LABEL: Record<string, string> = { self: '대표 사주', legal: '법인', client: '발주처', partner: '동업 상대', ally: '상대 회사' };
type Saved = { kind: string; name: string; date: string };

export default function Vault() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Saved[]>([]);

  useEffect(() => {
    // 리포트 기록: 이 기기 + 서버(로그인 시) 병합
    const local = listVault();
    setItems(local);
    requestJSON('/api/reports/mine').then(({ ok, data: d }) => {
      if (!ok) return;
      const server: VaultItem[] = (d.reports || []).map((r: any) => ({ id: r.id, label: r.label || '리포트', when: 0, unlocked: r.unlocked }));
      const map = new Map<string, VaultItem>();
      [...local, ...server].forEach(x => { const p = map.get(x.id); map.set(x.id, p ? { ...p, unlocked: p.unlocked || x.unlocked } : x); });
      setItems([...map.values()].sort((a, b) => b.when - a.when));
    }).catch(() => {}).finally(() => setLoading(false));
    // 저장된 대상
    try { const s = sget('nakchal_saved_targets_v1'); if (s) setSaved(JSON.parse(s)); } catch {}
  }, []);


  return (
    <div className="app home">
      <SiteTop />
      <div className="hero"><h1>리포트 보관함</h1>
        <div style={{ color: '#c3cfe3', fontSize: 13, marginTop: 8, fontWeight: 500 }}>이 기기에서 열어본 리포트를 이어서 확인하세요</div>
      </div>

      <div className="purchase-notice vault-recovery"><h2>구매했는데 리포트가 안 보이나요?</h2><p>다른 기기에서 결제했거나 브라우저 기록을 지웠다면, 결제할 때 입력한 성함과 휴대폰 번호로 다시 찾을 수 있습니다.</p><div className="purchase-actions"><Link href="/find">구매한 리포트 찾기 →</Link></div></div>
      <div className="sechd"><span className="t"><span className="b" />내 리포트</span><span className="m">{items.length}건</span></div>
      {loading && items.length === 0 && <p role="status" className="balnote">보관한 리포트를 확인하고 있습니다…</p>}
      {!loading && items.length === 0 && (
        <div className="emptybox">
          <Mascot art="opportunity" width={240} className="center pagepic" decorative />
          <div className="ebtit">이 기기에 보관된 리포트가 없습니다</div>
          <div className="ebtx">이미 결제하셨다면 위의 구매 기록 찾기를 이용해주세요.<br />처음이라면 무료 풀이부터 시작할 수 있습니다.</div>
          <Link className="ebcta" href="/reading">새로운 무료 풀이 시작하기 <span>→</span></Link>
        </div>
      )}
      {items.map(it => (
        <Link key={it.id} className="li" href={`/report/${it.id}`}>
          <div className="t"><b>{it.label}</b><span>{it.unlocked ? '구매한 풀이 · 다시 열기' : '무료 결과 · 구매 여부는 열어서 확인'}</span></div>
          <div className="r">다시 보기 ›</div>
        </Link>
      ))}

      {saved.length > 0 && <div className="sechd" style={{ marginTop: 16 }}><span className="t"><span className="b" />저장된 사주·대상</span></div>}
      {saved.map((s, i) => (
        <div key={i} className="li" style={{ cursor: 'default' }}>
          <div className="t"><b>{s.name}</b><span>{KIND_LABEL[s.kind] || s.kind} · {s.date}</span></div>
          <div className="r" style={{ background: '#f4f5f7', color: '#8a6a2a' }}>저장됨</div>
        </div>
      ))}
      <SupportLinks />
      <div className="balnote">결제 내역은 있는데 리포트가 열리지 않으면 <Link href="/contact">문의하기</Link>를 이용해주세요.</div>

    </div>
  );
}
