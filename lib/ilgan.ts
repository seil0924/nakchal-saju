// lib/ilgan.ts — 일간 열 개와, 그 일간에게 어떤 기운이 오면 사업에 무엇이 되는가(2026-10-28).
// /today/[일간](오늘의 투찰 운세)과 /saeobunse/2027/[일간](2027 사업운)이 같이 쓴다.
// 일간만 보는 계산이다. 일지·월지까지 넣은 판정은 생년월일을 받는 상품에서 한다. 화면에도 그렇게 적는다.
import { GAN_EL } from './manse-core';
import { starOf, type Star } from './siksin';

export type Ilgan = { idx: number; slug: string; ko: string; hanja: string; el: string; image: string };

const HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const EL_KO = ['목', '화', '토', '금', '수'];
// 그림 한 줄. lib/seo-concepts 의 일간 설명과 같은 이미지를 쓴다.
const IMAGE = ['곧게 뻗는 큰 나무', '휘어 감는 덩굴', '하늘의 태양', '어둠을 밝히는 촛불', '움직이지 않는 큰 산',
  '곡식을 키우는 밭', '단단한 무쇠', '다듬은 보석', '넓은 바다', '스며드는 비'];

export const ILGAN: Ilgan[] = HANJA.map((h, i) => ({
  idx: i, slug: KO[i] + EL_KO[GAN_EL[i]], ko: KO[i], hanja: h, el: EL_KO[GAN_EL[i]], image: IMAGE[i],
}));
export const ilganBySlug = (s: string) => ILGAN.find(x => x.slug === s) ?? null;

// 일간 me 에게 천간 g 가 무슨 별인가(음양까지 본다).
export const stemStar = (me: number, g: number): Star => starOf(GAN_EL[me], me % 2 === 0, GAN_EL[g], g % 2 === 0);

export type Tone = 'go' | 'mid' | 'hold';

// 한 해·한 달 단위로 그 별이 오면 사업에 무엇이 되는가. 결과를 약속하지 않고, 할 일로 적는다.
export const YEAR_STAR: Record<Star, { tone: Tone; head: string; body: string }> = {
  비견: { tone: 'mid', head: '같은 판에 사람이 몰리는 해', body: '경쟁자가 늘어납니다. 협정이나 공동도급으로 판을 나누면 덜 깎입니다.' },
  겁재: { tone: 'hold', head: '돈이 나가는 자리가 생기는 해', body: '동업과 보증은 글로 선을 긋고, 큰 지출은 한 번 더 따져 보세요.' },
  식신: { tone: 'go', head: '만들고 납품하는 일에 힘이 실리는 해', body: '하던 일을 꾸준히 해내는 만큼 실적이 쌓입니다. 무리한 새 판보다 손에 익은 공종이 낫습니다.' },
  상관: { tone: 'hold', head: '말과 기획이 앞서는 해', body: '제안서와 영업은 잘 풀립니다. 규정이나 발주처 담당자와는 부딪히기 쉬우니 한 번 더 참으세요.' },
  편재: { tone: 'go', head: '큰 돈이 오가는 기회가 보이는 해', body: '판을 키울 기회가 옵니다. 크게 벌릴수록 현금 흐름과 수금 일정을 먼저 챙기세요.' },
  정재: { tone: 'go', head: '꾸준히 들어오는 돈의 해', body: '계약 이행과 수금이 안정됩니다. 단가보다 끝까지 받아 내는 쪽에 힘을 쓰세요.' },
  편관: { tone: 'hold', head: '압박과 책임이 커지는 해', body: '감사, 하자, 민원처럼 바깥 요구가 늘어납니다. 서류와 안전 기록을 미리 갖추세요.' },
  정관: { tone: 'go', head: '자격과 신용이 힘이 되는 해', body: '공공 계약, 인증, 등록처럼 절차가 분명한 일이 잘 맞습니다. 실적 신고와 면허 정비를 이 해에 하세요.' },
  편인: { tone: 'mid', head: '공부하고 준비하는 해', body: '자격 취득과 새 분야 검토에 좋습니다. 실행은 한 박자 늦어지니 큰 결정은 서두르지 마세요.' },
  정인: { tone: 'go', head: '도움과 문서가 풀리는 해', body: '기관과 윗사람의 지원, 계약서와 인허가가 잘 풀립니다. 미뤄 둔 서류 일을 이 해에 끝내세요.' },
};

// 하루 단위(투찰). 유료 택일·후보 날짜 비교와 같은 원리: 인성·비겁이면 대표님 일간을 살리는 날.
export const DAY_STAR: Record<Star, { tone: Tone; line: string }> = {
  비견: { tone: 'go', line: '대표님과 같은 기운이 들어와 버티는 힘이 붙는 날입니다.' },
  겁재: { tone: 'go', line: '같은 기운이 들어와 밀어붙이는 힘이 붙는 날입니다. 금액은 한 번 더 확인하세요.' },
  정인: { tone: 'go', line: '대표님 일간을 살리는 기운이 들어오는 날입니다. 서류와 확인 절차가 잘 맞습니다.' },
  편인: { tone: 'go', line: '대표님 일간을 받쳐 주는 기운의 날입니다. 꼼꼼히 다시 보는 데 좋습니다.' },
  정재: { tone: 'mid', line: '대표님이 다스리는 기운의 날입니다. 무리하지 않으면 무난합니다.' },
  편재: { tone: 'mid', line: '대표님이 다스리는 기운의 날입니다. 욕심이 앞서기 쉬우니 정한 금액을 지키세요.' },
  식신: { tone: 'mid', line: '대표님 기운을 빼 쓰는 날입니다. 손에 익은 일은 괜찮습니다.' },
  상관: { tone: 'hold', line: '대표님 기운을 빼 쓰고 말이 앞서기 쉬운 날입니다. 큰 건은 하루 더 보세요.' },
  편관: { tone: 'hold', line: '대표님을 누르는 기운의 날입니다. 큰 건은 미루는 편이 낫습니다.' },
  정관: { tone: 'mid', line: '대표님을 다잡는 기운의 날입니다. 절차를 지키는 일은 무난합니다.' },
};

export const TONE_LABEL: Record<Tone, string> = { go: '넣기 편한 날', mid: '보통인 날', hold: '미루는 편이 나은 날' };
export const MONTH_LABEL: Record<Tone, string> = { go: '움직일 달', mid: '다지는 달', hold: '조심할 달' };
