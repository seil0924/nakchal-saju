// lib/report-categories.ts — 카테고리별 개별 상품(사주아이식)
// 각 카테고리는 자기 섹션(mk)만 보여주고, 자기 가격으로 개별 결제된다.
export type CatKey = 'daepyo' | 'sajeong' | 'balju' | 'gunghap' | 'daeun' | 'calendar' | 'calendar_year' | 'ijeon';

export type CatInfo = {
  name: string; hanja: string; oh: 'mok' | 'hwa' | 'to' | 'geum' | 'su';
  mks: string[];            // 이 카테고리에 포함되는 섹션 부호
  price: number;            // 개별 결제가
  needs: ('legal' | 'client' | 'partner' | 'ally')[]; // 추가 입력
  kicker: string; lead: string;
  // 결제하면 뭘 알게 되는지. 분량("5장·수십항목")이 아니라 내용을 적는다 —
  // 랜딩과 결제 벽에서 같이 쓴다. 전부 실제 섹션(mks)이 내놓는 것만 적을 것.
  gives: string[];
};

export const CAT_INFO: Record<CatKey, CatInfo> = {
  daepyo: {
    name: '대표 사주', hanja: '代', oh: 'mok',
    mks: ['核', '器', '鏡', '診', '軸', '符', '五', '決', '人', '財', '方', '士'],
    price: 19900, needs: [],
    kicker: '代表 四柱', lead: '대표님이 어떤 그릇으로 태어났는지 — 성정·승부 기질·재물·사람까지 낱낱이.',
    gives: [
      '여덟 글자가 어느 오행으로 쏠렸고 어느 자리가 비었는지 — 그 불균형이 사업에 무엇으로 나타나는지',
      '대표님의 승부 기질이 큰 건을 따내는 자리와, 투찰·계약에서 독이 되는 순간',
      '직원·파트너가 대표님을 오해하는 이유와, 곁에 사람을 남기는 법',
      '재물운의 형태 — 벌려서 키우는 쪽인지 쌓는 쪽인지, 돈이 새는 자리는 어디인지',
      '기운을 돋우는 방면과 피할 방면 — 현장·발주처·사무실 자리를 고르는 기준',
    ],
  },
  sajeong: {
    name: '투찰 택일 사주', hanja: '擇', oh: 'su',
    mks: ['率', '擇'],
    price: 9900, needs: [],
    kicker: '投札 擇日', lead: '오늘 이 투찰, 넣을 날인가 미룰 날인가 — 유리·주의 날, 시진, 이달 길일 전체.',
    gives: [
      '이번 달 투찰 길일의 정확한 날짜',
      '그날 안에서도 유리한 시진(時) — 몇 시에 넣을 것인가',
      '피해야 할 날 — 넣지 않는 편이 나은 날짜',
    ],
  },
  balju: {
    name: '발주처 사주', hanja: '宮', oh: 'mok',
    mks: ['處'],
    price: 39000, needs: ['client'],
    kicker: '發注處 宮合', lead: '그 발주처, 나와 맞는 판인가 — 설립일 사주로 상성을 봅니다.',
    gives: [
      '그 발주처와의 삼계(三計) — 붙을 판인지 접을 판인지',
      '실전 시나리오와 미리 잡아야 할 주의 신호',
      '연도별 세운 — 올해가 그 발주처와 열리는 해인지',
    ],
  },
  gunghap: {
    name: '협정·궁합 사주', hanja: '合', oh: 'hwa',
    mks: ['同', '協'],
    price: 19900, needs: ['partner', 'ally'],
    kicker: '同業 · 協定 宮合', lead: '손잡기 전에, 깨질 궁합인지부터 — 대표×대표, 회사×회사.',
    gives: [
      '동업 궁합 — 지분·역할·최종 결정권을 어떻게 나눠야 깨지지 않는지',
      '협정(공동도급) 궁합 — 주관사·지분·관재수까지',
      '도장 찍기 전에 반드시 짚어야 할 점',
    ],
  },
  daeun: {
    name: '회사 대운', hanja: '運', oh: 'to',
    mks: ['法', '運'],
    price: 29000, needs: ['legal'],
    kicker: '會社 大運', lead: '회사가 대표님을 밀어주는가 — 법인의 그릇과 년도별 큰 흐름.',
    gives: [
      '법인 설립일 사주로 본 회사의 그릇 — 회사가 대표님을 받치는지 누르는지',
      '회사가 지금 대운의 어느 길목에 서 있는지',
      '다음 10년, 확장할 때와 정비할 때가 언제로 갈리는지',
    ],
  },
  calendar: {
    name: '사업운 캘린더 · 이달', hanja: '曆', oh: 'hwa',
    mks: ['曆', '曆詳'],
    price: 9900, needs: [],
    kicker: '事業運 月曆', lead: '오늘부터 앞으로 한 달 — 계약·채용·투자·발표에 좋은 날과, 갈등·지출을 조심할 날을 달력에 짚어 드립니다.',
    gives: [
      '오늘부터 30일 중 계약에 최적인 핵심 3일',
      '계약·채용·발표·영업 — 용도별로 갈라 놓은 정확한 날짜',
      '주차별 4주 전략과 피해야 할 날',
    ],
  },
  ijeon: {
    name: '자리 사주', hanja: '宅', oh: 'to',
    mks: ['宅'],
    price: 29000, needs: [],
    kicker: '事務室 移轉 方位', lead: '사무실을 옮기기 전에 — 지금 자리의 문·책상 배치와, 옮길 곳의 방위·거리·이사 택일까지.',
    gives: [
      '지금 자리의 문·책상 배치에서 고칠 곳',
      '옮길 곳의 방위와 거리 — 어느 쪽이 대표님을 받치는지',
      '이사에 좋은 날',
    ],
  },
  calendar_year: {
    name: '사업운 캘린더 · 연간', hanja: '曆', oh: 'hwa',
    mks: ['曆年'],
    price: 29000, needs: [],
    kicker: '事業運 年曆', lead: '올 한 해 12개월 — 밀어주는 달과 조여지는 달을 미리 갈라, 큰 계약·발표·정비의 때를 한눈에 잡아 드립니다.',
    gives: [
      '올 한 해 12개월 — 밀어주는 달과 조여지는 달',
      '큰 계약·발표·정비의 때를 한 해 단위로 잡는 법',
    ],
  },
};

export const isCatKey = (s: any): s is CatKey => typeof s === 'string' && s in CAT_INFO;
export const catPrice = (cat?: string) => (isCatKey(cat) ? CAT_INFO[cat].price : 0);
export const catMks = (cat?: string) => (isCatKey(cat) ? CAT_INFO[cat].mks : null);

// 섹션 부호(mk) → 그 섹션을 파는 개별 상품(카테고리). 묶음('전체 리포트') 없이 낱개로 판다.
const _MK2CAT: Record<string, CatKey> = (() => {
  const m: Record<string, CatKey> = {};
  (Object.keys(CAT_INFO) as CatKey[]).forEach(k => CAT_INFO[k].mks.forEach(mk => { if (!(mk in m)) m[mk] = k; }));
  return m;
})();
// 무료 섹션(器·鏡·診·符 등)도 대표 사주 상품 소속이지만, 잠긴 섹션만 매핑이 쓰인다.
export const catOfMk = (mk: string): CatKey | null => _MK2CAT[mk] ?? null;
export const productOfMk = (mk: string): (CatInfo & { key: CatKey }) | null => {
  const k = _MK2CAT[mk]; return k ? { ...CAT_INFO[k], key: k } : null;
};

// ── 카테고리별 입력/결과 UI 스키마 (reading 폼 단일 소스) ─────────
// 각 카테고리가 "어떤 입력 카드를 보이고 / 무엇을 필수로 요구하고 /
// 결과에서 무엇을 보일지"를 한 곳에서 선언한다.
// 예전엔 reading/page.tsx에 cat=== 조건이 10곳 넘게 흩어져 있었다.
// key '' = 통합(카테고리 미선택) 기본값.
export type LegalMode = 'hidden' | 'show' | 'required';
export type CatRelKind = 'client' | 'partner' | 'ally';
export type CatUI = {
  calToggle: boolean;        // 사업운 캘린더 기간(이달/연간) 토글 카드
  situation: boolean;        // 상황 카드(입찰유형·고민)
  selfImmediate: boolean;    // 대표정보 카드를 birth/bidType 이전에도 노출
  legal: LegalMode;          // 회사정보 카드: 숨김 / 표시 / 필수
  baljuCard: boolean;        // 발주처 선택 카드
  relation: CatRelKind[];    // 관계·궁합 카드 대상(빈 배열이면 카드 숨김)
  yearBar: boolean;          // 결과: 연도(세운) 전환 바
  gauge: boolean;            // 결과: 소수점 정밀 사정률 노출
  requires: 'legal' | 'client' | 'partnerOrAlly' | null; // 제출 필수 조건
};

const CAT_UI_DEFAULT: CatUI = {
  calToggle: false, situation: true, selfImmediate: false, legal: 'show',
  baljuCard: false, relation: ['client', 'partner', 'ally'],
  yearBar: true, gauge: true, requires: null,
};

export const CAT_UI: Record<string, CatUI> = {
  '':             { calToggle: false, situation: true,  selfImmediate: false, legal: 'show',     baljuCard: false, relation: [],                             yearBar: true,  gauge: true,  requires: null },
  daepyo:         { calToggle: false, situation: false, selfImmediate: true,  legal: 'hidden',   baljuCard: false, relation: [],                             yearBar: false, gauge: false, requires: null },
  sajeong:        { calToggle: false, situation: true,  selfImmediate: false, legal: 'hidden',   baljuCard: false, relation: [],                             yearBar: false, gauge: true,  requires: null },
  balju:          { calToggle: false, situation: false, selfImmediate: true,  legal: 'hidden',   baljuCard: true,  relation: [],                             yearBar: true,  gauge: false, requires: 'client' },
  gunghap:        { calToggle: false, situation: false, selfImmediate: true,  legal: 'hidden',   baljuCard: false, relation: ['partner', 'ally'],            yearBar: true,  gauge: false, requires: 'partnerOrAlly' },
  daeun:          { calToggle: false, situation: false, selfImmediate: true,  legal: 'required', baljuCard: false, relation: [],                             yearBar: true,  gauge: false, requires: 'legal' },
  calendar:       { calToggle: true,  situation: false, selfImmediate: true,  legal: 'hidden',   baljuCard: false, relation: [],                             yearBar: false, gauge: false, requires: null },
  ijeon:          { calToggle: false, situation: false, selfImmediate: true,  legal: 'hidden',   baljuCard: false, relation: [],                             yearBar: false, gauge: false, requires: null },
  calendar_year:  { calToggle: true,  situation: false, selfImmediate: true,  legal: 'hidden',   baljuCard: false, relation: [],                             yearBar: false, gauge: false, requires: null },
};

export const catUI = (cat?: string): CatUI => CAT_UI[cat ?? ''] ?? CAT_UI_DEFAULT;
