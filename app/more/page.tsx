'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// 19 · 더보기 · 설정 (프로필 · 회사 · 구독 · 알림)
const NK = 'nakchal_notify_v1';

export default function More() {
  const [notify, setNotify] = useState(true);
  const [prof, setProf] = useState<{ name?: string; corp?: string }>({});
  const [acct, setAcct] = useState<{ email?: string; name?: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);

  async function logout() {
    try { await fetch('/api/auth/signout', { method: 'POST' }); } catch {}
    setAcct(null);
    if (typeof window !== 'undefined') window.location.href = '/';
  }

  useEffect(() => {
    // 로그인 상태는 서버가 쿠키를 읽어 판정 (httpOnly여도 확실)
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d?.loggedIn) setAcct({ email: d.email, name: d.name });
      setAuthReady(true);
    }).catch(() => setAuthReady(true));
    try { setNotify(localStorage.getItem(NK) !== '0'); } catch {}
    try {
      const raw = localStorage.getItem('nakchal_saved_targets_v1');
      if (raw) {
        const arr = JSON.parse(raw);
        const rep = Array.isArray(arr) ? arr.find((t: any) => t.kind === 'legal' || t.corp) : null;
        if (rep) setProf({ corp: rep.name });
      }
    } catch {}
  }, []);

  function toggleNotify() {
    setNotify(v => { const n = !v; try { localStorage.setItem(NK, n ? '1' : '0'); } catch {} return n; });
  }

  return (
    <div className="app home">
      <div className="topbar">
        <div className="logo"><span className="s">士</span>더보기</div>
        <div className="ic"><svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z" /></svg></div>
      </div>

      <div style={{ padding: '0 16px 24px' }}>
        <div className="profcard" style={{ marginTop: 14 }}>
          <div className="pav">士</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pn">{acct?.name ? `${acct.name} 대표님` : prof.name ? `${prof.name} 대표님` : '대표님'}</div>
            <div className="ps">{acct?.email ? acct.email : (prof.corp || '회사 정보 미입력')} · 무료 이용중</div>
          </div>
          {authReady && (acct
            ? <button className="acctbtn ghost" onClick={logout}>로그아웃</button>
            : <Link className="acctbtn" href="/login">로그인</Link>)}
        </div>

        {authReady && !acct && (
          <Link className="loginpromo" href="/login">
            <span className="lpk">계정 연동</span>
            <span className="lpt"><b>로그인하고 내 사주를 계정에 저장</b><em>기기가 바뀌어도 리포트·저장 정보가 그대로 이어집니다</em></span>
            <span className="lpg">→</span>
          </Link>
        )}

        <div className="sechd"><span className="t"><span className="b" />내 정보</span></div>
        <div className="setrow">
          <Link href="/reading">대표 사주 정보<span className="r">입력·수정 ›</span></Link>
          <Link href="/reading">회사(법인) 정보<span className="r">설립일·상호 ›</span></Link>
          <Link href="/reading">회사 주소·방위<span className="r">개운 방위 ›</span></Link>
        </div>

        <div className="sechd"><span className="t"><span className="b" />이용</span></div>
        <div className="setrow">
          <Link href="/vault">결제·주문 내역<span className="r">단건 결제 ›</span></Link>
          <button onClick={toggleNotify}>알림 설정<span className="r">{notify ? '아침 전망·길일 켜짐 ›' : '꺼짐 ›'}</span></button>
          <Link href="/vault">보관함<span className="r">›</span></Link>
          <Link href="/ritual">투찰 부적 리추얼<span className="r">吉 ›</span></Link>
        </div>

        <div className="sechd"><span className="t"><span className="b" />기타</span></div>
        <div className="setrow">
          <Link href="/terms">이용약관 · 면책<span className="r">›</span></Link>
          <Link href="/privacy">개인정보 처리방침<span className="r">›</span></Link>
          <a href="mailto:help@nakchal-saju.example.com">고객센터<span className="r">문의 ›</span></a>
        </div>

        <div className="hdisc" style={{ marginTop: 14 }}>명리 기반 참고 정보 · 투찰금액 산정 근거가 아닙니다</div>
      </div>

      <div className="tab">
        <Link href="/"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>홈</Link>
        <Link href="/balju"><svg viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14M3 21h18M9 21v-5h6v5" /></svg>발주처</Link>
        <Link className="fab" href="/reading"><span className="fi">士</span><span className="fl">오늘 전망</span></Link>
        <Link href="/vault"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM4 7l2-3h12l2 3" /></svg>보관함</Link>
        <a className="on"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>더보기</a>
      </div>
    </div>
  );
}
