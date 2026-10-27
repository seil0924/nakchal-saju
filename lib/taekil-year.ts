// lib/taekil-year.ts — 택일 연도판(/taekil/계약일/2027). 열두 달 맞는 날·피하는 날·공휴일을 한 번에.
//
// 해외 택일 사이트들은 다음 해 페이지를 가을에 미리 깔아 둔다(인도 AstroSage /2027/…, 일본 2027 대안 달력).
// 계산은 앞으로 90일 화면과 같은 pickWith·avoidDays 하나만 쓴다. 날짜가 고정이라 '오늘'에 기대지 않는다.
import { pickWith, avoidDays, type DayPick } from './daypicker-en';
import { taekilBySlug } from './taekil';
import { holidayOn } from './holidays-kr';
import { yearGanji } from './manse-core';

export const TAEKIL_YEARS = [2027];
export const isTaekilYear = (y: number) => Number.isInteger(y) && y >= 2026 && y <= 2030;

export type YearDay = DayPick & { hol: string | null; off: boolean };   // off: 주말이나 공휴일
export type YearMonth = { m: number; good: YearDay[]; avoid: YearDay[]; best: YearDay[] };

const GAN_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const ZHI_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
export function yearName(year: number) {
  const g = yearGanji(year);
  return { hanja: g.hanja, ko: GAN_KO[g.g] + ZHI_KO[g.z] };
}

function tag(d: DayPick): YearDay {
  const hol = holidayOn(d.ymd)?.name ?? null;
  const dow = new Date(d.ymd + 'T00:00:00Z').getUTCDay();
  return { ...d, hol, off: !!hol || dow === 0 || dow === 6 };
}

export function yearData(slug: string, year: number): YearMonth[] | null {
  const t = taekilBySlug(slug);
  if (!t || !isTaekilYear(year)) return null;
  const from = new Date(year - 1, 11, 31);          // pickWith 는 다음 날부터 센다
  const span = Math.round((Date.UTC(year, 11, 31) - Date.UTC(year - 1, 11, 31)) / 86400000);
  const good = pickWith(t.good, from, span).map(tag);
  const avoid = avoidDays(from, span).map(tag);
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const g = good.filter(d => d.month === m);
    // 으뜸날: 그 일에 가장 힘이 실리는 신(good[0])이면서 평일이고 공휴일이 아닌 날
    return { m, good: g, avoid: avoid.filter(d => d.month === m), best: g.filter(d => d.rank === 0 && !d.off) };
  });
}

// 연도판 제목과, 그 일에만 해당하는 실무 질문 하나. 나머지 질문은 다섯 장이 같이 쓴다(YEAR_FAQ).
export const YEAR_COPY: Record<string, { h1: string; faq: { q: string; a: string } }> = {
  계약일: {
    h1: '계약일 택일: 도장 찍기 좋은 날',
    faq: { q: '발주처가 계약일을 정해 버리면 어떻게 하나요?',
      a: '그 날짜는 그대로 두시면 됩니다. 대신 우리 쪽이 정할 수 있는 일이 남습니다. 계약서 검토를 끝내는 날, 내부 결재 날, 하도급이나 공동도급 조건을 확정하는 날입니다. 그런 날을 이 표의 맞는 날에 두고, 서명 당일에는 아래 비교에서 그날 안의 맞는 시간을 고르시면 됩니다.' },
  },
  입찰일: {
    h1: '입찰·투찰 좋은 날',
    faq: { q: '이 표대로 넣으면 낙찰에 유리한가요?',
      a: '아니요. 그렇게 말할 근거가 없습니다. 낙찰은 실적과 적격심사 점수, 그리고 복수예비가격 추첨으로 정해지는 사정률이 가릅니다. 이 표는 서류를 확정하고 제출할 날을 어차피 며칠 안에서 고를 때 쓰는 참고이고, 투찰금액 산정 근거가 아닙니다.' },
  },
  법인설립일: {
    h1: '법인 설립일 · 사업자등록 좋은 날',
    faq: { q: '공휴일이나 주말에 걸린 맞는 날은 어떻게 하나요?',
      a: '관공서가 쉬는 날이라 접수와 처리가 그날 이루어지기 어렵습니다. 그래서 표에 공휴일과 주말을 따로 표시하고, 달마다 맨 위에 평일인 날만 따로 모았습니다. 특정 날짜를 맞추려면 접수일과 처리일이 다를 수 있으니 법무사와 미리 확인하세요.' },
  },
  사무실이전: {
    h1: '사무실 이전 · 이사 좋은 날',
    faq: { q: '이삿짐 옮기는 날과 입주하는 날이 다르면 어느 날을 보나요?',
      a: '짐을 들이는 날을 봅니다. 이전 택일은 새 자리에 기운을 들이는 날이라, 계약일이나 잔금일보다 실제로 짐이 들어가는 날이 기준입니다. 짐이 이틀에 걸치면 첫날을 보시면 됩니다.' },
  },
  개업일: {
    h1: '개업일 택일: 문 여는 날 고르기',
    faq: { q: '가오픈과 정식 개업 중 어느 날을 보나요?',
      a: '처음으로 손님을 받는 날을 봅니다. 가오픈부터 실제로 문을 연다면 가오픈 날이 기준이고, 간판만 미리 달고 영업은 나중이라면 영업을 시작하는 날입니다. 둘 중 우리가 고를 수 있는 날을 맞는 날에 두시면 됩니다.' },
  },
};

export const YEAR_FAQ = (year: number) => [
  { q: `${year}년 표는 어떻게 만들었나요?`,
    a: '그날이 든 절기 구간과 그날의 일지로 건제십이신을 냈습니다. 절기 시각은 표에서 읽지 않고 태양 황경으로 직접 계산했습니다. 공휴일은 관공서 공휴일 규정에 따라 대체공휴일까지 넣었고, 2027년부터 공휴일이 된 노동절과 제헌절도 들어 있습니다. 선거일과 임시공휴일은 미리 알 수 없어 넣지 않았습니다.' },
  { q: '날짜를 바꿀 수 없으면 이 표는 쓸모가 없나요?',
    a: '날짜가 정해져 있어도 그 앞뒤의 일은 대개 우리 쪽이 정합니다. 서류를 확정하는 날, 사람을 만나는 날, 내부에서 결정을 내리는 날입니다. 정해진 날 당일에는 그날 안에서 맞는 시간을 고르는 것이 남은 선택지입니다.' },
  { q: '다른 달력과 날짜가 다른 이유는 무엇인가요?',
    a: '손 없는 날은 음력 끝자리로 보는 다른 계산이라 결과가 다릅니다. 같은 건제십이신이라도 절기가 바뀌는 날 근처에서는 달력마다 하루씩 갈릴 수 있습니다. 이 표는 절기가 드는 시각을 한국 시간으로 계산해 그 경계를 정했습니다.' },
];
