// lib/nav.ts — 상품·메뉴 이름과 아이콘의 한 곳(2026-10-28).
// 데스크톱 왼쪽 메뉴와 홈 목록이 같은 상품을 다른 이름·다른 아이콘으로 불렀다('발주처' 대 '발주처 사주', 건물 그림 두 가지).
// 이제 둘 다 여기서 읽는다. 묶음 순서도 같다: 사주 보기 → 날과 자리 → 가볍게 보기.
// 아이콘은 한 스타일(24px 선, 굵기 1.8)로만 그린다.
export const IC = {
  home: 'M4 10.5 12 4l8 6.5V20H4z',
  company: 'M4 20V6l7-2v16M11 9h9v11M7 8h1M7 12h1M7 16h1M14 13h3M14 16h3M3 20h18',
  person: 'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c1.2-3.5 3.9-5.3 7-5.3s5.8 1.8 7 5.3',
  pick: 'M5 6h14v14H5zM8.5 4v4M15.5 4v4M5 10h14M9.5 15l2 2 3.5-3.5',
  client: 'M3 10l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  pair: 'M9 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM15 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  trend: 'M4 18l5-5 4 3 7-8M15 8h5v5',
  cal: 'M5 6h14v14H5zM8.5 4v4M15.5 4v4M5 10h14M8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 16.5h.01M12 16.5h.01',
  day: 'M5 6h14v14H5zM8.5 4v4M15.5 4v4M5 10h14M12 13v4M10 15h4',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  ceo: 'M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 19c.9-2.9 3.2-4.4 6-4.4M17 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 18l2 2',
  boss: 'M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c1.2-3.5 3.9-5.3 7-5.3s5.8 1.8 7 5.3M16.5 3.5l1 1.5 1.7.3-1.2 1.2.3 1.7-1.8-.8',
  column: 'M5 4h9l5 5v11H5zM14 4v5h5M8 13h8M8 16h8',
  vault: 'M4 8h16v12H4zM4 8l2-3h12l2 3M10 12h4',
  find: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
  mail: 'M3 6h18v12H3zM3 6l9 7 9-7',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
} as const;

export type NavItem = { href: string; label: string; sub: string; d: string };
export type NavGroup = { key: string; title: string; items: NavItem[] };

// 처음 온 대표에게 권하는 둘(홈 맨 위 카드). 왼쪽 메뉴에서는 '사주 보기' 맨 앞 두 줄이다.
export const FEATURED: NavItem[] = [
  { href: '/product/taekil', label: '오늘의 투찰 택일', sub: '오늘 넣을 날인지, 30일 안의 길일은 언제인지', d: IC.pick },
  { href: '/product/daepyo', label: '대표 사주', sub: '어떤 그릇의 대표인지: 승부 기질·재물·사람', d: IC.person },
];

export const GROUPS: NavGroup[] = [
  { key: 'saju', title: '사주 보기', items: [
    { href: '/hoesa', label: '회사 사주', sub: '설립일만 넣고 30초', d: IC.company },
    { href: '/balju', label: '발주처 사주', sub: '그 발주처와 맞는 판인가', d: IC.client },
    { href: '/product/gunghap', label: '협정·궁합 사주', sub: '손잡기 전에 깨질 궁합인지', d: IC.pair },
    { href: '/product/daeun', label: '회사 대운', sub: '회사가 대표님을 밀어주는가', d: IC.trend },
  ] },
  { key: 'day', title: '날과 자리', items: [
    { href: '/taekil', label: '택일', sub: '개업·설립·계약·이전·입찰 좋은 날', d: IC.day },
    { href: '/product/calendar', label: '사업운 캘린더', sub: '앞으로 한 달, 움직일 날과 조심할 날', d: IC.cal },
    { href: '/jari', label: '사무실 자리', sub: '옮기기 전에 방위부터', d: IC.compass },
  ] },
  { key: 'light', title: '가볍게 보기', items: [
    { href: '/ceo', label: '닮은 CEO', sub: '거장 111인 중 명식이 닮은 사람', d: IC.ceo },
    { href: '/sajang', label: '대표가 될 사주일까', sub: '대표가 된다면 어떤 대표가 맞는지까지', d: IC.boss },
    { href: '/column', label: '칼럼', sub: '입찰·수주 명리 이야기', d: IC.column },
  ] },
];

// 왼쪽 메뉴 맨 아래 묶음. 홈 목록에는 나오지 않는다(상품이 아니라 내 리포트·도움말 자리).
export const MINE: NavItem[] = [
  { href: '/vault', label: '보관함', sub: '이 기기에 저장한 리포트', d: IC.vault },
  { href: '/find', label: '구매한 리포트 찾기', sub: '다른 기기에서 산 리포트', d: IC.find },
  { href: '/contact', label: '문의하기', sub: '결제 뒤 화면이 이상할 때', d: IC.mail },
  { href: '/more', label: '더보기', sub: '전체 메뉴', d: IC.more },
];
