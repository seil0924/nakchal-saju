import { redirect } from 'next/navigation';
import { authEnabled, isAdmin } from '@/lib/supabase/server';
import AdminSidebar from './AdminSidebar';

export const metadata = { title: '관리자 · 낙찰사주' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 인증 설정된 환경에서는 관리자만 접근 (그 외 전부 홈으로)
  if (authEnabled() && !(await isAdmin())) redirect('/');
  return (
    <div className="adminroot">
      <AdminSidebar />
      <div className="amain">{children}</div>
    </div>
  );
}
