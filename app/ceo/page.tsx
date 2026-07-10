'use client';
import { useState } from 'react';
import Link from 'next/link';
import { EL_HEX } from '@/lib/preview';
import RiteProgress from '@/app/_components/RiteProgress';

const CEO_STEPS = [
  '삼주(三柱) 구성 — 년·월·일',
  '여섯 부호 추출 — 오행·음양·십성·신살',
  '세계 거장 50인 명식과 대조',
];

type Twin = {
  type: string; typeDesc: string; good: string; risk: string; way: string; me: number;
  myeong: string; user: string; biz: string; hope: string;
  myPills: string; myDist: number[]; level: 'twin' | 'near' | 'none'; count: number; matched: string[];
  tycoon: { name: string; en: string; co: string; born: string }; tyPills: string; tyEl: number;
  tyDist: number[]; story: string;
};
const ELC = ['木', '火', '土', '金', '水'];

const LV = (l: Twin['level']) => (l === 'twin' ? '닮은 사주' : l === 'near' ? '가까운 사주' : '결이 비슷한 사주');
// 받침 유무로 와/과 조사 선택
const gwa = (s: string) => { const ch = (s || '').charCodeAt((s || '').length - 1); if (ch < 0xAC00 || ch > 0xD7A3) return '과'; return (ch - 0xAC00) % 28 ? '과' : '와'; };

export default function CeoTwin() {
  const [f, setF] = useState({ name: '', birth: '', cal: 'solar' as 'solar' | 'lunar', leap: false });
  const [res, setRes] = useState<Twin | null>(null);
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: string, v: any) => setF(s => ({ ...s, [k]: v }));
  const seg = (on: boolean) => 'seg-b' + (on ? ' on' : '');

  async function run() {
    setErr('');
    if (!f.birth) { setErr('생년월일을 넣어주세요.'); return; }
    setBusy(true); setRes(null); setProg(true);
    try {
      const minWait = new Promise(r => setTimeout(r, 1650)); // 리추얼 최소 상영
      const r = await fetch('/api/twin', { method: 'POST', body: JSON.stringify({ birth: f.birth, cal: f.cal, leap: f.leap }) });
      if (!r.ok) throw new Error();
      const j = await r.json();
      await minWait;
      setRes(j);
      setTimeout(() => document.getElementById('twinres')?.scrollIntoView({ behavior: 'smooth' }), 60);
    } catch { setErr('결과를 뽑는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.'); }
    finally { setBusy(false); setProg(false); }
  }

  const shareText = res
    ? `[낙찰사주] 나는 ${res.type} — 세계 거장 중 ${res.tycoon.name}${gwa(res.tycoon.name)} ${LV(res.level)}래요${res.count ? ` (겹치는 부호 ${res.count}가지)` : ''}. 대표님도 한번 보시죠:`
    : '';

  // 결과 카드 이미지 생성 (캔버스) — 카톡/인스타 공유용 세로 카드
  async function drawCard(): Promise<Blob | null> {
    if (!res) return null;
    const W = 1080, H = 1350, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d'); if (!x) return null;
    try { await (document as any).fonts?.ready; } catch {}
    const serif = '"Noto Serif KR", serif', sans = '"Pretendard Variable", Pretendard, "Noto Sans KR", sans-serif';
    // 배경(먹빛)
    x.fillStyle = '#181b21'; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,255,255,.03)'; x.font = `900 620px ${serif}`; x.textAlign = 'right';
    x.fillText('士', W + 40, H - 30);
    x.textAlign = 'left';
    const cx = 84;
    // 상단 브랜드/키커
    x.fillStyle = '#d8b25f'; x.font = `700 30px ${sans}`;
    x.fillText('運  七  技  三', cx, 130);
    x.fillStyle = '#9298a4'; x.font = `600 26px ${sans}`; x.textAlign = 'right';
    x.fillText('낙찰사주 · 會社 사주', W - cx, 130); x.textAlign = 'left';
    x.strokeStyle = '#a5862f'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, 165); x.lineTo(cx + 70, 165); x.stroke();
    // 타이틀
    x.fillStyle = '#f2ede0'; x.font = `700 44px ${sans}`;
    x.fillText('나와 닮은 세계적 CEO', cx, 250);
    // 유형(대형)
    x.fillStyle = '#d8b25f'; x.font = `900 150px ${serif}`;
    x.fillText(res.type, cx, 420);
    x.fillStyle = '#c9cdd6'; x.font = `500 34px ${sans}`;
    x.fillText(`${res.typeDesc} 그릇`, cx, 480);
    // 닮은 CEO 카드
    const cardY = 540, cardH = 300;
    x.fillStyle = '#20242c'; roundRect(x, cx, cardY, W - cx * 2, cardH, 26); x.fill();
    const face = 200, fx = cx + 40, fy = cardY + 50;
    x.fillStyle = EL_HEX[res.tyEl] || '#8a8270'; roundRect(x, fx, fy, face, face, 24); x.fill();
    x.fillStyle = '#fff'; x.font = `900 92px ${serif}`; x.textAlign = 'center';
    x.fillText(res.tyPills, fx + face / 2, fy + face / 2 + 34);
    x.textAlign = 'left';
    const tx = fx + face + 44;
    x.fillStyle = '#d8b25f'; x.font = `700 30px ${sans}`;
    x.fillText(LV(res.level), tx, cardY + 70);
    x.fillStyle = '#f4efe3'; x.font = `800 62px ${serif}`;
    x.fillText(res.tycoon.name, tx, cardY + 150);
    x.fillStyle = '#9298a4'; x.font = `600 30px ${sans}`;
    x.fillText(res.tycoon.en, tx, cardY + 200);
    x.fillStyle = '#c98b4a'; x.font = `700 30px ${sans}`;
    x.fillText(res.tycoon.co, tx, cardY + 246);
    // 겹치는 부호 칩
    let chy = cardY + cardH + 80, chx = cx;
    x.font = `700 32px ${sans}`;
    if (res.count) {
      x.fillStyle = '#9298a4'; x.fillText(`겹치는 명식 부호 ${res.count}가지`, cx, chy); chy += 60;
    }
    for (const m of res.matched.slice(0, 4)) {
      const w = x.measureText(m).width + 56;
      x.fillStyle = '#2a2b26'; roundRect(x, chx, chy - 42, w, 60, 30); x.fill();
      x.strokeStyle = '#a5862f'; x.lineWidth = 2; roundRect(x, chx, chy - 42, w, 60, 30); x.stroke();
      x.fillStyle = '#e7cf95'; x.fillText(m, chx + 28, chy);
      chx += w + 18;
      if (chx > W - cx - 200) { chx = cx; chy += 78; }
    }
    // 푸터
    x.fillStyle = '#f2ede0'; x.font = `800 40px ${serif}`;
    x.fillText('나와 닮은 CEO 찾기 — 낙찰사주', cx, H - 150);
    x.fillStyle = '#7f786c'; x.font = `500 26px ${sans}`;
    x.fillText('공개 출생일 기준 · 생시 미상(삼주) · 재미로 보는 유형 비교', cx, H - 100);
    return await new Promise<Blob | null>(r => cv.toBlob(b => r(b), 'image/png', 0.95));
  }

  async function share() {
    if (!res) return;
    const url = `${location.origin}/ceo`;
    const blob = await drawCard();
    const file = blob ? new File([blob], 'nakchal-ceo.png', { type: 'image/png' }) : null;
    try {
      const nav: any = navigator;
      if (file && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ title: '낙찰사주 · 나와 닮은 CEO', text: shareText, url, files: [file] });
        return;
      }
      if (nav.share) { await nav.share({ title: '낙찰사주', text: shareText, url }); return; }
      await navigator.clipboard.writeText(shareText + ' ' + url);
      alert('공유 문구와 링크를 복사했어요. 카톡에 붙여넣어 보내세요.');
    } catch {}
  }

  async function saveImage() {
    const blob = await drawCard(); if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'nakchal-ceo.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  const bridge = `/reading?b=${encodeURIComponent(f.birth)}${f.name ? `&n=${encodeURIComponent(f.name)}` : ''}`;

  return (
    <div className="app">
      <div className="hero">
        <div className="k">運 七 技 三</div>
        <h1>나와 닮은<br />세계적 CEO는?</h1>
        <p style={{ color: '#c3cfe3', marginTop: 10, fontSize: 13.5, lineHeight: 1.7 }}>
          생년월일만 넣으면 30초. 잡스·록펠러·샤넬… 세계 거장 50인 중<br />당신의 사주와 가장 닮은 대표를 찾아 드립니다. <b style={{ color: 'var(--gold2)' }}>무료</b>
        </p>
        <p style={{ marginTop: 8 }}><Link href="/" style={{ color: '#c3cfe3', textDecoration: 'underline' }}>← 홈으로</Link></p>
      </div>

      <div className="wrap">
        <div className="card">
          <label>성함 <span className="opt">(선택)</span></label>
          <input value={f.name} maxLength={12} placeholder="예) 오세일" onChange={e => set('name', e.target.value)} />
          <label>달력</label>
          <div className="seg">
            <button className={seg(f.cal === 'solar')} onClick={() => set('cal', 'solar')}>양력</button>
            <button className={seg(f.cal === 'lunar')} onClick={() => set('cal', 'lunar')}>음력</button>
          </div>
          {f.cal === 'lunar' && (
            <div className="seg" style={{ marginTop: 8 }}>
              <button className={seg(!f.leap)} onClick={() => set('leap', false)}>평달</button>
              <button className={seg(f.leap)} onClick={() => set('leap', true)}>윤달</button>
            </div>
          )}
          <label>생년월일</label>
          <input type="date" value={f.birth} onChange={e => set('birth', e.target.value)} />
          <div className="note">※ 태어난 시간은 몰라도 됩니다(삼주 기준). 닮은 유형만 보는 재미용입니다.</div>
        </div>

        <button className="go" onClick={run} disabled={busy}>{busy ? '거장 50인과 견주는 중…' : '나와 닮은 CEO 찾기 →'}</button>
        {err && <div className="errbox">{err}</div>}

        {res && (
          <div id="twinres" style={{ marginTop: 8 }}>
            {/* 1막 — 거장의 명(命): 명리학 기반 칭찬일색 */}
            <div className="twinlead" style={{ marginTop: 4 }}>
              대표님의 명(命)을 세계 거장 50인과 견줬습니다.<br />
              가장 <b>{LV(res.level)}</b>는 이 사람 — <b>{res.tycoon.name}</b>입니다.
            </div>
            <div className="twincard">
              <div className="tface" style={{ background: EL_HEX[res.tyEl] }}>{res.tyPills}</div>
              <div className="tinfo">
                <div className="tnm">{res.tycoon.name}</div>
                <div className="ten">{res.tycoon.en}</div>
                <div className="tco">{res.tycoon.co}</div>
              </div>
            </div>
            <div className="myeong">
              <div className="myl">命 · {res.type} — {res.typeDesc} 명</div>
              <p>{res.myeong}</p>
              <p className="mys"><b>{res.tycoon.name}</b>이 바로 이 명(命)이었습니다. {res.story}</p>
            </div>

            {/* 2막 — 근거: 명식 대조 (오행이 몇 자씩) */}
            <div className="distcmp">
              <div className="dch">명식 대조 <small>삼주(三柱) 기준 — 오행이 몇 자씩 앉았는가</small></div>
              <div className="dcg">
                <span className="dcl" />
                {ELC.map((e, i) => <span key={i} className="dce" style={{ color: EL_HEX[i] }}>{e}</span>)}
                <span className="dcl">대표님</span>
                {res.myDist.map((n, i) => <span key={i} className={'dcn' + (n === 0 ? ' zero' : '')}>{n}</span>)}
                <span className="dcl">{res.tycoon.name.length > 5 ? res.tycoon.name.slice(0, 5) + '…' : res.tycoon.name}</span>
                {res.tyDist.map((n, i) => <span key={i} className={'dcn' + (n === 0 ? ' zero' : '')}>{n}</span>)}
              </div>
              <p className="dcs">
                이렇게 놓고 보면 두 명식은 <b>{res.matched.join(' · ')}</b>{res.count ? ` — 여섯 부호 중 ${res.count}가지가 겹칩니다.` : '에서 결이 닿습니다.'}
              </p>
            </div>
            {res.matched.length > 0 && (
              <div className="twinchips">{res.matched.map((m, i) => <span key={i} className="twc">{m}</span>)}</div>
            )}

            {/* 3막 — 주인공 전환: 대표님이 그 명입니다 (칭찬 → 회사 연결 → 방향·희망) */}
            <div className="mecard">
              <div className="mel">그리고 — 대표님이 그 명(命)입니다</div>
              <p className="mep">{res.tycoon.name}을 일으킨 그 <b>{ELC[res.me]}의 기운</b>이, 대표님 명식에 같은 뼈대로 앉아 있습니다.</p>
              <p className="mep">{res.user}</p>
              <div className="merule" />
              <p className="mep">{res.biz}</p>
              <p className="mep dim">{res.hope}</p>
            </div>

            {/* 유형 실전 지침 */}
            <div className="cheobang" style={{ marginTop: 14 }}>
              <div className="cbt">{res.type}의 승부 기질 — 실전에서는</div>
              <div className="cbrow"><span className="cbk">강점</span><span className="cbv">{res.good}</span></div>
              <div className="cbrow"><span className="cbk">주의</span><span className="cbv">{res.risk}</span></div>
              <div className="cbrow"><span className="cbk">지침</span><span className="cbv">{res.way}</span></div>
            </div>

            <div className="sharewrap">
              <button className="sharebtn primary" onClick={share}>결과 카드 공유<span style={{ fontWeight: 500, fontSize: 11.5, display: 'block', marginTop: 2 }}>카카오톡 · 인스타</span></button>
              <button className="sharebtn" onClick={saveImage}>카드 저장<span style={{ fontWeight: 500, fontSize: 11.5, display: 'block', marginTop: 2 }}>이미지 파일</span></button>
            </div>

            {/* 미끼 브리지 — 유형은 알려줬지만 '나 개인'은 감춰 갈증을 만든다 */}
            <div className="bridges">
              <div className="bridgehd">그 명(命)이 <b>오늘, 이달, 이 발주처</b>에서 어떻게 흐르는지 — 대표님만의 풀이는 따로 있습니다</div>
              <Link className="bridge" href={bridge}>
                <div className="bi">率</div>
                <div className="bt"><b>오늘, 나의 사정률은 어느 쪽인가</b><span>같은 {res.type}이라도 오늘 일진은 사람마다 다릅니다 · 무료</span></div>
                <div className="ba">→</div>
              </Link>
              <Link className="bridge" href={bridge}>
                <div className="bi">命</div>
                <div className="bt"><b>{res.tycoon.name}{gwa(res.tycoon.name)} 닮은 {res.count}가지, 그리고 다른 것들</b><span>내 여덟 글자 원국·승부 기질·재물운 전체 리포트</span></div>
                <div className="ba">→</div>
              </Link>
              <Link className="bridge" href={bridge}>
                <div className="bi">宮</div>
                <div className="bt"><b>이 유형이 조심할 발주처·파트너</b><span>발주처·동업·협정 궁합으로 손잡기 전 진단</span></div>
                <div className="ba">→</div>
              </Link>
            </div>

            <p className="twinnote" style={{ marginTop: 14 }}>
              ※ 인물 명식은 널리 공개된 출생일 기준이며 생시(生時)는 미상이라 삼주(三柱)로만 계산했습니다. 명식의 구조를 견준 재미용 유형 비교로, 그분들의 삶이나 대표님의 운을 단정하는 것이 아닙니다.
            </p>
          </div>
        )}
        <div className="note" style={{ textAlign: 'center', marginTop: 10 }}>※ 재미로 보는 명리 기반 참고 정보.</div>
      </div>
      <RiteProgress open={prog} title="거장 50인과 견줍니다" steps={CEO_STEPS} stepMs={500} />
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
