// 홈·PC 메뉴·전체 메뉴가 같은 서비스 이름과 목적별 묶음을 사용한다.
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
  year: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4M8 13.5h8M8 16.5h5',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
} as const;

export type NavItem = { href: string; label: string; sub: string; d: string };
export type NavGroup = { key: string; title: string; sub: string; items: NavItem[] };

export const FREE_START = { href: '/reading?cat=sajeong', label: '오늘의 흐름 무료로 보기' };

// 처음 이용할 때 안내하는 두 서비스. 각 목적별 묶음의 첫 항목이다.
export const FEATURED: NavItem[] = [
  { href: '/product/taekil', label: '오늘의 투찰 택일', sub: '내 생년월일로 오늘의 해석과 7일 흐름 확인', d: IC.pick },
  { href: '/product/daepyo', label: '대표 사주', sub: '생년월일로 보는 대표의 성향·재물·사람 관계', d: IC.person },
];

export const GROUPS: NavGroup[] = [
  { key: 'day', title: '오늘·날짜 보기', sub: '오늘의 흐름이나 개업·계약 날짜가 궁금할 때', items: [
    FEATURED[0],
    { href: '/taekil', label: '개업·계약 택일', sub: '개업·설립·계약·이전·입찰 날짜 고르기', d: IC.day },
    { href: '/today', label: '일간별 오늘 운세', sub: '나의 일간에 해당하는 공통 운세 읽기', d: IC.sun },
    { href: '/product/calendar', label: '사업운 캘린더', sub: '한 달의 사업 흐름을 달력으로 확인', d: IC.cal },
    { href: '/saeobunse/2027', label: '2027 사업운', sub: '일간별 열두 달의 사업 흐름 읽기', d: IC.year },
  ] },
  { key: 'saju', title: '대표·회사 분석', sub: '나의 성향과 회사의 흐름을 알고 싶을 때', items: [
    FEATURED[1],
    { href: '/hoesa', label: '회사 사주', sub: '설립일로 보는 회사의 성향과 흐름', d: IC.company },
    { href: '/product/daeun', label: '회사 대운', sub: '대표와 회사의 장기적인 흐름 함께 보기', d: IC.trend },
  ] },
  { key: 'relation', title: '관계·궁합 보기', sub: '발주처나 함께 일할 상대와의 관계가 궁금할 때', items: [
    { href: '/balju', label: '발주처 사주', sub: '발주처를 찾아 성향과 나와의 궁합 확인', d: IC.client },
    { href: '/product/gunghap', label: '협정·궁합 사주', sub: '협정·동업 상대와의 성향과 관계 살펴보기', d: IC.pair },
  ] },
  { key: 'light', title: '가볍게 보기·읽을거리', sub: '사주를 더 알아보고 싶을 때', items: [
    { href: '/ceo', label: '닮은 CEO', sub: '거장 111인 중 명식이 닮은 사람', d: IC.ceo },
    { href: '/sajang', label: '대표가 될 사주일까', sub: '대표가 된다면 어떤 대표가 맞는지까지', d: IC.boss },
    { href: '/jari', label: '사무실 자리', sub: '사무실 방위와 이전 날짜 살펴보기', d: IC.compass },
    { href: '/column', label: '칼럼', sub: '입찰·수주 명리 이야기', d: IC.column },
  ] },
];

// 왼쪽 메뉴 맨 아래 묶음. 홈 목록에는 나오지 않는다(상품이 아니라 내 리포트·도움말 자리).
export const MINE: NavItem[] = [
  { href: '/vault', label: '내 리포트 보관함', sub: '이 기기에 저장한 리포트', d: IC.vault },
  { href: '/find', label: '구매한 리포트 찾기', sub: '다른 기기에서 산 리포트', d: IC.find },
  { href: '/pricing', label: '이용안내·요금', sub: '무료 시작부터 구매 후 다시 보기까지', d: IC.column },
  { href: '/faq', label: '자주 묻는 질문', sub: '입력·결제·다시 보기 도움말', d: IC.find },
  { href: '/contact', label: '문의하기', sub: '결제·환불·풀이·오류 도움받기', d: IC.mail },
  { href: '/refund', label: '환불 안내', sub: '상황별 기준과 요청 방법', d: IC.mail },
  { href: '/more', label: '전체 메뉴', sub: '모든 서비스와 이용안내', d: IC.more },
];
