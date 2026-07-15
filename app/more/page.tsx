// 19 · 더보기 (서버 컴포넌트) — 쿠키로 로그인 상태를 먼저 읽어 첫 페인트에 버튼 표시
import { authEnabled, currentUserRole } from '@/lib/supabase/server';
import MoreClient from './MoreClient';

export const dynamic = 'force-dynamic'; // 매 요청 쿠키를 읽어야 하므로 정적화 금지

export default async function More() {
  let initial: { loggedIn: boolean; email?: string; name?: string } = { loggedIn: false };
  if (authEnabled()) {
    try {
      const { user, profile } = (await currentUserRole()) as any;
      if (user) initial = { loggedIn: true, email: profile?.email ?? user.email ?? '', name: profile?.name ?? '' };
    } catch { /* 미인증 처리 */ }
  }
  return <MoreClient initial={initial} />;
}
