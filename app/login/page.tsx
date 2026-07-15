'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';

const AUTH_ON = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Login() {
  const [busy, setBusy] = useState<string>('');
  const [err, setErr] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');

  function nextPath() {
    return new URLSearchParams(window.location.search).get('next') || '/';
  }

  async function oauth(provider: 'kakao' | 'google') {
    if (!AUTH_ON) { setErr('로그인은 서비스 설정(Supabase·소셜 로그인) 연결 후 활성화됩니다.'); return; }
    setErr(''); setMsg(''); setBusy(provider);
    try {
      const sb = supabaseBrowser();
      const cb = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`;
      const options: { redirectTo: string; scopes?: string } = { redirectTo: cb };
      if (provider === 'kakao') options.scopes = 'profile_nickname';
      const { error } = await sb.auth.signInWithOAuth({ provider, options });
      if (error) { setErr('로그인 창을 여는 데 실패했습니다. 잠시 후 다시 시도해 주세요.'); setBusy(''); }
    } catch { setErr('로그인 처리 중 문제가 생겼습니다.'); setBusy(''); }
  }

  // 비회원(게스트) — 익명 세션으로 바로 시작. 결제·저장은 이 세션에 귀속됩니다.
  async function guest() {
    if (!AUTH_ON) { window.location.href = nextPath(); return; }
    setErr(''); setMsg(''); setBusy('guest');
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInAnonymously();
      if (error) { setErr('비회원 시작에 실패했습니다. 잠시 후 다시 시도해 주세요.'); setBusy(''); return; }
      window.location.href = nextPath();
    } catch { setErr('비회원 시작 중 문제가 생겼습니다.'); setBusy(''); }
  }

  // 이메일 자체 로그인/가입
  async function emailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!AUTH_ON) { setErr('이메일 로그인은 서비스 설정(Supabase) 연결 후 활성화됩니다.'); return; }
    if (!email.trim() || pw.length < 6) { setErr('이메일과 6자 이상 비밀번호를 입력해 주세요.'); return; }
    setErr(''); setMsg(''); setBusy('email');
    try {
      const sb = supabaseBrowser();
      if (mode === 'signup') {
        const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`;
        const { data, error } = await sb.auth.signUp({ email: email.trim(), password: pw, options: { emailRedirectTo } });
        if (error) { setErr(error.message.includes('registered') ? '이미 가입된 이메일입니다. 로그인해 주세요.' : '가입에 실패했습니다. 잠시 후 다시 시도해 주세요.'); setBusy(''); return; }
        if (data.session) { window.location.href = nextPath(); return; }
        setMsg('확인 메일을 보냈어요. 메일의 링크를 눌러 가입을 완료해 주세요.'); setBusy('');
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) { setErr('이메일 또는 비밀번호가 올바르지 않습니다.'); setBusy(''); return; }
        window.location.href = nextPath();
      }
    } catch { setErr('로그인 처리 중 문제가 생겼습니다.'); setBusy(''); }
  }

  return (
    <div className="app login-app">
      <div className="loginwrap">
        <div className="loginseal">
          <svg viewBox="0 0 40 40" width="60" height="60">
            <defs><linearGradient id="lginju" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b23a2b" /><stop offset="1" stopColor="#7d1d12" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#lginju)" />
            <rect x="5" y="5" width="30" height="30" rx="7" fill="none" stroke="#e6c680" strokeWidth="1" opacity="0.9" />
            <text x="20" y="21.5" textAnchor="middle" dominantBaseline="central" fontFamily="'Noto Serif KR',serif" fontWeight="900" fontSize="21" fill="#f7ecd4">士</text>
          </svg>
        </div>
        <h1 className="logintitle">낙찰사주</h1>

        <div className="loginbtns">
          <button className="lgbtn kakao" onClick={() => oauth('kakao')} disabled={!!busy}>
            <span className="lgic" aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#000" d="M12 3C6.48 3 2 6.48 2 10.8c0 2.77 1.9 5.2 4.76 6.57-.2.72-.72 2.62-.83 3.03-.13.5.18.5.39.36.16-.11 2.6-1.77 3.66-2.49.63.09 1.28.13 1.95.13 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" /></svg>
            </span>
            {busy === 'kakao' ? '카카오로 이동 중…' : '카카오로 3초 만에 시작'}
          </button>
          <button className="lgbtn guest" onClick={guest} disabled={!!busy}>
            {busy === 'guest' ? '시작하는 중…' : '비회원으로 바로 시작'}
          </button>
        </div>

        <div className="logindiv"><span>또는 이메일로</span></div>

        <form className="loginemail" onSubmit={emailAuth}>
          <input className="lgin" type="email" inputMode="email" autoComplete="email" placeholder="이메일 주소"
            value={email} onChange={e => setEmail(e.target.value)} disabled={!!busy} />
          <input className="lgin" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder="비밀번호 (6자 이상)"
            value={pw} onChange={e => setPw(e.target.value)} disabled={!!busy} />
          <button className="lgbtn email" type="submit" disabled={!!busy}>
            {busy === 'email' ? '처리 중…' : mode === 'signup' ? '이메일로 가입하기' : '이메일로 로그인'}
          </button>
        </form>
        <div className="loginswitch">
          {mode === 'signin'
            ? <>계정이 없으신가요? <button type="button" onClick={() => { setMode('signup'); setErr(''); setMsg(''); }}>이메일로 가입</button></>
            : <>이미 계정이 있으신가요? <button type="button" onClick={() => { setMode('signin'); setErr(''); setMsg(''); }}>로그인</button></>}
        </div>

        {msg && <div className="loginok">{msg}</div>}
        {err && <div className="errbox" style={{ marginTop: 14 }}>{err}</div>}
        {!AUTH_ON && <div className="loginnote">지금은 <b>데모 모드</b>라 로그인 없이도 이용됩니다. 정보는 이 기기에 저장돼요.</div>}

        <div className="loginterms">
          계속하면 <Link href="/terms">이용약관</Link>·<Link href="/privacy">개인정보처리방침</Link>에 동의하는 것으로 봅니다.
        </div>
      </div>
    </div>
  );
}
