'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';

// 18 · 투찰 직전 리추얼 (부적 · 주문 · 택시 · 경고)
export default function Ritual() {
  const [done, setDone] = useState(false);
  const amuletRef = useRef<HTMLDivElement>(null);

  // 부적을 PNG로 그려 저장 (배경화면용)
  function saveAmulet() {
    const w = 600, h = 800;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const x = cv.getContext('2d'); if (!x) return;
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a2013'); g.addColorStop(1, '#3a2c19');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#e3c27a'; x.lineWidth = 8; x.strokeRect(24, 24, w - 48, h - 48);
    x.fillStyle = '#e3c27a'; x.textAlign = 'center';
    x.font = '900 190px "Noto Serif KR", serif'; x.fillText('吉', w / 2, h / 2 - 40);
    x.font = '700 66px "Noto Serif KR", serif';
    '落札大吉'.split('').forEach((ch, i) => x.fillText(ch, w / 2, h / 2 + 110 + i * 78 - 120));
    x.font = '500 24px sans-serif'; x.fillStyle = '#c9b184';
    x.fillText('낙찰사주 · 士', w / 2, h - 60);
    const a = document.createElement('a');
    a.href = cv.toDataURL('image/png'); a.download = '낙찰_부적_落札大吉.png'; a.click();
  }

  return (
    <div className="app" style={{ background: 'linear-gradient(180deg,#f6f3ec,#efe7d6)', minHeight: '100vh' }}>
      <div className="topbar" style={{ background: '#2a2013' }}>
        <Link className="logo" href="/" style={{ fontSize: 15, color: '#e3c27a', textDecoration: 'none' }}>
          <span style={{ marginRight: 4 }}>‹</span> 기 모으기
        </Link>
        <div className="ic"><svg viewBox="0 0 24 24" style={{ stroke: '#e3c27a' }}><path d="M4 6h16M4 12h16M4 18h16" /></svg></div>
      </div>

      <div style={{ padding: '0 16px 20px' }}>
        <div className="sechd" style={{ marginTop: 15 }}><span className="t"><span className="b" />오늘의 부적</span><span className="m">투찰 임박</span></div>

        <div className="amulet" ref={amuletRef}><div className="sy">吉</div><div className="tx">落札大吉</div></div>
        <div className="ritsub">길게 눌러 저장하거나 아래 버튼으로 배경화면에 담으십시오</div>
        <button className="sharebtn" style={{ marginTop: 12 }} onClick={saveAmulet}>부적 이미지 저장</button>

        <div className="persona"><div className="av">士</div>
          <p>"<b>마감 10분 전에 기운이 튼다.</b> 조급함을 버리고, 딱 그때 손을 쓰십시오. 서두른 자가 아니라 때를 아는 자가 가져갑니다."</p>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="st"><span className="b" />투찰 택시(擇時)</div>
          <div className="kv"><span className="k">권장 시간대</span><span className="v" style={{ color: 'var(--red)' }}>마감 40분 전 ~ 마감</span></div>
          <div className="kv"><span className="k">피할 시간대</span><span className="v">개시 직후 성급한 투찰</span></div>
          <div className="kv"><span className="k">오늘의 마음가짐</span><span className="v">하한선 사수 · 관망</span></div>
        </div>

        <div className="warn">⚠ 오늘 무리한 저가 투찰은 관재수(官災數)를 부릅니다. 미리 정한 하한선을 반드시 지키십시오.</div>

        <div className={'donebar' + (done ? ' done' : '')} onClick={() => setDone(true)}>
          {done ? '✓ 기 모으기 완료 — 오늘 뜻대로 되시길' : '기 모으기 완료'}
        </div>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link href="/reading" style={{ color: 'var(--navy)', fontSize: 13, fontWeight: 700, textDecoration: 'underline' }}>오늘의 사정률 다시 보기 →</Link>
        </div>
      </div>
    </div>
  );
}
