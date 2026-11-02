'use client';
// 휴대폰 하단 탭: 홈·무료 시작·내 리포트·전체 메뉴의 네 칸.
// 전에는 홈(nav5)·발주처·자리·보관함·더보기·마이페이지가 저마다 탭을 따로 그렸고,
// 나머지 화면엔 아예 없었다. 점신·사주나루·천명처럼 어디서든 엄지 자리에 돌아갈 곳이 보이게 한다.
//
// 결제 막대가 바닥을 차지하는 화면(/reading, /report)은 탭 대신 그 막대를 둔다 —
// 둘을 겹쳐 쌓으면 화면 아래 7분의 1이 막대가 되어 다시 난잡해진다. 데스크톱은 사이드바가 있어 숨긴다.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FREE_START, IC } from '@/lib/nav';

const HIDE = ['/admin', '/login', '/auth', '/en', '/zh', '/reading', '/report', '/thanks'];

type Item = { href: string; label: string; match: (p: string) => boolean; d?: string; dots?: boolean };
const ITEMS: Item[] = [
  { href: '/', label: '홈', match: p => p === '/', d: 'M4 10.5 12 4l8 6.5V20H4z' },
  { href: FREE_START.href, label: '무료 시작', match: p => p === '/reading', d: IC.pick },
  { href: '/vault', label: '내 리포트', match: p => p.startsWith('/vault') || p.startsWith('/mypage') || p === '/find', d: IC.vault },
  { href: '/more', label: '전체 메뉴', match: p => p === '/more', dots: true },
];

export default function BottomTab() {
  const path = usePathname() || '/';
  if (HIDE.some(h => path === h || path.startsWith(h + '/'))) return null;
  return (
    <nav className="btab" aria-label="주요 메뉴">
      {ITEMS.map(it => {
        const on = it.match(path);
        return (
          <Link key={it.href} href={it.href} className={on ? 'on' : undefined} aria-current={on ? 'page' : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {it.dots
                ? <><circle className="dot" cx="5.5" cy="12" r="1.9" /><circle className="dot" cx="12" cy="12" r="1.9" /><circle className="dot" cx="18.5" cy="12" r="1.9" /></>
                : <path d={it.d} />}
            </svg>
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
