// lib/report-copy.ts — 낙찰사주 리포트 카피 + 섹션 생성 (서버 전용)
// ⚠️ 유료 섹션 텍스트는 이 모듈에서만 생성됩니다. 클라이언트로 직접 노출 금지.
import 'server-only';
import { GAN, ZHI, EL, EL_HEX, SIP, pil, sipsung, relation, type Chart, type Sajeong } from './engine';

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
const RELG={
 in:{g:'合',grade:'상생(相生)',score:'매우 좋음',gc:'#177f5e',
   t:'{S}가 {A}을 밀어주는 자리',
   p:['{S}의 <b>{O}</b> 기운이 {A}의 <b>{M}</b> 기운을 살립니다. 명리로 <b>인성(印星)</b> — 상대가 나를 키워주는, 궁합 중 가장 귀한 자리입니다.','억지로 맞추지 않아도 흐름이 순합니다. {A}을 받쳐주는 인연이니 길게 보고 신뢰를 쌓으십시오.','다만 기대어 안주하기 쉬우니, 받은 만큼 제 몫을 해낸다는 자세면 오래갑니다.']},
 jae:{g:'財',grade:'재물(財)',score:'좋음',gc:'#b58a2f',
   t:'{A}이 결실을 쥐고 이끄는 자리',
   p:['{A}의 <b>{M}</b> 기운이 {S}의 <b>{O}</b> 기운을 다스립니다. 명리로 <b>재성(財星)</b> — 내가 주도권을 쥐고 결실을 취하는 관계입니다.','역할·지분을 {A} 중심으로 정하면 순조롭습니다. 다만 급히 쥐려다 무리하면 탈이 나니 페이스를 지키십시오.','상대를 도구로만 보면 오래 못 가니, 취하는 만큼 대우도 챙기십시오.']},
 bi:{g:'比',grade:'대등(比肩)',score:'보통',gc:'#6f6a5c',
   t:'대등하게 맞서는 자리',
   p:['{S}와 {A}이 같은 <b>{M}</b> 기운입니다. 명리로 <b>비겁(比劫)</b> — 서로 대등해, 맞으면 든든한 동지요 어긋나면 경쟁이 되는 자리입니다.','역할·지분·책임을 처음부터 문서로 못박아야 뒤탈이 없습니다.','같은 강점이 겹치기 쉬우니, 서로 다른 영역을 맡아야 시너지가 납니다.']},
 sik:{g:'食',grade:'베풂(食傷)',score:'노력 필요',gc:'#b5402f',
   t:'{A}이 더 내주는 자리',
   p:['{A}의 <b>{M}</b> 기운이 {S}의 <b>{O}</b> 기운으로 흘러 나갑니다. 명리로 <b>식상(食傷)</b> — 내가 베풀고 이끄는 관계라 {A}이 더 많이 내줍니다.','{A}이 리드하고 상대가 따라오는 구도면 잘 맞습니다. 다만 소모가 크니 선을 정하십시오.','단기 성과보다 {A}이 키워 함께 크는 그림일 때 빛납니다.']},
 gwan:{g:'官',grade:'압박(官星)',score:'까다로움',gc:'#22406b',
   t:'상대의 기준이 까다로운 자리',
   p:['{S}의 <b>{O}</b> 기운이 {A}의 <b>{M}</b> 기운을 누릅니다. 명리로 <b>관성(官星)</b> — 상대가 {A}을 통제하는 관계라 기준과 요구가 까다롭게 느껴집니다.','감정보다 원칙과 문서로 다가가야 통합니다. 주도권을 상대가 쥐기 쉬우니 조건을 미리 분명히 하십시오.','한번 신뢰를 얻으면 든든한 울타리가 되니, 초반의 깐깐함을 관문으로 여기십시오.']}
};
function compatWith(meChart,otherChart,table,A,S){
 const me=meChart.dayMasterEl,o=otherChart.dayMasterEl;
 const rel=relation(me,o);const c=table[rel];
 const fill=s=>s.replace(/\{M\}/g,EL[me]).replace(/\{O\}/g,EL[o]).replace(/\{A\}/g,A).replace(/\{S\}/g,S);
 return {rel,grade:c.grade,score:c.score,gc:c.gc,letter:c.g,t:fill(c.t),
   pills:pil(otherChart.dGan,otherChart.dZhi),paras:c.p.map(fill)};
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
  return `<div class="compat"><div class="grade" style="background:${cm.gc}">${cm.letter}</div><div><div class="gt">${cm.grade} · ${cm.score}</div><div class="gs">${relLabel} 일주 <b>${cm.pills}</b></div></div></div>`+P(cm.paras);
}
function buildReport(c,today,s,worryTxt,clientChart,legalChart,partnerChart,allyChart,unlocked){
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
  if(legalChart){const lr=legalReport(c,legalChart);
    secs.push({mk:'法',free:false,t:`법인의 그릇과 대표님의 궁합`,html:
      `<div class="compat"><div class="grade" style="background:${EL_HEX[lr.strong]}">法</div><div><div class="gt">법인 일주 ${lr.pills} · ${EL[lr.strong]} 체질</div><div class="gs">대표님 ${GAN[c.dGan]}(${EL[c.dayMasterEl]})과 ${['비겁','식상','재성','관성','인성'][['bi','sik','jae','gwan','in'].indexOf(lr.rel)]} 관계</div></div></div>`+P(lr.paras)});}
  if(clientChart){const cm=compat(c,clientChart);
    secs.push({mk:'處',free:false,t:cm.t,html:compatHtml(cm,'발주처')});}
  if(partnerChart){const cm=compatWith(c,partnerChart,RELG,'대표님','동업 상대');
    secs.push({mk:'同',free:false,t:`동업 궁합 — ${cm.t}`,html:compatHtml(cm,'동업 상대')});}
  if(allyChart){const cm=compatWith(c,allyChart,RELG,'우리 법인','상대 회사');
    secs.push({mk:'協',free:false,t:`협정 궁합 — ${cm.t}`,html:compatHtml(cm,'상대 회사')});}
  secs.push({mk:'率',free:true,t:`오늘, 당신의 사정률은 어느 쪽으로 뽑혔나`,html:gaugeHtml(s,worryTxt,unlocked),gauge:true});
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
export function buildFull(
  c:Chart, today:any, s:Sajeong, worry:string,
  cli?:Chart|null, legal?:Chart|null, partner?:Chart|null, ally?:Chart|null
):Section[]{
  return buildReport(c,today,s,worry,cli,legal,partner,ally,true) as Section[];
}
// 무료 티어 — 유료 섹션의 html을 제거(placeholder만)하고 정밀값도 삭제해 응답
export function buildFreeGated(
  c:Chart, today:any, s:Sajeong, worry:string,
  cli?:Chart|null, legal?:Chart|null, partner?:Chart|null, ally?:Chart|null
):Section[]{
  const full = buildReport(c,today,s,worry,cli,legal,partner,ally,false) as Section[];
  return full.map(sec => sec.free ? sec : { ...sec, html:'' }); // 유료 텍스트 미전송
}
