'use client';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function LogoutButton() {
  async function logout() {
    try { await supabaseBrowser().auth.signOut(); } catch {}
    window.location.href = '/';
  }
  return <button onClick={logout} style={{ color: 'var(--red)', fontWeight: 700 }}>로그아웃</button>;
}
