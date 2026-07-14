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
      // 로그인 후 원래 가려던 경로로 복귀(next)
      const next = new URLSearchParams(window.location.search).get('next') || '/';
      const cb = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      // 카카오는 이메일(account_email) 권한이 검수 전이라 요청에서 제외 — 닉네임만.
      const options: { redirectTo: string; scopes?: string } = { redirectTo: cb };
      if (provider === 'kakao') options.scopes = 'profile_nickname';
      const { error } = await sb.auth.signInWithOAuth({ provider, options });
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

        <div className="loginbtns">
          <button className="lgbtn kakao" onClick={() => oauth('kakao')} disabled={!!busy}>
            <span className="lgic" aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#000" d="M12 3C6.48 3 2 6.48 2 10.8c0 2.77 1.9 5.2 4.76 6.57-.2.72-.72 2.62-.83 3.03-.13.5.18.5.39.36.16-.11 2.6-1.77 3.66-2.49.63.09 1.28.13 1.95.13 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" /></svg>
            </span>
            {busy === 'kakao' ? '카카오로 이동 중…' : '카카오로 3초 만에 시작'}
          </button>
        </div>

        {err && <div className="errbox" style={{ marginTop: 14 }}>{err}</div>}
        {!AUTH_ON && <div className="loginnote">지금은 <b>데모 모드</b>라 로그인 없이도 이용됩니다. 정보는 이 기기에 저장돼요.</div>}

        <div className="loginterms">
          계속하면 <Link href="/terms">이용약관</Link>·<Link href="/privacy">개인정보처리방침</Link>에 동의하는 것으로 봅니다.
        </div>
      </div>
    </div>
  );
}
