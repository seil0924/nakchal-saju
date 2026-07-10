// lib/report-copy.ts — 낙찰사주 리포트 카피 + 섹션 생성 (서버 전용)
// ⚠️ 유료 섹션 텍스트는 이 모듈에서만 생성됩니다. 클라이언트로 직접 노출 금지.
import 'server-only';
import { GAN, ZHI, EL, EL_HEX, SIP, pil, sipsung, relation, todayPillar, sinsal, type Chart, type Sajeong } from './engine';

// 투찰 택일: 이번 달 길일 캘린더 (대표 일간을 살리는 일진 = 상단/생 날)
function choilHtml(c:Chart, y:number, m:number){
  const first=new Date(Date.UTC(y,m-1,1)).getUTCDay();
  const days=new Date(Date.UTC(y,m,0)).getUTCDate();
  const gilDays:number[]=[];
  let cells='';
  for(let i=0;i<first;i++) cells+='<div class="cd mute"></div>';
  for(let d=1;d<=days;d++){
    const rel=relation(c.dayMasterEl, todayPillar(y,m,d).el);
    const gil=(rel==='in'||rel==='bi'); if(gil) gilDays.push(d);
    cells+=`<div class="cd${gil?' gil':''}">${d}</div>`;
  }
  const dh=['일','월','화','수','목','금','토'].map(x=>`<div class="cdh">${x}</div>`).join('');
  return `<div class="choil">${dh}${cells}</div>`+
    `<p>이번 달 <b>${m}월</b>, 대표님 기운이 위로 뻗는 <b>투찰 길일</b>은 <b>${gilDays.length?gilDays.join('·')+'일':'해당 없음'}</b>입니다.</p>`+
    `<p>오늘의 사정률과 같은 원리로, 대표님 일간(${GAN[c.dGan]})을 살리는 일진이 드는 날 — 큰 건 투찰·계약·미팅을 이 날에 맞추면 유리합니다.</p>`+
    `<p>반대로 표시 없는 날은 기운이 눌리니, 무리한 저가 투찰은 피하고 관망하십시오.</p>`;
}

const DMc=['한번 정하면 밀어붙여 새 판을 여는 개척형 대표이십니다.','현장을 달구고 사람을 움직이는 추진력의 대표이십니다.','신뢰로 오래 버티는 뚝심의 경영자이십니다.','빠르게 끊고 확실히 마무리하는 승부사형 대표이십니다.','판을 읽고 돌아갈 길을 찾는 지략형 대표이십니다.'];
const DMs=['굽히기 싫어 홀로 부딪히고, 원칙을 지키다 손해도 감수해오셨습니다.','빠르게 타올랐다 식으며, 속도와 감정 사이에서 홀로 애태워오셨습니다.','남의 짐까지 짊어지고, 답답할 만큼 참으며 버텨오셨습니다.','강한 만큼 부딪히고, 냉정하다는 오해 속에 홀로 결정해오셨습니다.','속을 잘 드러내지 않고, 정처 없이 흔들리는 시기를 홀로 견뎌오셨습니다.'];
const NAT=['곧게 뻗으려다 홀로 부러질 뻔한 대쪽 같은','타올랐다 스러지길 반복한 불 같은','다 짊어지고 묵묵히 버텨온 산 같은','홀로 벼려지며 단단해진 칼 같은','굽이굽이 돌아 흘러온 강 같은'];
const T1=['곧게만 가려다, 홀로 부러질 뻔한 적 있으시죠','뜨겁게 타오르다 혼자 식어버린 밤이 있으셨을 겁니다','다 짊어지고도 내색 못 한 세월이 있으셨죠','칼같이 끊어내고 돌아서 홀로 씁쓸했던 적 있으시죠','속을 안 보이며 홀로 흔들려온 길이었을 겁니다'];
const SIP_MEAN=['남에게 기대지 않고 스스로 짊어지는','날카로운 통찰과 결과물로 승부하는','판을 현실로 만들어 실리를 쥐는','무게를 견디며 조직을 이끄는','신중히 축적하고 인정으로 자리를 지키는'];
const STRONG_MEAN=['뻗어나가는 추진력이 강하다','사람을 끌고 표현하는 힘이 세다','버티고 감싸는 무게가 있다','끊고 결단하는 힘이 강하다','읽고 흐르는 지혜가 깊다'];
const STRONG_RISK=['부러질 만큼 밀어붙이기 쉽습니다','타올랐다 쉬 식습니다','굼떠 때를 놓치기 쉽습니다','차갑게 끊어 외로워지기 쉽습니다','정처 없이 흔들리기 쉽습니다'];
const LACK=['새로 뻗어나갈 기회가','사람의 인정과 드러남이','든든한 기반과 안정이','칼같은 결단과 매듭이','융통과 물러설 여유가'];
const NUM_EL=['3·8','2·7','5·10','4·9','1·6'];const COLOR_EL=['초록·청록','빨강·자주','노랑·금','흰색·은','검정·남색'];const DIR_EL=['동쪽','남쪽','중앙','서쪽','북쪽'];const PLACE_EL=['나무가 우거진 동쪽·산림 지대','볕 잘 드는 남쪽·따뜻한 고장','너른 평지·안정된 중앙 터','정갈하고 단단한 서쪽','물가·트인 북쪽'];
const DEC_T=['한번 정하면 끝을 보는 사람, 그게 독이 될 때가 있습니다','기세가 오르면 판을 뒤집지만, 식으면 무너집니다','좀처럼 안 움직이나, 한번 정하면 태산입니다','군더더기 없이 끊는 결단, 그 뒤가 외롭습니다','서두르지 않고 흐름을 타 파고듭니다'];
const DEC_A=['방향이 서면 좌고우면 없이 끝을 보는','기세를 몰아 판을 뒤집는','서두르지 않고 끝까지 버티는','군더더기 없이 끊고 매듭짓는','상황을 읽어 물처럼 파고드는'];
const DEC_R=['어긋난 판에서도 물러서지 못해 손해를 키웁니다','과열되면 냉정을 잃어 무리한 저가를 던집니다','때를 놓쳐 좋은 건을 흘려보내기 쉽습니다','정 없이 끊어 관계와 기회를 함께 잃기 쉽습니다','우유부단해 결정적 순간을 놓치기 쉽습니다'];
const DEC_V=['방향은 밀되 물러설 하한선을 미리 정하십시오','달아오를수록 마감 직전까지 속도를 아끼십시오','평소의 뚝심대로 가되 실기하지 마십시오','끊기 전에 한 번만 상대의 사정을 헤아리십시오','흐름을 읽되 결단의 순간은 놓치지 마십시오'];
const PPL_T=['원칙으로 이끌다 홀로 외로워진 리더','열기로 모으나 식으면 허해지는 좌장','다 품으려다 홀로 짐을 진 큰형','기준으로 가르는 냉정한 장수','속을 안 보여 다가가기 어려운 책사'];
const PPL_A=['원칙을 곧게 요구하는','열기로 사람을 끌어모으는','신의로 다 품는','예의 없는 자를 가차 없이 가르는','속을 잘 드러내지 않는'];
const PPL_E=['존경은 받되 거리감을 줍니다','따르게 하나 식으면 흩어지기 쉽습니다','기대다 지쳐 홀로 남기 쉽습니다','유능하나 다가가기 어렵다는 말을 듣습니다','믿음직하나 속을 모르겠다는 말을 듣습니다'];
const PPL_V=['원칙 뒤의 마음을 한마디로 표현하십시오','열기를 오래 끌 신의를 더하십시오','짐을 나눠 지우고 스스로도 기대십시오','끊기 전에 한 박자만 사정을 헤아리십시오','약한 모습도 가끔 보여 곁을 내주십시오'];
const WL_T=['새로 벌일 땐 강한데, 지킬 때가 문제입니다','들어올 땐 크고 나갈 땐 더 큰 기복의 재물운','더디지만 쌓이면 무너지지 않는 재물운','맺고 끊어 결실을 남기는 재물운','흐르게 둘수록 불어나는 재물운'];
const WL_A=['한자리 안주 없이 새 사업으로','기세를 타 크게','서두르지 않고 실물로 차곡차곡','과감히 결단해 매듭지어','고이지 않게 굴려'];
const WL_R=['벌인 판이 많아 관리에서 새기 쉽습니다','들뜬 때의 과감한 지출을 조심하십시오','기회 앞에 몸을 사려 놓치기 쉽습니다','인정에 흔들려 끊을 때를 놓치기 쉽습니다','큰돈을 한번에 노리는 투기는 독입니다'];
const WL_V=['벌인 만큼 챙길 관리 체계를 두십시오','오를 때 실물·저축으로 묶어두십시오','기회엔 평소보다 반 박자 빠르게','맺을 자리와 끊을 자리를 냉정히 가르십시오','안정적 저축과 실물 위주로 굴리십시오'];
const CL_MIS=['고집 세다','변덕스럽다','답답하다','차갑다','속 모를 사람이다'];
const CL_TURN=['자신을 찌르는 데가 아니라 판을 여는 데','태우는 데가 아니라 데우는 데','짊어지는 데가 아니라 세우는 데','베는 데가 아니라 지키는 데','흘려보내는 데가 아니라 모으는 데'];
// ===== 발주처 궁합 =====
const CO={
 in:{g:'合',grade:'상생(相生)',cls:'el-mok',score:'매우 좋음',gc:'#177f5e',
   t:'발주처가 대표님을 밀어주는 자리',
   p:['발주처의 <b>{O}</b> 기운이 대표님의 <b>{M}</b> 기운을 살립니다. 명리로 <b>인성(印星)</b>의 관계 — 상대가 나를 키워주는, 궁합 중 가장 귀한 자리입니다.','이런 발주처와는 무리한 저가 없이도 흐름이 순하게 풀립니다. 대표님을 알아봐 주는 곳이니, 관계를 길게 보고 정성을 들이십시오.','다만 기대어 안주하기 쉬우니, 받은 만큼 실력으로 갚는다는 자세면 오래갑니다.']},
 jae:{g:'財',grade:'재물(財)',cls:'el-to',score:'좋음',gc:'#b58a2f',
   t:'대표님이 결실을 가져오는 자리',
   p:['대표님의 <b>{M}</b> 기운이 발주처의 <b>{O}</b> 기운을 다스립니다. 명리로 <b>재성(財星)</b> — 내가 취하고 결실을 쥐는 관계로, 수주로 이어지기 좋은 궁합입니다.','실리가 분명한 자리이니 적극적으로 문을 두드릴 만합니다. 다만 급히 쥐려다 무리하면 탈이 나니, 페이스를 지키십시오.','계약 조건은 대표님이 주도권을 쥐기 유리한 구도입니다.']},
 bi:{g:'比',grade:'대등(比肩)',cls:'el-non',score:'보통',gc:'#6f6a5c',
   t:'대등하게 맞서는 자리',
   p:['발주처와 대표님이 같은 <b>{M}</b> 기운입니다. 명리로 <b>비겁(比劫)</b> — 서로 대등해, 잘 맞으면 든든한 동지요 어긋나면 경쟁이 되는 자리입니다.','힘이 비슷하니 기 싸움으로 흐르기 쉽습니다. 명분과 조건을 문서로 분명히 해두면 오히려 깔끔하게 풀립니다.','경쟁 업체가 많은 건이라면, 관계보다 실력과 가격으로 승부하는 편이 낫습니다.']},
 sik:{g:'食',grade:'베풂(食傷)',cls:'el-hwa',score:'노력 필요',gc:'#b5402f',
   t:'대표님이 공을 들이는 자리',
   p:['대표님의 <b>{M}</b> 기운이 발주처의 <b>{O}</b> 기운으로 흘러 나갑니다. 명리로 <b>식상(食傷)</b> — 내가 베풀고 공을 들이는 관계라, 정성만큼 돌아오기까지 시간이 걸립니다.','당장의 수주보다 신뢰를 쌓는 자리로 보십시오. 실적과 성의를 꾸준히 보이면 다음 건에서 열매를 맺습니다.','들인 공에 비해 회신이 더딜 수 있으니, 이 발주처 하나에 전부를 걸지는 마십시오.']},
 gwan:{g:'官',grade:'압박(官星)',cls:'el-su',score:'까다로움',gc:'#22406b',
   t:'발주처의 기준이 까다로운 자리',
   p:['발주처의 <b>{O}</b> 기운이 대표님의 <b>{M}</b> 기운을 누릅니다. 명리로 <b>관성(官星)</b> — 상대가 나를 통제하는 관계라, 기준이 엄격하고 절차가 까다롭게 느껴지는 자리입니다.','감정보다 서류와 원칙으로 다가가야 통합니다. 요구가 많더라도 정면으로 맞서기보다, 요건을 꼼꼼히 맞춰 신뢰를 얻는 편이 유리합니다.','한번 인정받으면 오래가는 곳이니, 초반의 깐깐함을 관문으로 여기고 넘으십시오.']}
};
// 동업/협정 공용 궁합 카피 ({A}=우리측, {S}=상대측)
// 동업 궁합 (대표×대표) — 사람 관계: 역할·신뢰·지분·의사결정
const DONGUP={
 in:{g:'合',grade:'상생(相生)',score:'좋음',gc:'#177f5e',
   t:'상대가 대표님을 받쳐주는 동업',
   p:['동업 상대의 <b>{O}</b> 기운이 대표님의 <b>{M}</b> 기운을 살립니다. 명리로 <b>인성(印星)</b> — 상대가 나를 세워주는 자리라, 대표님이 앞에서 밀고 상대가 뒤를 받치는 조합입니다.','억지로 맞추지 않아도 손발이 붙는 인연입니다. 다만 기대다 주도권을 통째로 넘기지 않게, 지분과 최종 결정권은 처음에 문서로 정하십시오.','성과가 나면 공을 나눠 돌리는 태도가 이 동업을 오래 가게 합니다.']},
 jae:{g:'財',grade:'재물(財)',score:'좋음',gc:'#b58a2f',
   t:'대표님이 판을 쥐고 이끄는 동업',
   p:['대표님의 <b>{M}</b> 기운이 상대의 <b>{O}</b> 기운을 다스립니다. 명리로 <b>재성(財星)</b> — 대표님이 주도권을 쥐고 상대가 실무를 받치는 구도입니다.','지분·의사결정은 대표님 우위로 두는 편이 자연스럽습니다. 다만 아랫사람 대하듯 하면 금세 등을 돌리니, 대우와 몫은 넉넉히 챙기십시오.','대표님이 방향을 정하고 상대가 실행하는 역할 분담이 뚜렷할수록 돈이 됩니다.']},
 bi:{g:'比',grade:'대등(比肩)',score:'보통',gc:'#6f6a5c',
   t:'두 대표가 정면으로 맞서는 동업',
   p:['상대와 대표님이 같은 <b>{M}</b> 기운입니다. 명리로 <b>비겁(比劫)</b> — 둘 다 대표 기질이라, 맞으면 천군만마요 어긋나면 사사건건 부딪힙니다.','같은 걸 잘하고 같은 걸 못하니, 한 명은 안(관리·재무)을 한 명은 밖(영업·수주)을 맡아 영역을 아예 갈라야 시너지가 납니다.','의견이 갈렸을 때 누가 최종 결정을 하는지 규칙을 처음에 못박지 않으면, 위기에 반드시 터집니다.']},
 sik:{g:'食',grade:'베풂(食傷)',score:'노력 필요',gc:'#b5402f',
   t:'대표님이 더 내주고 끌어주는 동업',
   p:['대표님의 <b>{M}</b> 기운이 상대의 <b>{O}</b> 기운으로 흘러 나갑니다. 명리로 <b>식상(食傷)</b> — 대표님이 베풀고 끌어주는 관계라, 상대가 대표님 그늘에서 크는 그림입니다.','대표님이 리드하고 상대가 따라오는 구도면 잘 맞지만, 내주는 게 많으니 지분·보상으로 균형을 맞추지 않으면 대표님만 소진됩니다.','사람으로 키운다는 마음이면 오래가고, 당장의 손익만 따지면 대표님이 손해 보는 자리입니다.']},
 gwan:{g:'官',grade:'압박(官星)',score:'까다로움',gc:'#22406b',
   t:'상대가 판을 쥐는 동업',
   p:['상대의 <b>{O}</b> 기운이 대표님의 <b>{M}</b> 기운을 누릅니다. 명리로 <b>관성(官星)</b> — 상대의 스타일과 기준이 대표님을 조이는 구도입니다.','대표님이 2인자로 뒤를 받치는 편이 편하다면 나쁘지 않으나, 대등을 원하면 초반에 역할·권한·지분을 분명히 못박아야 눌리지 않습니다.','상대 페이스에 끌려가기 쉬우니, 중요한 결정일수록 감정보다 계약서로 대응하십시오.']}
};
// 협정 궁합 (회사×회사) — 공동도급: 주관사·지분·공종·관재수
const HYEOPJEONG={
 in:{g:'合',grade:'상생(相生)',score:'좋음',gc:'#177f5e',
   t:'상대 회사가 우리를 끌어올리는 결합',
   p:['상대 회사의 <b>{O}</b> 기운이 우리 법인의 <b>{M}</b> 기운을 살립니다. 명리로 <b>인성(印星)</b> — 자금·실적·신용 면에서 상대가 우리를 받쳐주는 결합입니다.','공동도급에서 우리가 덕을 보는 구도이니, 주관사 자리는 상대에게 양보하더라도 지분과 실리는 확실히 챙기는 편이 유리합니다.','상대의 간판·자격을 빌려 판을 키우는 그림이라, 우리 실적을 성실히 쌓아 다음 협정에서 대등해지는 것을 목표로 두십시오.']},
 jae:{g:'財',grade:'재물(財)',score:'좋음',gc:'#b58a2f',
   t:'우리 회사가 주관사로 이끄는 결합',
   p:['우리 법인의 <b>{M}</b> 기운이 상대 회사의 <b>{O}</b> 기운을 다스립니다. 명리로 <b>재성(財星)</b> — 우리가 주도권을 쥐는 결합이라 주관사·대표사 포지션이 자연스럽습니다.','지분·의사결정을 우리 우위로 가져가되, 상대의 몫과 역할을 계약서에 분명히 보장해야 공사 후반까지 관계가 갑니다.','우리가 판을 짜고 상대가 실무를 대는 구조일 때 수익성이 가장 좋습니다.']},
 bi:{g:'比',grade:'대등(比肩)',score:'보통',gc:'#6f6a5c',
   t:'체급이 비슷해 주관사를 다투는 결합',
   p:['두 회사가 같은 <b>{M}</b> 기운 — 체급과 색깔이 비슷한 결합입니다. 명리로 <b>비겁(比劫)</b> — 대등해서 주관사 자리와 지분을 놓고 부딪히기 쉽습니다.','공동도급 지분·대표사·정산 방식을 계약서로 못박지 않으면, 공사 후반 준공·정산 단계에서 반드시 분쟁 소지가 생깁니다.','강점이 겹치니, 공종(工種)이나 구간을 아예 갈라 맡아야 중복과 마찰을 줄입니다.']},
 sik:{g:'食',grade:'베풂(食傷)',score:'노력 필요',gc:'#b5402f',
   t:'우리가 기술·인력을 더 대는 결합',
   p:['우리 법인의 <b>{M}</b> 기운이 상대 회사의 <b>{O}</b> 기운으로 흘러 나갑니다. 명리로 <b>식상(食傷)</b> — 우리가 기술·인력·실무를 더 대주는 결합입니다.','우리가 실질을 끌고 상대가 이름·자격을 대는 구조라면 맞물리지만, 소모가 크니 수수료·정산 조건을 냉정하게 잡으십시오.','당장의 도급 실적보다, 우리 기술이 다음 수주로 이어지는 레퍼런스가 되는지를 보고 결정하십시오.']},
 gwan:{g:'官',grade:'압박(官星)',score:'까다로움',gc:'#22406b',
   t:'상대 규모에 눌리기 쉬운 결합',
   p:['상대 회사의 <b>{O}</b> 기운이 우리 법인의 <b>{M}</b> 기운을 누릅니다. 명리로 <b>관성(官星)</b> — 규모·기준 면에서 상대가 우리를 압박하는 결합입니다.','상대가 주관사·주도권을 쥐기 쉬우니, 하도급으로 눌리지 않으려면 우리 역할·지분·책임 범위를 계약 초반에 분명히 못박아야 합니다.','공기 후반의 관재수(官災數)를 조심하고, 정산·하자 책임 조건을 반드시 명문화하십시오.']}
};
function compatWith(meChart,otherChart,table,A,S){
 const me=meChart.dayMasterEl,o=otherChart.dayMasterEl;
 const rel=relation(me,o);const c=table[rel];
 const fill=s=>s.replace(/\{M\}/g,EL[me]).replace(/\{O\}/g,EL[o]).replace(/\{A\}/g,A).replace(/\{S\}/g,S);
 return {rel,grade:c.grade,score:c.score,gc:c.gc,letter:c.g,t:fill(c.t),score2:compatScore(rel,otherChart),
   pills:pil(otherChart.dGan,otherChart.dZhi),oel:GAN_ELc[otherChart.dGan],paras:c.p.map(fill)};
}
// 궁합 히어로 — 대표↔상대 명식 나란히 + 큰 점수 (사주아이식 극화)
function compatBlock(cm,c,otherLabel){
  const P=a=>a.map(x=>`<p>${x}</p>`).join('');
  const meCol=EL_HEX[GAN_ELc[c.dGan]],otCol=EL_HEX[cm.oel];
  return `<div class="cverdict">`+
    `<div class="cvs"><div class="cnm">대표님</div><div class="cpl" style="background:${meCol}">${pil(c.dGan,c.dZhi)}</div></div>`+
    `<div class="cvscore"><div class="n" style="color:${cm.gc}">${cm.score2}</div><div class="g2" style="color:${cm.gc}">${cm.grade}</div></div>`+
    `<div class="cvs"><div class="cnm">${otherLabel}</div><div class="cpl" style="background:${otCol}">${cm.pills}</div></div>`+
  `</div>`+P(cm.paras);
}
function compat(meChart,clientChart){return compatWith(meChart,clientChart,CO,'대표님','발주처');}
// 법인 운세 (설립일 사주 × 대표)
const LEGREL={
 in:'법인의 <b>{LO}</b> 기운이 대표님의 <b>{M}</b> 기운을 살리는 구조 — 회사가 대표님을 받쳐주는, 궁합 좋은 법인입니다.',
 bi:'법인과 대표님이 같은 <b>{M}</b> 기운 — 방향은 뚜렷하나 부족한 기운도 함께 비어, 그 자리를 밖에서 보완해야 합니다.',
 jae:'대표님이 법인의 <b>{LO}</b> 기운을 다스리는 구조 — 대표님이 회사를 확실히 손에 쥐고 이끄는 그림입니다.',
 sik:'대표님의 <b>{M}</b> 기운이 법인으로 흘러가는 헌신형 구조 — 대표님이 쏟아붓는 만큼 소모가 크니 위임이 필요합니다.',
 gwan:'법인의 <b>{LO}</b> 기운이 대표님을 누르는 구조 — 회사 일이 대표님을 조이는 형국이라, 시스템과 사람에게 권한을 나눠야 숨통이 트입니다.'};
function legalReport(meChart,legalChart){
 let strong=0,weak=0;for(let i=1;i<5;i++){if(legalChart.dist[i]>legalChart.dist[strong])strong=i;if(legalChart.dist[i]<legalChart.dist[weak])weak=i;}
 const zero=legalChart.dist[weak]===0;
 const rel=relation(meChart.dayMasterEl,legalChart.dayMasterEl);
 const relLine=LEGREL[rel].replace(/\{LO\}/g,EL[legalChart.dayMasterEl]).replace(/\{M\}/g,EL[meChart.dayMasterEl]);
 return {pills:pil(legalChart.dGan,legalChart.dZhi),strong,weak,zero,rel,
   paras:[
     `법인의 사주(설립일 <b>${pil(legalChart.dGan,legalChart.dZhi)}</b>, 일간 ${GAN[legalChart.dGan]})는 <b>${EL[strong]}</b> 기운이 강하고 <b>${EL[weak]}</b> 기운이 ${zero?'비어':'옅어'}, ${STRONG_MEAN[strong]} 체질의 회사입니다.`,
     relLine,
     `그러니 대표님이 회사에서 ${rel==='gwan'?'유독 짓눌리거나 매인 느낌을 받으셨다면, 그것은 기질 탓이 아니라 이 구조 때문':rel==='sik'?'혼자 다 떠안는 느낌을 받으셨다면, 그것은 이 헌신형 구조 때문':rel==='in'?'유난히 순하게 풀린 대목이 있었다면, 법인이 대표님을 받쳐준 덕':'뜻대로 밀어붙일 수 있었다면, 대표님이 회사를 쥔 구조 덕'}입니다.`,
     `법인에 부족한 <b>${EL[weak]}</b>는 상호·로고 색(<b>${COLOR_EL[weak]}</b>), 사무실 방위(<b>${DIR_EL[weak]}</b>)로 채우면 회사의 기운이 균형을 찾습니다.`]};
}
function argmax(a){let x=0;for(let i=1;i<a.length;i++)if(a[i]>a[x])x=i;return x;}
function gaugeHtml(s,worryTxt,unlocked){
  return `<div class="val">${s.dir} ${s.tilt>0?'<span class="u">▲</span>':'<span class="u">▼</span>'}</div>
  <div class="bandtxt">이번 흐름은 <b style="color:var(--ink)">${s.bandLo}~${s.bandHi}%</b>에 무게</div>
  <div class="track"><div class="fill2" style="width:${s.pos}%"></div><div class="dot" style="left:${s.pos}%"></div></div>
  <div class="scale"><span>98%</span><span>기초 100%</span><span>102%</span></div>
  <div class="sjlock"><span class="k">${unlocked?'소수점 정밀값':'🔒 소수점 정밀값'}</span>${unlocked?`<span class="precise">${s.precise}%</span>`:'<span class="sjhint" style="font-size:11px;color:var(--gold);font-weight:700">전체 리포트에서 열림</span>'}</div>
  <p style="margin-top:11px">${s.bridge}</p>${worryTxt?`<p class="worry">${worryTxt}</p>`:''}`;
}
function distHtml(c){const tot=c.dist.reduce((a,b)=>a+b,0);
  return `<div class="dist">${EL.map((e,i)=>`<div class="d"><div class="c" style="color:${EL_HEX[i]}">${e}</div><div class="bar"><div class="fill" style="height:${Math.max(8,Math.round(c.dist[i]/tot*100))}%;background:${EL_HEX[i]}"></div></div><div class="n">${c.dist[i]}</div></div>`).join('')}</div>`;}
function compatHtml(cm,relLabel){
  const P=a=>a.map(x=>`<p>${x}</p>`).join('');
  return `<div class="compat"><div class="grade" style="background:${cm.gc}">${cm.score2}</div><div><div class="gt">${cm.grade} · ${cm.score}</div><div class="gs">${relLabel} 일주 <b>${cm.pills}</b></div></div></div>`+P(cm.paras);
}
const GAN_ELc=[0,0,1,1,2,2,3,3,4,4];
const ZHI_ELc=[4,2,0,0,2,1,1,2,3,3,2,4];
// 궁합 점수 (0~100, 결정론적)
const COMPAT_SCORE={in:90,jae:80,bi:64,sik:56,gwan:48};
function compatScore(rel,otherChart){
  const j=((otherChart.dGan*7+otherChart.dZhi*3)%9)-4;
  return Math.max(31,Math.min(97,COMPAT_SCORE[rel]+j));
}
// 결과 히어로 (큰 점수 + 후킹 제목) — 무료(방향 기반)
const REL_SCORE={in:88,bi:74,jae:70,sik:56,gwan:44};
function heroFor(c,s){
  const score=Math.max(22,Math.min(96,Math.round(REL_SCORE[s.rel]+(s.pos-50)*0.3)));
  const up=s.tilt>0;
  const headline=up
    ? '오늘, 대표님의 기운이 사정률을 <b>위로</b> 끌어올립니다'
    : '오늘은 기운이 눌리는 날 — <b>서두르지 않는 자</b>가 잡습니다';
  return {score,label:'오늘 낙찰 유리도',headline,sub:`${s.dir} · ${up?'상승 흐름':'관망 흐름'}`,up};
}
// 회사의 대운 (설립일 사주 기준 10년 주기 · 근사)
function daeun(legalChart,foundYear,curYear){
  let mi=0;for(let i=0;i<60;i++){if(i%10===legalChart.mGan&&i%12===legalChart.mZhi){mi=i;break;}}
  const forward=[0,2,4,6,8].includes(legalChart.yGan); // 년간 양 → 순행
  const age=Math.max(0,curYear-foundYear);
  const curBlock=Math.min(7,Math.floor(age/10));
  const list=[];
  for(let k=0;k<8;k++){
    const idx=((mi+(forward?(k+1):-(k+1)))%60+60)%60;
    const g=idx%10,z=idx%12;
    list.push({from:k*10,to:k*10+9,gan:g,zhi:z,el:GAN_ELc[g],cur:k===curBlock});
  }
  return {forward,age,curBlock,list,me:legalChart.dayMasterEl};
}
const DAEUN_REL={in:'회사를 밖에서 밀어주는 기운이 드는 시기 — 자금·수주·인연이 붙습니다',
 bi:'회사와 같은 기운이 겹치는 시기 — 힘은 세나 경쟁·확장 과열을 조심할 때',
 jae:'회사가 결실을 거둬들이는 재물의 시기 — 벌이는 것보다 챙기고 굳힐 때',
 sik:'회사가 힘을 밖으로 쏟는 시기 — 실적은 나되 소모가 크니 관리가 관건',
 gwan:'회사가 눌리고 조여지는 시기 — 무리한 확장보다 내실·시스템을 다질 때'};
function daeunSectionHtml(d,legalName){
  const cur=d.list[d.curBlock];
  const relc=relation(d.me,cur.el);
  const cells=d.list.slice(0,6).map(b=>`<div class="dcell${b.cur?' cur':''}"><div class="dg" style="color:${EL_HEX[b.el]}">${GAN[b.gan]}${ZHI[b.zhi]}</div><div class="dy">${b.from}~${b.to}년차</div></div>`).join('');
  return `<div class="daeun">${cells}</div>`+
    `<p style="margin-top:12px"><b>${legalName||'회사'}</b>는 설립 <b>${d.age}년차</b> — 지금은 <b>${GAN[cur.gan]}${ZHI[cur.zhi]}(${EL[cur.el]})</b> 대운, ${d.forward?'순행':'역행'}으로 흐릅니다.</p>`+
    `<p>${DAEUN_REL[relc]}.</p>`+
    `<p>다음 10년(<b>${d.list[Math.min(7,d.curBlock+1)].from}년차~</b>)엔 <b>${EL[d.list[Math.min(7,d.curBlock+1)].el]}</b> 기운으로 넘어가니, 그 결에 맞춰 확장·정비의 때를 잡으십시오.</p>`;
}
// 처방형 결과 (saju.ai식): 시점·주의·대안 3박자 — '맞히기'가 아니라 '의사결정 지침'
function cheobangHtml(s:Sajeong){
  const up=s.tilt>0;
  const when=up?'오늘은 기운이 위로 뻗는 날 — 준비된 건이라면 정면 승부해도 좋습니다.':'오늘은 눌리는 흐름 — 개시 직후를 피하고 마감 직전 시간대에 손을 쓰십시오.';
  const warn=up?'자신감이 과해지기 쉬우니, 미리 정한 하한선 아래로는 내려가지 마십시오.':'조급함에 성급한 저가·과속 투찰을 던지지 마십시오.';
  const alt=up?'흐름이 꺾이거나 조건이 나쁘면, 무리하지 말고 이번 달 투찰 길일로 미루십시오.':'큰 건이라면 오늘 무리하기보다 이번 달 투찰 길일(擇日)로 옮기는 편이 유리합니다.';
  return `<div class="cheobang"><div class="cbt">處方 · 오늘의 실행 지침</div>`+
    `<div class="cbrow"><span class="cbk">시점</span><span class="cbv">${when}</span></div>`+
    `<div class="cbrow"><span class="cbk">주의</span><span class="cbv">${warn}</span></div>`+
    `<div class="cbrow"><span class="cbk">대안</span><span class="cbv">${alt}</span></div></div>`;
}
function gilCount(c:Chart,y:number,m:number){
  const days=new Date(Date.UTC(y,m,0)).getUTCDate();let n=0;
  for(let d=1;d<=days;d++){const rel=relation(c.dayMasterEl,todayPillar(y,m,d).el);if(rel==='in'||rel==='bi')n++;}
  return n;
}
function buildReport(c,today,s,worryTxt,clientChart,legalChart,partnerChart,allyChart,unlocked,names,daeunMeta,nowYMD){
  names=names||{};
  const me=c.dayMasterEl,gan=GAN[c.dGan],sip=sipsung(c),dom=argmax(sip);
  let strong=0,weak=0;for(let i=1;i<5;i++){if(c.dist[i]>c.dist[strong])strong=i;if(c.dist[i]<c.dist[weak])weak=i;}
  const zero=c.dist[weak]===0;
  const P=a=>a.map(x=>`<p>${x}</p>`).join('');
  const secs=[];
  secs.push({mk:'器',free:true,t:T1[me],html:P([
    `대표님은 <b>${NAT[me]}</b> 그릇입니다. ${DMc[me]}`,
    `이는 일간 <b>${gan}(${EL[me]})</b>에 <b>${SIP[dom]}</b>의 기운이 두텁게 실려, ${SIP_MEAN[dom]} 사주이기 때문입니다.`,
    `전체로 보면 <b>${EL[strong]}</b>의 기운이 무기이고, ${zero?`<b>${EL[weak]}</b>의 기운이 통째로 비어`:`<b>${EL[weak]}</b>의 기운이 옅어`} 그 자리가 평생의 숙제였습니다.`,
    `${DMs[me]}`])});
  const ss=sinsal(c);
  if(ss.length){
    secs.push({mk:'符',free:true,t:`대표님 명식에 새겨진 부호 — ${ss.map(x=>x.name).join('·')}`,html:
      `<div class="sinsal">`+
      ss.map((x,i)=>`<div class="ssrow"><div class="sshan" style="background:${['#7a1f1f','#22406b'][i%2]}">${x.hanja.slice(0,2)}</div>`+
        `<div class="ssbody"><div class="sshead">${x.head}</div>`+
        ((i===0||unlocked)?`<p class="sstxt">${x.body}</p>`:`<p class="sstxt lockt">🔒 전체 리포트에서 <b>${x.name}(${x.hanja})</b>의 풀이가 열립니다.</p>`)+
      `</div></div>`).join('')+
      `</div>`+
      `<p style="margin-top:10px">신살(神殺)은 여느 사람 사주엔 잘 안 드는 특수 부호입니다. 대표님껜 <b>${ss.map(x=>x.name).join('·')}</b>이(가) 함께 앉아, 남다른 승부 기질로 여기까지 오신 것입니다.</p>`});
  }
  secs.push({mk:'五',free:false,t:`${EL[strong]}은 넘치는데, ${EL[weak]} 한 자리가 ${zero?'텅 비었습니다':'옅습니다'}`,html:
    distHtml(c)+P([
    `여덟 글자의 오행은 ${EL.map((e,i)=>`${e}${c.dist[i]}`).join(' · ')} — ${zero?'한쪽으로 크게 쏠린 극단적 구성':'다소 치우친 구성'}입니다.`,
    `<b>${EL[strong]}</b>이 강하다는 것은 ${STRONG_MEAN[strong]}는 뜻입니다. 다만 지나치면 ${STRONG_RISK[strong]}.`,
    `${zero?`비어 있는 <b>${EL[weak]}</b>의 자리 — ${LACK[weak]} 늘 아쉬우셨을 것입니다.`:`옅은 <b>${EL[weak]}</b>를 채울수록 사주가 균형을 찾습니다.`}`,
    `개운으로는 <b>${DIR_EL[weak]}</b> 방향, 행운 숫자 <b>${NUM_EL[weak]}</b>, 색 <b>${COLOR_EL[weak]}</b> — 부족한 기운을 일상에서 채우십시오.`])});
  secs.push({mk:'決',free:false,t:DEC_T[me],html:P([
    `대표님의 승부 기질은 <b>${DEC_A[me]}</b> 쪽입니다.`,
    `일지 <b>${ZHI[c.dZhi]}</b>와 <b>${SIP[dom]}</b>의 기운이 겹쳐, 판단이 서면 좀처럼 되돌리지 않습니다.`,
    `그 힘이 큰 건을 따내지만, 지나치면 ${DEC_R[me]}.`,
    `투찰과 계약에서는 ${DEC_V[me]}.`])});
  secs.push({mk:'人',free:false,t:PPL_T[me],html:P([
    `대표님은 <b>${PPL_A[me]}</b> 유형이라, 직원과 파트너에게 ${PPL_E[me]}.`,
    `${dom===1?'특히 식상이 강해 말이 날카로워, 옳은 말도 상처가 되기 쉽습니다.':dom===3?'특히 관성이 강해 책임을 홀로 짊어지다 지치기 쉽습니다.':dom===2?'실리를 앞세워 사람보다 성과를 먼저 보기 쉽습니다.':'사람을 쓰는 데 본인만의 엄격한 기준이 섭니다.'}`,
    `그 기준이 조직을 세우지만, 선을 넘은 이는 가차 없이 잘라 홀로 남기도 합니다.`,
    `사람을 남기려면 ${PPL_V[me]}.`])});
  secs.push({mk:'財',free:false,t:WL_T[me],html:P([
    `대표님의 재물운은 <b>${['새 판을 벌여 키우는 확장형','크게 벌고 크게 쓰는 기복형','천천히 쌓는 축적형','끊고 맺어 남기는 결실형','굴려서 불리는 순환형'][me]}</b>입니다.`,
    `사주에 재성(財)의 기운이 <b>${sip[2]}</b>로 ${sip[2]>=2?'분명해':'옅어'}, ${WL_A[me]} 버는 구조입니다.`,
    `${WL_R[me]}.`,
    `수주와 자금은 ${WL_V[me]}.`])});
  if(legalChart){const lr=legalReport(c,legalChart);const nm=names.legal?`${names.legal} — `:'';
    secs.push({mk:'法',free:false,t:`${nm}법인의 그릇과 대표님의 궁합`,html:
      `<div class="compat"><div class="grade" style="background:${EL_HEX[lr.strong]}">法</div><div><div class="gt">${names.legal||'법인'} 일주 ${lr.pills} · ${EL[lr.strong]} 체질</div><div class="gs">대표님 ${GAN[c.dGan]}(${EL[c.dayMasterEl]})과 ${['비겁','식상','재성','관성','인성'][['bi','sik','jae','gwan','in'].indexOf(lr.rel)]} 관계</div></div></div>`+P(lr.paras)});
    if(daeunMeta&&daeunMeta.foundYear){const d=daeun(legalChart,daeunMeta.foundYear,daeunMeta.curYear);
      secs.push({mk:'運',free:false,t:`${names.legal||'회사'}의 대운 — 지금은 ${d.list[d.curBlock].from}~${d.list[d.curBlock].to}년차`,html:daeunSectionHtml(d,names.legal)});}}
  if(clientChart){const cm=compat(c,clientChart);const nm=names.client?`${names.client} — `:'';
    secs.push({mk:'處',free:false,t:`${nm}${cm.t}`,html:compatBlock(cm,c,names.client||'발주처')});}
  if(partnerChart){const cm=compatWith(c,partnerChart,DONGUP,'대표님','동업 상대');
    secs.push({mk:'同',free:false,t:`동업 · ${names.partner||'상대 대표'} — ${cm.t}`,html:compatBlock(cm,c,names.partner||'동업 상대')});}
  if(allyChart){const cm=compatWith(c,allyChart,HYEOPJEONG,'우리 법인','상대 회사');
    secs.push({mk:'協',free:false,t:`협정 · ${names.ally||'상대 회사'} — ${cm.t}`,html:compatBlock(cm,c,names.ally||'상대 회사')});}
  let rateHtml=gaugeHtml(s,worryTxt,unlocked)+cheobangHtml(s);
  if(nowYMD){const gc=gilCount(c,nowYMD.y,nowYMD.m);
    rateHtml+=`<div class="giltease"><div class="glt">이번 달 <b>${nowYMD.m}월</b> 투찰 길일이 <b>${gc}일</b> 있습니다</div><div class="gls">대표님 일간을 살리는 날 — 정확한 날짜는 아래 <b>擇日 캘린더</b>에서 확인하세요</div></div>`;}
  secs.push({mk:'率',free:true,t:`오늘, 당신의 사정률은 어느 쪽으로 뽑혔나`,html:rateHtml,gauge:true});
  if(nowYMD){secs.push({mk:'擇',free:false,t:`이번 달 투찰 길일 — ${nowYMD.m}월 택일(擇日)`,html:choilHtml(c,nowYMD.y,nowYMD.m)});}
  secs.push({mk:'方',free:false,t:`${DIR_EL[weak]} 방면이 대표님의 부족한 기운을 채웁니다`,html:P([
    `대표님께는 <b>${PLACE_EL[weak]}</b> 방면이 기운을 돋웁니다.`,
    `사주에 <b>${EL[weak]}</b>가 ${zero?'비어':'옅어'}, 그 기운이 채워지는 <b>${DIR_EL[weak]}</b> 현장·발주처가 유리합니다.`,
    `반대 방면은 예민함을 키우니, 그쪽 큰 건은 한 박자 신중히 보십시오.`,
    `사무실·현장 택지에도 같은 원리를 적용하십시오.`])});
  secs.push({mk:'士',free:false,t:`홀로 벼려온 그 날카로움이, 결국 대표님의 무기입니다`,html:P([
    `남들은 대표님을 <b>${CL_MIS[me]}</b>고 볼지 모르나, 그 뒤에 홀로 짊어진 무게를 저는 압니다.`,
    `타고난 <b>${EL[strong]}</b>의 힘으로 여기까지 오셨으니, 이제 그 기운을 ${CL_TURN[me]} 쓰실 때입니다.`,
    `행운 숫자 <b>${NUM_EL[weak]}</b>, 색 <b>${COLOR_EL[weak]}</b>, 방위 <b>${DIR_EL[weak]}</b> — 부족한 <b>${EL[weak]}</b>를 곁에 두십시오.`,
    `오늘도 그 마지막 한 끗을 살피는 참모 士가, 대표님의 길을 함께 봅니다.`])});
  return secs;
}

export type Section = { mk:string; free:boolean; t:string; html:string };
// 전체(유료 포함) 섹션 — 서버에서 결제 검증된 뒤에만 호출
export type RelNames = { client?:string; legal?:string; partner?:string; ally?:string };
export type DaeunMeta = { foundYear?:number; curYear:number };
export type NowYMD = { y:number; m:number; d:number };
export function reportHero(c:Chart, s:Sajeong){ return heroFor(c,s); }
export function buildFull(
  c:Chart, today:any, s:Sajeong, worry:string,
  cli?:Chart|null, legal?:Chart|null, partner?:Chart|null, ally?:Chart|null, names?:RelNames, daeunMeta?:DaeunMeta, nowYMD?:NowYMD
):Section[]{
  return buildReport(c,today,s,worry,cli,legal,partner,ally,true,names,daeunMeta,nowYMD) as Section[];
}
// 무료 티어 — 유료 섹션의 html을 제거(placeholder만)하고 정밀값도 삭제해 응답
export function buildFreeGated(
  c:Chart, today:any, s:Sajeong, worry:string,
  cli?:Chart|null, legal?:Chart|null, partner?:Chart|null, ally?:Chart|null, names?:RelNames, daeunMeta?:DaeunMeta, nowYMD?:NowYMD
):Section[]{
  const full = buildReport(c,today,s,worry,cli,legal,partner,ally,false,names,daeunMeta,nowYMD) as Section[];
  return full.map(sec => sec.free ? sec : { ...sec, html:'' }); // 유료 텍스트 미전송
}
