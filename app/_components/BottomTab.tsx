'use client';
// 휴대폰 하단 탭 — 모든 화면에서 같은 자리, 같은 다섯 칸.
// 전에는 홈(nav5)·발주처·자리·보관함·더보기·마이페이지가 저마다 탭을 따로 그렸고,
// 나머지 화면엔 아예 없었다. 점신·사주나루·천명처럼 어디서든 엄지 자리에 돌아갈 곳이 보이게 한다.
//
// 결제 막대가 바닥을 차지하는 화면(/reading, /report)은 탭 대신 그 막대를 둔다 —
// 둘을 겹쳐 쌓으면 화면 아래 7분의 1이 막대가 되어 다시 난잡해진다. 데스크톱은 사이드바가 있어 숨긴다.
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HIDE = ['/admin', '/login', '/auth', '/en', '/zh', '/reading', '/report', '/thanks'];

type Item = { href: string; label: string; match: (p: string) => boolean; d?: string; dots?: boolean };
const ITEMS: Item[] = [
  { href: '/', label: '홈', match: p => p === '/', d: 'M4 10.5 12 4l8 6.5V20H4z' },
  { href: '/reading', label: '사주 보기', match: p => p.startsWith('/reading') || p.startsWith('/hoesa') || p.startsWith('/jari'), d: 'M5 4h14v16H5zM9 9h6M9 13h6M9 17h3' },
  { href: '/balju', label: '발주처', match: p => p.startsWith('/balju'), d: 'M4 20V8l8-4 8 4v12M4 20h16M10 20v-5h4v5' },
  { href: '/vault', label: '보관함', match: p => p.startsWith('/vault') || p.startsWith('/mypage'), d: 'M4 8h16v12H4zM4 8l2-3h12l2 3M10 12h4' },
  { href: '/more', label: '더보기', match: p => p.startsWith('/more'), dots: true },
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
