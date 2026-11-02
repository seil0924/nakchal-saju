import Link from 'next/link';
import { supportHref } from '@/lib/support';
import '@/app/contact/support.css';

export default function SupportLinks({ reportId }: { reportId?: string }) {
  return <nav className="support-inline no-print" aria-label="문의와 환불 안내"><Link href={supportHref('pay', reportId)}>문의하기</Link><Link href="/refund">환불 기준·요청 방법</Link></nav>;
}
