import { redirect } from 'next/navigation';
import { authEnabled, isAdmin } from '@/lib/supabase/server';
import AdminSidebar from './AdminSidebar';

// 정적으로 굳으면 빌드 때 한 번 검사하고 끝이라, 로그인 없이도 열린다. 매 요청 검사하도록 못을 박는다.
export const dynamic = 'force-dynamic';

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
