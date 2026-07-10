// lib/tycoon.ts — 해외 거장(작고) 사주 매칭 (서버 전용)
// ⚠️ 출생일은 널리 공개된 기록 기준(웹 교차검증 완료). 생시는 미상 → 삼주(三柱)로 계산.
//    유사도는 명식의 구조적 비교(객관)이며, 해당 인물의 실제 운세 단정이 아님.
import 'server-only';
import { compute, sipsung, sinsal, EL, pil, type Chart } from './engine';

export type Tycoon = { name: string; en: string; co: string; born: string; story: string };

export const TYCOONS: Tycoon[] = [
  { name: '스티브 잡스', en: 'Steve Jobs', co: 'Apple · 美', born: '1955-02-24',
    story: '차고에서 애플을 세우고, 쫓겨났다가 다시 돌아와 산업을 네 번 바꾼 창업자 — 직관과 결단으로 판 자체를 새로 그렸습니다.' },
  { name: '헨리 포드', en: 'Henry Ford', co: 'Ford · 美', born: '1863-07-30',
    story: '농부의 아들로 태어나 컨베이어 벨트 하나로 자동차를 서민의 물건으로 바꾼 대량생산의 아버지입니다.' },
  { name: '존 록펠러', en: 'John D. Rockefeller', co: 'Standard Oil · 美', born: '1839-07-08',
    story: '장부 정리 사원에서 시작해 스탠더드오일로 석유 시장의 9할을 쥔, 역사상 가장 부유했던 사업가입니다.' },
  { name: '앤드루 카네기', en: 'Andrew Carnegie', co: 'US Steel · 美', born: '1835-11-25',
    story: '방직공장 소년공에서 철강왕이 되고, 말년엔 재산 대부분을 도서관과 학교로 돌려놓은 사람입니다.' },
  { name: '월트 디즈니', en: 'Walt Disney', co: 'Disney · 美', born: '1901-12-05',
    story: '파산한 만화가가 쥐 한 마리로 제국을 세웠습니다 — 상상력을 산업으로 바꾼 사람입니다.' },
  { name: '레이 크록', en: 'Ray Kroc', co: "McDonald's · 美", born: '1902-10-05',
    story: '쉰둘까지 믹서기 외판원이던 그가 형제의 가게 하나를 세계 3만 매장의 프랜차이즈로 키웠습니다.' },
  { name: '샘 월턴', en: 'Sam Walton', co: 'Walmart · 美', born: '1918-03-29',
    story: '시골 잡화점 하나로 시작해 ‘매일 최저가’ 원칙 하나를 뚝심 있게 밀어붙여 세계 최대 유통을 만들었습니다.' },
  { name: '토머스 에디슨', en: 'Thomas Edison', co: 'GE · 美', born: '1847-02-11',
    story: '학교를 석 달 다닌 신문팔이 소년이 1,093개의 특허로 전기의 시대를 열었습니다.' },
  { name: 'J.P. 모건', en: 'J.P. Morgan', co: 'JPMorgan · 美', born: '1837-04-17',
    story: '공황 때마다 시장을 직접 진정시킨 금융의 제왕 — 신용과 위엄으로 미국 금융의 골격을 설계했습니다.' },
  { name: '코닐리어스 밴더빌트', en: 'C. Vanderbilt', co: 'Railroads · 美', born: '1794-05-27',
    story: '열여섯에 나룻배 한 척으로 시작해 증기선과 철도로 한 나라의 교통을 장악한 ‘제독’입니다.' },
  { name: '데이비드 록펠러', en: 'David Rockefeller', co: 'Chase · 美', born: '1915-06-12',
    story: '체이스은행을 이끌며 각국 정상과 국경 너머의 금융을 연 은행가이자 외교가였습니다.' },
  { name: '하워드 휴즈', en: 'Howard Hughes', co: 'Hughes · 美', born: '1905-12-24',
    story: '영화·항공·호텔을 넘나들고 세계 기록을 스스로 조종해 세운, 스케일이 남달랐던 거부입니다.' },
  { name: '밀턴 허쉬', en: 'Milton Hershey', co: 'Hershey · 美', born: '1857-09-13',
    story: '세 번 파산하고 네 번째에 초콜릿으로 일어나, 회사 곁에 마을과 학교까지 세운 제과왕입니다.' },
  { name: '월트 크라이슬러', en: 'Walter Chrysler', co: 'Chrysler · 美', born: '1875-04-02',
    story: '기관차 정비공 출신으로 현장에서 올라와 자기 이름을 단 자동차 회사를 세운 경영자입니다.' },
  { name: '모리타 아키오', en: 'Akio Morita', co: 'Sony · 日', born: '1921-01-26',
    story: '패전 뒤 라디오 수리점에서 시작해 워크맨으로 ‘메이드 인 저팬’을 세계의 프리미엄으로 바꿨습니다.' },
  { name: '마쓰시타 고노스케', en: 'K. Matsushita', co: 'Panasonic · 日', born: '1894-11-27',
    story: '초등학교 중퇴, 자전거포 점원에서 ‘경영의 신’으로 — 사람을 남기는 경영의 원조입니다.' },
  { name: '혼다 소이치로', en: 'Soichiro Honda', co: 'Honda · 日', born: '1906-11-17',
    story: '대장간집 아들, 정비공 출신으로 오토바이에서 F1까지 — 기술자의 고집으로 세계를 이긴 사람입니다.' },
  { name: '도요다 기이치로', en: 'Kiichiro Toyoda', co: 'Toyota · 日', born: '1894-06-11',
    story: '방직기 회사의 아들이 자동차에 사운을 걸어 도요타를 세웠습니다 — ‘적시 생산’의 시조입니다.' },
  { name: '잉바르 캄프라드', en: 'Ingvar Kamprad', co: 'IKEA · 瑞', born: '1926-03-30',
    story: '열일곱에 성냥을 팔던 소년이 ‘납작한 상자’ 하나로 세계인의 거실을 바꿨습니다.' },
  { name: '엔초 페라리', en: 'Enzo Ferrari', co: 'Ferrari · 伊', born: '1898-02-18',
    story: '레이서 출신으로 ‘이기는 차’만을 고집해 자기 이름을 스포츠카의 대명사로 만든 사람입니다.' },
  { name: '페르디난트 포르쉐', en: 'F. Porsche', co: 'Porsche · 獨', born: '1875-09-03',
    story: '함석장이의 아들로 태어나 비틀과 포르쉐를 설계한 손끝의 천재 엔지니어입니다.' },
  { name: '아리스토틀 오나시스', en: 'A. Onassis', co: 'Shipping · 希', born: '1906-01-20',
    story: '빈손의 난민에서 세계 최대 선단의 선주로 — 배포와 협상력으로 바다를 지배했습니다.' },
  { name: '코코 샤넬', en: 'Coco Chanel', co: 'Chanel · 佛', born: '1883-08-19',
    story: '보육원 출신 재봉사가 검은 드레스 하나로 여성의 옷과 시대를 함께 바꿔놓았습니다.' },
  { name: '에스티 로더', en: 'Estée Lauder', co: 'Estée Lauder · 美', born: '1908-07-01',
    story: '이민자의 딸이 부엌에서 만든 크림을 백화점 카운터의 제국으로 키워냈습니다.' },
  { name: '토머스 왓슨', en: 'Thomas J. Watson', co: 'IBM · 美', born: '1874-02-17',
    story: '재봉틀 외판원 출신이 ‘THINK’ 한 단어로 조직을 세워 IBM의 신화를 만들었습니다.' },
  { name: '데이비드 패커드', en: 'David Packard', co: 'HP · 美', born: '1912-09-07',
    story: '차고에서 538달러로 시작한 HP — 실리콘밸리라는 말이 그 차고에서 태어났습니다.' },
  { name: '윌리엄 휴렛', en: 'William Hewlett', co: 'HP · 美', born: '1913-05-20',
    story: '동전 던지기로 회사 이름 순서를 정한 두 엔지니어의 한 축 — 기술자를 존중하는 경영의 원조입니다.' },
  { name: '잭 웰치', en: 'Jack Welch', co: 'GE · 美', born: '1935-11-19',
    story: '20년간 GE의 가치를 서른 배로 — ‘1등 아니면 2등’ 원칙으로 판을 갈랐던 승부사입니다.' },
  { name: '리 아이아코카', en: 'Lee Iacocca', co: 'Chrysler · 美', born: '1924-10-15',
    story: '포드에서 해고된 뒤 크라이슬러로 건너가 파산 직전의 회사를 일으켜 세운 재기의 아이콘입니다.' },
  { name: '진 폴 게티', en: 'J. Paul Getty', co: 'Getty Oil · 美', born: '1892-12-15',
    story: '석유 시추권에 전 재산을 걸어 당대 세계 최고 부자가 된 냉철한 협상가입니다.' },
  { name: '찰리 멍거', en: 'Charlie Munger', co: 'Berkshire · 美', born: '1924-01-01',
    story: '변호사에서 버핏의 평생 파트너로 — ‘거꾸로 생각하라’던 지혜의 투자자입니다.' },
  { name: '로스 페로', en: 'Ross Perot', co: 'EDS · 美', born: '1930-06-27',
    story: 'IBM 최고 영업사원이 1,000달러로 EDS를 세워 GM에 25억 달러에 넘겼습니다 — 해군 출신다운 원칙과 뚝심의 승부사입니다.' },
  { name: '커크 커코리언', en: 'Kirk Kerkorian', co: 'MGM · 美', born: '1917-06-06',
    story: '학교를 그만둔 복서가 전세기 사업으로 일어나 라스베이거스와 MGM을 세 번 사고팔았습니다.' },
  { name: '카를 벤츠', en: 'Karl Benz', co: 'Mercedes · 獨', born: '1844-11-25',
    story: '기관사의 아들이 세계 최초의 자동차를 만들었습니다 — 아내가 몰래 몰고 나가 세상에 증명한 그 차입니다.' },
  { name: '고틀리프 다임러', en: 'Gottlieb Daimler', co: 'Daimler · 獨', born: '1834-03-17',
    story: '빵집 아들로 태어나 고속 엔진을 발명해 마차의 시대를 끝낸 사람입니다.' },
  { name: '베르너 폰 지멘스', en: 'W. von Siemens', co: 'Siemens · 獨', born: '1816-12-13',
    story: '포병 장교가 전신기로 창업해 지멘스를 세웠습니다 — 종업원과 이익을 나눈 선구자이기도 합니다.' },
  { name: '로베르트 보쉬', en: 'Robert Bosch', co: 'Bosch · 獨', born: '1861-09-23',
    story: '작은 정밀기계 공방에서 시작해 점화플러그로 자동차 시대의 심장을 만들었습니다.' },
  { name: '아디 다슬러', en: 'Adi Dassler', co: 'Adidas · 獨', born: '1900-11-03',
    story: '어머니의 세탁실에서 운동화를 깁던 청년이 아디다스를 세워 스포츠를 산업으로 만들었습니다.' },
  { name: '루돌프 다슬러', en: 'Rudolf Dassler', co: 'Puma · 獨', born: '1898-03-26',
    story: '동생과 갈라선 뒤 강 건너에 푸마를 세웠습니다 — 형제의 경쟁이 한 도시를 스포츠의 수도로 만들었습니다.' },
  { name: '잔니 아녤리', en: 'Gianni Agnelli', co: 'Fiat · 伊', born: '1921-03-12',
    story: '이탈리아 산업의 절반을 쥐고도 여유를 잃지 않았던 피아트의 제왕입니다.' },
  { name: '조지 이스트먼', en: 'George Eastman', co: 'Kodak · 美', born: '1854-07-12',
    story: '은행 사환이 ‘버튼만 누르세요’ 한 문장으로 사진을 모든 사람의 것으로 만들었습니다.' },
  { name: '킹 질레트', en: 'King C. Gillette', co: 'Gillette · 美', born: '1855-01-05',
    story: '마흔의 외판원이 ‘쓰고 버리는 면도날’ 아이디어 하나로 소모품 사업의 교과서를 썼습니다.' },
  { name: '리바이 스트라우스', en: 'Levi Strauss', co: "Levi's · 美", born: '1829-02-26',
    story: '금광으로 몰려간 사람들에게 금 대신 튼튼한 바지를 팔았습니다 — 청바지의 시조입니다.' },
  { name: '이부카 마사루', en: 'Masaru Ibuka', co: 'Sony · 日', born: '1908-04-11',
    story: '모리타와 소니를 세운 기술 몽상가 — ‘남이 안 하는 것만 만들자’던 사람입니다.' },
  { name: '도요다 사키치', en: 'Sakichi Toyoda', co: 'Toyota · 日', born: '1867-02-14',
    story: '목수의 아들이 어머니의 베틀을 보다 자동직기를 발명해 도요타의 뿌리를 놓았습니다.' },
  { name: '이와사키 야타로', en: 'Yataro Iwasaki', co: 'Mitsubishi · 日', born: '1835-01-09',
    story: '몰락한 시골 무사가 배 세 척으로 미쓰비시를 일으켰습니다 — 난세에 판을 읽은 사람입니다.' },
  { name: '윌리엄 허스트', en: 'W. R. Hearst', co: 'Hearst · 美', born: '1863-04-29',
    story: '아버지가 도박 빚 대신 받은 신문사 하나로 미디어 제국을 세운 언론왕입니다.' },
  { name: '조지프 퓰리처', en: 'Joseph Pulitzer', co: 'Pulitzer · 美', born: '1847-04-10',
    story: '빈털터리 이민 병사가 신문왕이 되어, 자기 이름을 언론 최고의 상으로 남겼습니다.' },
  { name: '릴런드 스탠퍼드', en: 'Leland Stanford', co: 'Central Pacific · 美', born: '1824-03-09',
    story: '대륙횡단철도의 마지막 못을 박은 철도왕 — 아들을 잃고 그 이름으로 대학을 세웠습니다.' },
  { name: '앤드루 멜런', en: 'Andrew Mellon', co: 'Mellon Bank · 美', born: '1855-03-24',
    story: '은행가로 알루미늄과 석유를 키우고, 세 대통령 밑에서 재무장관을 지낸 자본의 설계자입니다.' },
];

// 대표 유형 (일간 오행 기준) — 닮은 CEO 카드/리포트 공용
export const TYPE_NAME = ['개척형', '추진형', '뚝심형', '승부사형', '지략형'];
export const TYPE_DESC = ['한번 정하면 새 판을 여는', '현장을 달구고 사람을 움직이는', '신뢰로 오래 버티는', '빠르게 끊고 확실히 매듭짓는', '판을 읽고 돌아갈 길을 찾는'];
export const TYPE_GOOD = [
  '없던 길을 내는 추진력과 원칙 — 새 판을 여는 힘이 무기입니다.',
  '사람을 달구고 판의 온도를 끌어올리는 기세가 무기입니다.',
  '신뢰로 오래 버티는 묵직함 — 사람과 일감이 결국 이쪽으로 모입니다.',
  '군더더기 없이 끊고 매듭짓는 결단 — 확실하게 결과를 냅니다.',
  '판을 읽고 물처럼 스며드는 지혜 — 돌아가도 결국 도착합니다.',
];
export const TYPE_RISK = [
  '다만 굽히질 못해, 어긋난 판에서도 홀로 밀다 부러지기 쉽습니다.',
  '다만 식으면 급격히 허해져, 마무리에서 새기 쉽습니다.',
  '다만 무거운 만큼 결단이 늦어, 좋은 때를 흘려보내기 쉽습니다.',
  '다만 차갑게 끊다 사람을 잃고 홀로 남기 쉽습니다.',
  '다만 재고 또 재다, 결정적 순간을 놓치기 쉽습니다.',
];
export const TYPE_WAY = [
  '방향이 서면 밀되, 물러설 하한선을 미리 정해 두는 것이 이 유형의 관건입니다.',
  '기세가 오를수록 마감 직전까지 속도를 아끼고, 식었을 때 무리하지 않는 것이 요령입니다.',
  '평소의 뚝심대로 가되, 좋은 때를 놓치지 않도록 결단의 순간만은 앞당기십시오.',
  '끊고 매듭짓는 힘은 무기이나, 끊기 전 한 박자만 상대 사정을 헤아리면 사람이 남습니다.',
  '흐름을 읽는 지혜가 강점이나, 재느라 결정적 순간을 놓치지 않도록 매듭은 단호히 지으십시오.',
];

function argmax(a: number[]) { let x = 0; for (let i = 1; i < a.length; i++) if (a[i] > a[x]) x = i; return x; }
function argmin(a: number[]) { let x = 0; for (let i = 1; i < a.length; i++) if (a[i] < a[x]) x = i; return x; }

type Traits = { el: number; yin: number; strong: number; weak: number; sip: number; sinsal: Set<string> };
function traitsOf(c: Chart): Traits {
  return { el: c.dayMasterEl, yin: c.dGan % 2, strong: argmax(c.dist), weak: argmin(c.dist), sip: argmax(sipsung(c)), sinsal: new Set(sinsal(c).map(s => s.key)) };
}
const SINSAL_KO: Record<string, string> = { 괴강: '괴강살', 백호: '백호살', 양인: '양인살', 천을: '천을귀인', 현침: '현침살', 역마: '역마살', 화개: '화개살' };
const SIP = ['비겁', '식상', '재성', '관성', '인성'];

const TY = TYCOONS.map(t => { const [y, m, d] = t.born.split('-').map(Number); const c = compute(y, m, d, null); return { t, c, tr: traitsOf(c) }; });

export type TyMatch = {
  tycoon: Tycoon; level: 'twin' | 'near' | 'none'; count: number; matched: string[];
  pills: string; el: number; tyDist: number[]; story: string;
};

export function matchTycoon(userChart: Chart): TyMatch {
  const u = traitsOf(userChart);
  let best = TY[0], bestCount = -1, bestMatched: string[] = [];
  for (const e of TY) {
    const T = e.tr; const matched: string[] = [];
    if (u.el === T.el) matched.push(`일간 ${EL[u.el]}`);
    if (u.yin === T.yin) matched.push(u.yin ? '음간' : '양간');
    if (u.strong === T.strong) matched.push(`강한 ${EL[u.strong]}`);
    if (u.weak === T.weak) matched.push(`${EL[u.weak]} 부족`);
    if (u.sip === T.sip) matched.push(`${SIP[u.sip]} 주도`);
    const inter = [...u.sinsal].find(k => T.sinsal.has(k));
    if (inter) matched.push(SINSAL_KO[inter] || '신살');
    if (matched.length > bestCount) { best = e; bestCount = matched.length; bestMatched = matched; }
  }
  const level = bestCount >= 3 ? 'twin' : bestCount === 2 ? 'near' : 'none';
  return {
    tycoon: best.t, level, count: bestCount, matched: bestMatched,
    pills: pil(best.c.dGan, best.c.dZhi), el: best.c.dayMasterEl,
    tyDist: best.c.dist, story: best.t.story,
  };
}
