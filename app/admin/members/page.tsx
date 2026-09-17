export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getStats, listMembers, won } from '@/lib/admin-data';

type M = Awaited<ReturnType<typeof listMembers>>[number];
const FILTERS: [string, string, (m: M) => boolean][] = [
  ['all', '전체', () => true],
  ['paid', '유료', m => m.sub === '유료'],
  ['free', '무료', m => m.sub === '무료'],
  ['social', '카카오·구글', m => m.provider === 'kakao' || m.provider === 'google'],
];

export default async function AdminMembers({ searchParams }: { searchParams?: { f?: string } }) {
  const [all, s] = await Promise.all([listMembers(), getStats()]);
  const f = FILTERS.find(x => x[0] === searchParams?.f) ?? FILTERS[0];
  const mems = all.filter(f[2]);
  return (
    <>
      <div className="atop"><div><h1>회원 관리</h1><div className="sub">전체 회원 {s.members.toLocaleString('ko-KR')}명 · 최근 가입 {all.length}명 표시 · 가입일은 한국시간</div></div></div>
      <div className="abody">
        <div className="filters">
          {FILTERS.map(([k, label, fn]) => (
            <Link key={k} href={k === 'all' ? '/admin/members' : `/admin/members?f=${k}`} className={'fx' + (f[0] === k ? ' on' : '')} style={{ textDecoration: 'none' }}>
              {label} {all.filter(fn).length}
            </Link>
          ))}
        </div>
        <div className="acard">
          <table><tbody>
            <tr><th>회원</th><th>수단</th><th>가입일</th><th>등급</th><th>결제총액</th><th>리포트</th></tr>
            {mems.map((m, i) => (
              <tr key={i}>
                <td className="who">{m.name}<em>{m.email}</em></td>
                <td><span className={'ci ' + m.provider}>{m.provider[0].toUpperCase()}</span></td>
                <td>{m.joined}</td>
                <td><span className={'pill ' + (m.sub === '무료' ? 'free' : 'sub')}>{m.sub}</span></td>
                <td className="amt">{won(m.paidTotal)}</td>
                <td>{m.reports}건</td>
              </tr>
            ))}
            {mems.length === 0 && <tr><td colSpan={6}><div className="empty">해당하는 회원이 없습니다.</div></td></tr>}
          </tbody></table>
        </div>
      </div>
    </>
  );
}
