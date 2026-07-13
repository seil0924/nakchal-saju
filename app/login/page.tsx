'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';

const AUTH_ON = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Login() {
  const [busy, setBusy] = useState<string>('');
  const [err, setErr] = useState('');

  async function oauth(provider: 'kakao' | 'google') {
    if (!AUTH_ON) { setErr('로그인은 서비스 설정(Supabase·소셜 로그인) 연결 후 활성화됩니다.'); return; }
    setErr(''); setBusy(provider);
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) { setErr('로그인 창을 여는 데 실패했습니다. 잠시 후 다시 시도해 주세요.'); setBusy(''); }
      // 성공 시 브라우저가 소셜 로그인 페이지로 리다이렉트됩니다.
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
        <p className="loginsub">대표님의 사주와 회사 정보를 <b>계정에 저장</b>하고,<br />기기가 바뀌어도 리포트를 이어 보세요.</p>

        <div className="loginbtns">
          <button className="lgbtn kakao" onClick={() => oauth('kakao')} disabled={!!busy}>
            <span className="lgic" aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#000" d="M12 3C6.48 3 2 6.48 2 10.8c0 2.77 1.9 5.2 4.76 6.57-.2.72-.72 2.62-.83 3.03-.13.5.18.5.39.36.16-.11 2.6-1.77 3.66-2.49.63.09 1.28.13 1.95.13 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" /></svg>
            </span>
            {busy === 'kakao' ? '카카오로 이동 중…' : '카카오로 3초 만에 시작'}
          </button>
          <button className="lgbtn google" onClick={() => oauth('google')} disabled={!!busy}>
            <span className="lgic" aria-hidden>
              <svg viewBox="0 0 24 24" width="19" height="19"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" /></svg>
            </span>
            {busy === 'google' ? '구글로 이동 중…' : '구글로 시작'}
          </button>
        </div>

        {err && <div className="errbox" style={{ marginTop: 14 }}>{err}</div>}
        {!AUTH_ON && <div className="loginnote">지금은 <b>데모 모드</b>라 로그인 없이도 이용됩니다. 정보는 이 기기에 저장돼요.</div>}

        <div className="loginterms">
          계속하면 <Link href="/terms">이용약관</Link>·<Link href="/privacy">개인정보처리방침</Link>에 동의하는 것으로 봅니다.
        </div>
        <Link className="loginskip" href="/">로그인 없이 둘러보기 →</Link>
      </div>
    </div>
  );
}
