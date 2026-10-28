// lib/saeun-ilgan.ts — 일간별 그해 사업운(/saeobunse/2027/[일간], 2026-10-28).
// 사업운은 12~2월에 검색이 몰린다. 그 전에 깔아 둔다.
// 이름만 바꾼 열 장이 되지 않게, 장마다 실제로 계산한 값이 다르다:
//   그해 천간·지지가 그 일간에게 무슨 별인가, 열두 달 월건이 무슨 별인가, 그래서 움직일 달과 조심할 달이 언제인가.
import { GAN, ZHI, GAN_EL, ZHI_EL, corePillars } from './manse-core';
import { starOf, type Star } from './siksin';
import { YEAR_STAR, stemStar, type Tone } from './ilgan';

const ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const COLOR = ['푸른', '푸른', '붉은', '붉은', '노란', '노란', '흰', '흰', '검은', '검은'];
const KO_G = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const KO_Z = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

export type MonthRow = { from: string; to: string; label: string; ganji: string; star: Star; tone: Tone; head: string };
export type YearReading = {
  year: number; ganji: string; ganjiKo: string; name: string;
  stemStar: Star; branchStar: Star;
  head: string; body: string; branchLine: string;
  months: MonthRow[]; go: MonthRow[]; hold: MonthRow[];
};

export const yearGanji = (y: number) => {
  const g = ((y - 4) % 10 + 10) % 10, z = ((y - 4) % 12 + 12) % 12;
  return { g, z, ganji: GAN[g] + ZHI[z], ko: KO_G[g] + KO_Z[z], name: `${COLOR[g]} ${ANIMAL[z]}의 해` };
};

// 다음 해로 넘어간 달(1월 소한~입춘 전)은 해를 붙인다. 안 붙이면 2028년 1월이 2027년 1월로 읽힌다.
const fmtIn = (year: number) => (t: number) => { const d = new Date(t); return `${d.getUTCFullYear() !== year ? d.getUTCFullYear() + '년 ' : ''}${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`; };

// 그해 입춘부터 다음 해 입춘 전까지, 절기로 바뀌는 열두 달. 날마다 월주를 계산해 바뀌는 날을 찾는다.
export function monthsOf(year: number): { start: number; end: number; g: number; z: number }[] {
  const out: { start: number; end: number; g: number; z: number }[] = [];
  let prev = -1;
  for (let t = Date.UTC(year, 1, 1); t <= Date.UTC(year + 1, 1, 10); t += 86400000) {
    const d = new Date(t);
    const p = corePillars(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 12);
    if (p.mZhi !== prev) {
      if (out.length) out[out.length - 1].end = t - 86400000;
      if (out.length === 12) break;
      if (out.length || p.mZhi === 2) out.push({ start: t, end: t, g: p.mGan, z: p.mZhi });
      prev = p.mZhi;
    }
  }
  return out;
}

const MONTH_HEAD: Record<Star, string> = {
  비견: '경쟁이 붙는 달', 겁재: '지출과 동업을 조심할 달', 식신: '꾸준히 납품하고 실적을 쌓을 달', 상관: '제안과 영업이 잘 풀리고 말조심할 달',
  편재: '큰 기회가 보이는 달', 정재: '수금과 계약 이행이 안정되는 달', 편관: '감사·하자·민원에 대비할 달', 정관: '공공 계약과 등록·인증에 좋은 달',
  편인: '준비하고 검토할 달', 정인: '서류와 인허가가 풀리는 달',
};

export function yearReading(me: number, year: number): YearReading {
  const yg = yearGanji(year);
  const sStar = stemStar(me, yg.g);
  const bStar = starOf(GAN_EL[me], me % 2 === 0, ZHI_EL[yg.z], yg.z % 2 === 0);
  const ys = YEAR_STAR[sStar];
  const fmt = fmtIn(year);
  const months: MonthRow[] = monthsOf(year).map(mo => {
    const st = stemStar(me, mo.g);
    return {
      from: fmt(mo.start), to: fmt(mo.end), label: `${fmt(mo.start)}부터`,
      ganji: GAN[mo.g] + ZHI[mo.z], star: st, tone: YEAR_STAR[st].tone, head: MONTH_HEAD[st],
    };
  });
  return {
    year, ganji: yg.ganji, ganjiKo: yg.ko, name: yg.name,
    stemStar: sStar, branchStar: bStar, head: ys.head, body: ys.body,
    branchLine: `해의 지지 ${ZHI[yg.z]}는 대표님께 ${bStar}입니다. ${YEAR_STAR[bStar].head.replace('해', '흐름')}이 바탕에 깔립니다.`,
    months, go: months.filter(m => m.tone === 'go'), hold: months.filter(m => m.tone === 'hold'),
  };
}

// 일간별 사업운을 깔아 둔 해. 다음 해 장은 가을에 하나씩 더한다.
export const SAEUN_YEARS = [2027];
