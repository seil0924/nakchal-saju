// lib/gosa.ts — 착공 고사 축문과 고사 날짜(2026-10-27).
//
// 축문 틀은 『가례(家禮)』 치장(治葬) '개영역사후토(開塋域祠后土)' 축문이다(사고전서본 확인).
//   維某年歲月朔日子 某官姓名 敢告於后土氏之神 今爲某官姓名營建宅兆 神其保佑 俾無後艱 謹以淸酌脯醢 祗薦於神 尙饗
// 우리나라 고사·개토제에서는 '敢昭告于 土地之神' 으로 흔히 쓴다. 그 꼴을 따르고, 땅을 여는 까닭(營建宅兆)
// 자리에 공사 이름과 '起工' 을 넣는다. 나머지 글자는 바꾸지 않는다. 지어낸 한문을 보태지 않기 위해서다.
//
// 첫 줄 날짜는 음력으로 쓴다: 維歲次 (그해 태세) (음력 달) (그달 초하루 일진)朔 (음력 날짜) (그날 일진).
import { solarToLunar, lunarToSolar, jdn, GAN, ZHI } from './manse-core';
import { pickWith, type DayPick } from './daypicker-en';

const GAN_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const ZHI_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const NUM_H = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const NUM_K = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];

const dayIdx = (y: number, m: number, d: number) => ((jdn(y, m, d) + 49) % 60 + 60) % 60;
const gjH = (i: number) => GAN[i % 10] + ZHI[i % 12];
const gjK = (i: number) => GAN_KO[i % 10] + ZHI_KO[i % 12];
const yearIdx = (y: number) => { const g = ((y - 4) % 10 + 10) % 10, z = ((y - 4) % 12 + 12) % 12; return { h: GAN[g] + ZHI[z], k: GAN_KO[g] + ZHI_KO[z] }; };

// 1~30 을 한자·한글로. 十一, 二十, 二十一 …
function numH(n: number): string { if (n <= 10) return NUM_H[n]; const t = Math.floor(n / 10), o = n % 10; return (t > 1 ? NUM_H[t] : '') + '十' + (o ? NUM_H[o] : ''); }
function numK(n: number): string { if (n <= 10) return NUM_K[n]; const t = Math.floor(n / 10), o = n % 10; return (t > 1 ? NUM_K[t] : '') + '십' + (o ? NUM_K[o] : ''); }
// 달: 1월은 正月, 6월·10월 한글은 유월·시월로 읽는다
const monthH = (m: number) => (m === 1 ? '正' : numH(m)) + '月';
const monthK = (m: number) => (m === 1 ? '정' : m === 6 ? '유' : m === 10 ? '시' : numK(m)) + '월';
// 날: 초하루~열흘은 初를 붙인다(初一日 … 初十日)
const dayH = (d: number) => (d <= 10 ? '初' : '') + numH(d) + '日';
const dayK = (d: number) => (d <= 10 ? '초' : '') + numK(d) + '일';

export type GosaInput = { ymd: string; company: string; ceo: string; project: string };

export type Chukmun = {
  lunar: { y: number; m: number; d: number; leap: boolean };
  hanja: string[];     // 세로쓰기용 줄
  reading: string[];   // 한글 음독, 줄은 hanja 와 같다
  meaning: string;     // 뜻풀이(현대어)
};

export function chukmun(inp: GosaInput): Chukmun {
  const [y, m, d] = inp.ymd.split('-').map(Number);
  const l = solarToLunar(y, m, d);
  const s1 = lunarToSolar(l.y, l.m, 1, l.leap);
  const sak = dayIdx(s1.y, s1.m, s1.d), today = dayIdx(y, m, d);
  const yr = yearIdx(l.y);
  const company = inp.company.trim() || '○○건설', ceo = inp.ceo.trim() || '○○○', project = inp.project.trim() || '○○○○ 공사';
  const leapH = l.leap ? '閏' : '', leapK = l.leap ? '윤' : '';
  const hanja = [
    `維歲次 ${yr.h} ${leapH}${monthH(l.m)} ${gjH(sak)}朔 ${dayH(l.d)} ${gjH(today)}`,
    `${company} 代表 ${ceo} 敢昭告于`,
    `土地之神 今爲 ${project} 起工`,
    `神其保佑 俾無後艱`,
    `謹以淸酌脯醢 祗薦于神 尙饗`,
  ];
  const reading = [
    `유세차 ${yr.k} ${leapK}${monthK(l.m)} ${gjK(sak)}삭 ${dayK(l.d)} ${gjK(today)}`,
    `${company} 대표 ${ceo} 감소고우`,
    `토지지신 금위 ${project} 기공`,
    `신기보우 비무후간`,
    `근이청작포해 지천우신 상향`,
  ];
  const meaning = `${y}년 ${m}월 ${d}일(음력 ${l.leap ? '윤' : ''}${l.m}월 ${l.d}일), ${company} 대표 ${ceo}${josaGa(ceo)} 이 땅을 지키시는 신께 감히 밝게 아룁니다. ` +
    `이제 이곳에서 ${project}${josaReul(project)} 시작하오니, 신께서 보살펴 뒷날 어려움이 없게 해 주십시오. 맑은 술과 포와 젓갈을 삼가 올리오니 흠향하소서.`;
  return { lunar: l, hanja, reading, meaning };
}

function hasBatchim(w: string) { const c = w.trim().charCodeAt(w.trim().length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0; }
const josaGa = (w: string) => (hasBatchim(w) ? '이' : '가');
const josaReul = (w: string) => (hasBatchim(w) ? '을' : '를');

// 고사 날짜: 건(建)·성(成)·개(開)·정(定). 세우고(建) 이루고(成) 여는(開) 날, 자리가 굳는(定) 날.
// 파·위·폐는 계산에서 아예 나오지 않는다. 손 없는 날(음력 끝자리 9·0)은 따로 표시만 한다.
export const GOSA_OFFICERS = [0, 8, 10, 4];
export type GosaDay = DayPick & { sonEopneun: boolean; lunarLabel: string };
export function gosaDays(from: Date = new Date(), span = 60): GosaDay[] {
  return pickWith(GOSA_OFFICERS, from, span).map(p => {
    const [y, m, d] = p.ymd.split('-').map(Number);
    const l = solarToLunar(y, m, d);
    return { ...p, sonEopneun: l.d % 10 === 9 || l.d % 10 === 0, lunarLabel: `음 ${l.leap ? '윤' : ''}${l.m}.${l.d}` };
  });
}
