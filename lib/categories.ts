// lib/categories.ts — 오행(五行) 색 시스템 + 상품 세일즈 페이지 데이터
// 각 카테고리에 전통 오방색을 입혀 '남색 일변도'를 없애고 정체성을 준다.

export type Ohaeng = { el: string; acc: string };
// 밝은 강조색(어두운 배경 위) — 오방색
export const OHAENG: Record<string, Ohaeng> = {
  mok:  { el: '木', acc: '#46a07d' }, // 청록 — 상생·관계·자람
  hwa:  { el: '火', acc: '#d15c4a' }, // 인주 — 사람·열기
  to:   { el: '土', acc: '#cfa64e' }, // 황금 — 기반·회사
  geum: { el: '金', acc: '#b9b0a0' }, // 백은 — 결단·결실
  su:   { el: '水', acc: '#3f8f80' }, // 먹빛 청 — 흐름·지혜 (남색 아님)
};

export type Product = {
  slug: string; oh: keyof typeof OHAENG; hanja: string; name: string;
  kicker: string; title: string; lead: string;         // title: {b}..{/b}
  pains: string[]; gives: [string, string][];
  href: string; cta: string;                            // 실제 기능 진입
};

export const PRODUCTS: Product[] = [
  {
    slug: 'balju', oh: 'mok', hanja: '宮', name: '발주처 궁합',
    kicker: '發注處 宮合',
    title: '그 발주처, {b}나와 맞는 판인가{/b}',
    lead: '발주처 설립일 사주와 대표님 사주의 상성 — 손대기 전에 봅니다.',
    pains: [
      '견적은 다 맞췄는데, 유독 그 발주처만 인연이 안 닿는다',
      '어떤 발주처는 술술 풀리고, 어떤 데는 매번 애를 먹는다',
      '큰 발주처일수록 궁합도 모른 채 무작정 덤벼왔다',
    ],
    gives: [
      ['발주처 × 대표 상성 점수', '이 발주처가 대표님을 밀어주는 자리인지, 누르는 자리인지'],
      ['이 발주처를 대하는 법', '서류로 다가갈지 관계로 풀지 — 유리한 전략'],
      ['유리한 시점', '이 발주처 건은 언제 넣어야 결이 맞는지'],
    ],
    href: '/reading?cat=balju', cta: '발주처 골라 궁합 보기',
  },
  {
    slug: 'dongup', oh: 'hwa', hanja: '同', name: '동업·협정 궁합',
    kicker: '同業 · 協定 宮合',
    title: '손잡기 전에, {b}깨질 궁합인지{/b}부터',
    lead: '좋은 사람과 좋은 동업은 다릅니다 — 인성이 아니라 명식이 가릅니다.',
    pains: [
      '분명 좋은 사람이었는데, 같이 일하니 사사건건 어긋났다',
      '지분·결정권을 두루뭉술 넘겼다가 뒤가 시끄러웠다',
      '이번 컨소시엄, 사람은 좋은데 어딘가 자꾸 찜찜하다',
    ],
    gives: [
      ['대표 × 대표 동업 궁합', '누가 앞에 서고 누가 받칠지 — 역할·신뢰의 상성'],
      ['지분·결정권 나누는 법', '어떻게 나눠야 위기에 안 깨지는지'],
      ['협정(회사×회사) 관재수', '공동도급 주관사·지분·정산까지 계약 전 진단'],
    ],
    href: '/reading?cat=gunghap', cta: '동업 궁합 보기',
  },
  {
    slug: 'beopin', oh: 'to', hanja: '法', name: '법인 운세',
    kicker: '法人 運勢',
    title: '회사가 대표님을 {b}밀어주는가, 누르는가{/b}',
    lead: '법인 설립일 사주로 회사의 그릇과 10년 흐름을 읽습니다.',
    pains: [
      '대표는 잘하는데, 이상하게 회사 일만 오면 답답하고 눌린다',
      '지금이 회사를 키울 때인지 지킬 때인지 감이 안 잡힌다',
      '설립일 하나가 회사 운을 좌우한다는 걸 몰랐다',
    ],
    gives: [
      ['법인의 그릇 · 대표와의 궁합', '회사가 대표님을 받치는 구조인지 조이는 구조인지'],
      ['회사의 대운 10년 흐름', '지금이 도는 구간인지 눌리는 구간인지, 전환점은 언제인지'],
      ['상호·로고 개운 방위', '부족한 기운을 상호 색·사무실 방위로 채우는 법'],
    ],
    href: '/reading?cat=daeun', cta: '법인 운세 보기',
  },
];

export const productBySlug = (s: string) => PRODUCTS.find(p => p.slug === s) || null;

// 통점 랜딩(/why) 카테고리별 오행색
export const PAIN_OH: Record<string, keyof typeof OHAENG> = {
  haha: 'su',            // 하한가 — 흐름(水)
  'losing-streak': 'to', // 연패 — 버팀·기반(土)
  'big-miss': 'geum',    // 큰 건 — 결실·재물(金)
  partner: 'hwa',        // 동업 — 사람(火)
  gwanjae: 'mok',        // 관재수 — 관계·풀림(木)
  jamin: 'geum', staff: 'hwa', slump: 'to', burnout: 'su', succession: 'mok',
  decision: 'geum', expand: 'hwa', betray: 'hwa', 'money-leak': 'geum',
  health: 'su', timing: 'to', start: 'hwa',
};
