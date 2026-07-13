// lib/report-categories.ts — 카테고리별 개별 상품(사주아이식)
// 각 카테고리는 자기 섹션(mk)만 보여주고, 자기 가격으로 개별 결제된다.
export type CatKey = 'daepyo' | 'sajeong' | 'balju' | 'gunghap' | 'daeun' | 'calendar';

export type CatInfo = {
  name: string; hanja: string; oh: 'mok' | 'hwa' | 'to' | 'geum' | 'su';
  mks: string[];            // 이 카테고리에 포함되는 섹션 부호
  price: number;            // 개별 결제가
  needs: ('legal' | 'client' | 'partner' | 'ally')[]; // 추가 입력
  kicker: string; lead: string;
};

export const CAT_INFO: Record<CatKey, CatInfo> = {
  daepyo: {
    name: '대표 사주', hanja: '代', oh: 'mok',
    mks: ['器', '鏡', '診', '符', '五', '決', '人', '財', '方', '士'],
    price: 4900, needs: [],
    kicker: '代表 四柱', lead: '대표님이 어떤 그릇으로 태어났는지 — 성정·승부 기질·재물·사람까지 낱낱이.',
  },
  sajeong: {
    name: '사정률 사주', hanja: '率', oh: 'su',
    mks: ['率', '擇'],
    price: 990, needs: [],
    kicker: '査定率 四柱', lead: '오늘 이 투찰, 나에게 유리한 날인가 — 사정률 방향·시진·이달 택일.',
  },
  balju: {
    name: '발주처 사주', hanja: '宮', oh: 'mok',
    mks: ['處'],
    price: 2900, needs: ['client'],
    kicker: '發注處 宮合', lead: '그 발주처, 나와 맞는 판인가 — 설립일 사주로 상성을 봅니다.',
  },
  gunghap: {
    name: '협정·궁합 사주', hanja: '合', oh: 'hwa',
    mks: ['同', '協'],
    price: 4900, needs: ['partner', 'ally'],
    kicker: '同業 · 協定 宮合', lead: '손잡기 전에, 깨질 궁합인지부터 — 대표×대표, 회사×회사.',
  },
  daeun: {
    name: '회사 대운', hanja: '運', oh: 'to',
    mks: ['法', '運'],
    price: 4900, needs: ['legal'],
    kicker: '會社 大運', lead: '회사가 대표님을 밀어주는가 — 법인의 그릇과 년도별 큰 흐름.',
  },
  calendar: {
    name: '사업운 캘린더', hanja: '曆', oh: 'hwa',
    mks: ['曆'],
    price: 2900, needs: [],
    kicker: '事業運 月曆', lead: '이달 — 계약·채용·투자·발표에 좋은 날과, 갈등·지출을 조심할 날을 달력에 짚어 드립니다.',
  },
};

export const isCatKey = (s: any): s is CatKey => typeof s === 'string' && s in CAT_INFO;
export const catPrice = (cat?: string) => (isCatKey(cat) ? CAT_INFO[cat].price : 0);
export const catMks = (cat?: string) => (isCatKey(cat) ? CAT_INFO[cat].mks : null);
