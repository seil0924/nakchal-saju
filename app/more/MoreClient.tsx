'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { sget } from '@/lib/scope';

// 19 · 더보기 · 설정 (프로필 · 회사 · 구독 · 알림)
// 로그인 상태(initial)는 서버가 쿠키를 읽어 미리 판정 → 첫 페인트에 로그아웃/로그인 버튼 즉시 표시(지연 팝인 제거)
const NK = 'nakchal_notify_v1';

export default function MoreClient({ initial }: { initial: { loggedIn: boolean; email?: string; name?: string } }) {
  const [notify, setNotify] = useState(true);
  const [prof, setProf] = useState<{ name?: string; corp?: string }>({});
  const [acct, setAcct] = useState<{ email?: string; name?: string } | null>(
    initial.loggedIn ? { email: initial.email, name: initial.name } : null,
  );

  async function logout() {
    try { await fetch('/api/auth/signout', { method: 'POST' }); } catch {}
    setAcct(null);
    if (typeof window !== 'undefined') window.location.href = '/';
  }

  useEffect(() => {
    try { setNotify(localStorage.getItem(NK) !== '0'); } catch {}
    try {
      const raw = sget('nakchal_saved_targets_v1');
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
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>더보기</Link>
        <div className="ic"><svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z" /></svg></div>
      </div>

      <div style={{ padding: '0 16px 24px' }}>
        <div className="profcard" style={{ marginTop: 14 }}>
          <div className="pav">士</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pn">{acct?.name ? `${acct.name} 대표님` : prof.name ? `${prof.name} 대표님` : '대표님'}</div>
            <div className="ps">{acct?.email ? acct.email : (prof.corp || '회사 정보 미입력')} · 무료 이용중</div>
          </div>
          {acct
            ? <button className="acctbtn ghost" onClick={logout}>로그아웃</button>
            : <Link className="acctbtn" href="/login">로그인</Link>}
        </div>

        {!acct && (
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
          <Link href="/vault">보관함 · 내 리포트<span className="r">›</span></Link>
        </div>

        <div className="sechd"><span className="t"><span className="b" />읽을거리</span></div>
        <div className="setrow">
          <Link href="/column">사주 칼럼<span className="r">입찰·수주 명리 이야기 ›</span></Link>
        </div>

        <div className="sechd"><span className="t"><span className="b" />기타</span></div>
        <div className="setrow">
          <Link href="/terms">이용약관 · 면책<span className="r">›</span></Link>
          <Link href="/privacy">개인정보 처리방침<span className="r">›</span></Link>
          <Link href="/refund">청약철회·환불 안내<span className="r">›</span></Link>
          <a href="mailto:ohselie24@naver.com">고객센터<span className="r">문의 ›</span></a>
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
