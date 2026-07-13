// lib/engine.ts — 낙찰사주 만세력 엔진 (서버 전용)
// ⚠️ 이 모듈은 절대 클라이언트 번들에 포함되면 안 됩니다.
//    유료 정밀값(소수점 사정률·잠금 섹션)은 오직 서버에서만 계산해
//    결제가 검증된 요청에만 내려보냅니다. (server-only gating)

export const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const;
export const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const;
export const EL  = ['木','火','土','金','水'] as const;
export const EL_HEX = ['#2e8b57','#b5402f','#b58a2f','#6b7280','#2e5aa8'];
export const SIP = ['비겁','식상','재성','관성','인성'] as const;
const GAN_EL = [0,0,1,1,2,2,3,3,4,4];
const ZHI_EL = [4,2,0,0,2,1,1,2,3,3,2,4];
export const pil = (g:number,z:number)=>GAN[g]+ZHI[z];

export type Chart = {
  yGan:number; yZhi:number; mGan:number; mZhi:number;
  dGan:number; dZhi:number; hGan:number|null; hZhi:number|null;
  dayMasterEl:number; dist:number[];
};

// ── 율리우스 적일 → 일주 ──────────────────────────────
function jdn(y:number,m:number,d:number){
  const a=Math.floor((14-m)/12), yy=y+4800-a, mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
}
// ── 절기(節氣): 태양 황경 천문 계산 (Meeus 근사 ~0.01°≈분 단위) ──
// ⚠️ 고정 근사표를 쓰면 절기가 실제와 하루씩 어긋나 경계 출생자의 년/월주가 틀림.
//    출생 순간의 태양 황경으로 입춘(315°)·12절(節)을 정확히 판정한다.
function sunLong(jd:number):number{
  const T=(jd-2451545)/36525, R=Math.PI/180;
  const L0=280.46646+36000.76983*T+0.0003032*T*T;
  const M=357.52911+35999.05029*T-0.0001537*T*T;
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M*R)+(0.019993-0.000101*T)*Math.sin(2*M*R)+0.000289*Math.sin(3*M*R);
  const lam=L0+C-0.00569-0.00478*Math.sin((125.04-1934.136*T)*R);
  return ((lam%360)+360)%360;
}
// 출생 순간(KST)의 태양 황경. 시 모르면 정오 기준.
function sunLongAt(y:number,m:number,d:number,hourFloat:number|null):number{
  const clock=(hourFloat==null?12:hourFloat+0.5); // hourFloat=진태양시(clock-0.5)→clock 복원
  return sunLong(jdn(y,m,d)+(clock-9-12)/24);      // KST→UT
}

// ── 음력 → 양력 (1900~2100) ──────────────────────────
const lunarInfo=[0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,0x0d520];
const leapMonth=(y:number)=>lunarInfo[y-1900]&0xf;
const leapDays=(y:number)=>leapMonth(y)?((lunarInfo[y-1900]&0x10000)?30:29):0;
const lMonthDays=(y:number,m:number)=>(lunarInfo[y-1900]&(0x10000>>m))?30:29;
function lunarYearDays(y:number){let s=0;for(let m=1;m<=12;m++)s+=lMonthDays(y,m);return s+leapDays(y);}
export function lunarToSolar(y:number,m:number,d:number,isLeap=false){
  if(y<1900||y>2100)return {y,m,d};
  let offset=0;for(let i=1900;i<y;i++)offset+=lunarYearDays(i);
  const leap=leapMonth(y);
  for(let mm=1;mm<m;mm++){offset+=lMonthDays(y,mm);if(leap===mm)offset+=leapDays(y);}
  if(isLeap&&leap===m)offset+=lMonthDays(y,m);
  offset+=d-1;
  const dt=new Date(Date.UTC(1900,0,31)+offset*86400000);
  return {y:dt.getUTCFullYear(),m:dt.getUTCMonth()+1,d:dt.getUTCDate()};
}

// ── 명식 계산 ─────────────────────────────────────────
export function compute(y:number,m:number,d:number,hourFloat:number|null,yaja=false):Chart{
  const lam=sunLongAt(y,m,d,hourFloat);
  let yy=y; if(m<=2 && lam<315) yy=y-1;              // 입춘(315°) 전이면 사주상 전해
  const yGan=((yy-4)%10+10)%10, yZhi=((yy-4)%12+12)%12;
  const mZhi=(2+Math.floor(((lam-315+360)%360)/30))%12, mOrder=(mZhi-2+12)%12, mStart=((yGan%5)*2+2)%10, mGan=(mStart+mOrder)%10;
  const dIdx=((jdn(y,m,d)+49)%60+60)%60, dGan=dIdx%10, dZhi=dIdx%12;
  let hGan:number|null=null,hZhi:number|null=null;
  if(hourFloat!==null){let hf=hourFloat;if(hf<0)hf+=24;hZhi=((Math.floor((hf+1)/2))%12+12)%12;
    const hourDayGan=yaja?(dGan+1)%10:dGan;        // 야자시(23시~): 익일 일간으로 시간(時干)
    hGan=((hourDayGan%5)*2+hZhi)%10;}
  const dist=[0,0,0,0,0];
  dist[GAN_EL[yGan]]++;dist[ZHI_EL[yZhi]]++;dist[GAN_EL[mGan]]++;dist[ZHI_EL[mZhi]]++;dist[GAN_EL[dGan]]++;dist[ZHI_EL[dZhi]]++;
  if(hGan!==null){dist[GAN_EL[hGan]]++;dist[ZHI_EL[hZhi!]]++;}
  return {yGan,yZhi,mGan,mZhi,dGan,dZhi,hGan,hZhi,dayMasterEl:GAN_EL[dGan],dist};
}
// 한국 서머타임(일광절약시간) 시행 기간 — 이때 태어난 시각은 −1시간 보정해야 시주가 맞음
const DST:[number,number][]=[[19480601,19480913],[19490403,19490911],[19500401,19500910],[19510506,19510909],
  [19550505,19550909],[19560520,19560930],[19570505,19570922],[19580504,19580921],[19590503,19590920],[19600501,19600918],
  [19870510,19871011],[19880508,19881009]];
function isDST(y:number,m:number,d:number){const k=y*10000+m*100+d;return DST.some(([a,b])=>k>=a&&k<b);}

// 생일 → 명식 (서머타임 보정 · 진태양시 −30분 · 야자시 처리)
export function chartFromBirth(dateISO:string,timeHHMM:string|null,cal:'solar'|'lunar'='solar',isLeap=false):Chart{
  let [y,m,d]=dateISO.split('-').map(Number);
  if(cal==='lunar'){const so=lunarToSolar(y,m,d,isLeap);y=so.y;m=so.m;d=so.d;}
  let hf:number|null=null, yaja=false;
  if(timeHHMM){
    const [hh,mm]=timeHHMM.split(':').map(Number);
    let total=hh*60+mm-(isDST(y,m,d)?60:0);      // 서머타임 −1시간
    if(total<0){ total+=1440; const dt=new Date(Date.UTC(y,m-1,d)); dt.setUTCDate(dt.getUTCDate()-1); y=dt.getUTCFullYear();m=dt.getUTCMonth()+1;d=dt.getUTCDate(); }
    const clock=total/60;
    yaja = clock>=23;                            // 야자시
    hf = clock-0.5;                              // 진태양시
  }
  return compute(y,m,d,hf,yaja);
}

export function sipsung(c:Chart):number[]{
  const me=c.dayMasterEl;
  const els=[GAN_EL[c.yGan],ZHI_EL[c.yZhi],GAN_EL[c.mGan],ZHI_EL[c.mZhi],ZHI_EL[c.dZhi]];
  if(c.hGan!==null){els.push(GAN_EL[c.hGan],ZHI_EL[c.hZhi!]);}
  const d=[0,0,0,0,0];
  for(const e of els){if(e===me)d[0]++;else if((me+1)%5===e)d[1]++;else if((me+2)%5===e)d[2]++;else if((e+2)%5===me)d[3]++;else if((e+1)%5===me)d[4]++;}
  return d; // [비겁,식상,재성,관성,인성]
}
export function relation(me:number,td:number){
  if(td===me)return'bi'; if((td+1)%5===me)return'in';
  if((me+1)%5===td)return'sik'; if((me+2)%5===td)return'jae';
  if((td+2)%5===me)return'gwan'; return'bi';
}
export function todayPillar(y:number,m:number,d:number){
  const i=((jdn(y,m,d)+49)%60+60)%60, g=i%10;
  return {gan:g,zhi:i%12,el:GAN_EL[g]};
}

// ── 원국(元局): 사주팔자 판 표시 모델 ──────────────────
export type Pillar = { pos:string; gan:number; zhi:number; ganEl:number; zhiEl:number; sip:string };
export function wonguk(c:Chart):Pillar[]{
  const me=GAN_EL[c.dGan];
  const sipOf=(g:number,isDay:boolean)=>{ if(isDay)return '일원'; const t=GAN_EL[g];
    if(t===me)return '비겁'; if((me+1)%5===t)return '식상'; if((me+2)%5===t)return '재성'; if((t+2)%5===me)return '관성'; return '인성';};
  const cols:Pillar[]=[
    {pos:'年',gan:c.yGan,zhi:c.yZhi,ganEl:GAN_EL[c.yGan],zhiEl:ZHI_EL[c.yZhi],sip:sipOf(c.yGan,false)},
    {pos:'月',gan:c.mGan,zhi:c.mZhi,ganEl:GAN_EL[c.mGan],zhiEl:ZHI_EL[c.mZhi],sip:sipOf(c.mGan,false)},
    {pos:'日',gan:c.dGan,zhi:c.dZhi,ganEl:GAN_EL[c.dGan],zhiEl:ZHI_EL[c.dZhi],sip:sipOf(c.dGan,true)},
  ];
  if(c.hGan!==null&&c.hZhi!==null)
    cols.push({pos:'時',gan:c.hGan,zhi:c.hZhi,ganEl:GAN_EL[c.hGan],zhiEl:ZHI_EL[c.hZhi],sip:sipOf(c.hGan,false)});
  return cols;
}

// ── 신살(神殺): 명식에서 드러나는 특수 부호 ──────────────
//   사주아이류가 "어떻게 알았지" 반응을 끌어내는 핵심 장치.
//   대표(경영자) 정서에 맞춰 위엄 있는 참모 어투로 서술한다.
export type Sinsal = { key:string; name:string; hanja:string; head:string; body:string };
const has=(arr:(number|null)[],set:number[])=>arr.some(z=>z!==null&&set.includes(z as number));
export function sinsal(c:Chart):Sinsal[]{
  const out:Sinsal[]=[];
  const dj=`${c.dGan}_${c.dZhi}`;
  const zhis=[c.yZhi,c.mZhi,c.dZhi,c.hZhi];
  // 괴강살(魁罡殺) — 庚辰·庚戌·壬辰·壬戌·戊戌
  if(['6_4','6_10','8_4','8_10','4_10'].includes(dj))
    out.push({key:'괴강',name:'괴강살',hanja:'魁罡殺',
      head:'우두머리로 태어난, 물러섬을 모르는 대장부',
      body:'일주에 <b>괴강(魁罡)</b>이 앉았습니다. 만인을 이끄는 극단의 리더 부호라, 어중간을 못 견디고 끝을 봐야 직성이 풀리셨을 겁니다. 평사원으로는 답답해 스스로 판을 벌이셨을 자리 — 다만 그 강함이 사람을 눌러 홀로 서기도 쉬우니, 힘을 거둘 때를 아는 것이 그릇의 완성입니다.'});
  // 백호대살(白虎大殺) — 甲辰·乙未·丙戌·丁丑·戊辰·壬戌·癸丑
  if(['0_4','1_7','2_10','3_1','4_4','8_10','9_1'].includes(dj))
    out.push({key:'백호',name:'백호살',hanja:'白虎殺',
      head:'크게 얻거나 크게 잃거나, 어중간이 없는 승부의 별',
      body:'일주에 <b>백호(白虎)</b>가 실렸습니다. 판이 커질수록 살아나는 기질이라, 남들이 몸 사릴 때 대표님은 오히려 크게 지르셨을 겁니다. 그 배포가 오늘을 만들었으나, 한 번의 큰 건에 전부를 거는 습관은 화가 되니 하한선을 정해두고 움직이십시오.'});
  // 양인살(羊刃殺) — 양간 일간이 제왕지(帝旺)를 볼 때
  const yangin:Record<number,number>={0:3,2:6,4:6,6:9,8:0};
  if(yangin[c.dGan]!==undefined && c.dZhi===yangin[c.dGan])
    out.push({key:'양인',name:'양인살',hanja:'羊刃殺',
      head:'칼을 쥔 손 — 밀어붙이는 힘이 곧 무기이자 흉기',
      body:'일지에 <b>양인(羊刃)</b>이 들었습니다. 한번 방향이 서면 좌우 안 보고 끝까지 미는 강력한 추진력 — 큰 건을 뚫어내는 대표님의 진짜 힘입니다. 다만 그 칼끝이 안으로 향하면 무리한 저가·과속으로 스스로를 베니, 결단의 순간마다 물러설 선을 함께 정하십시오.'});
  // 천을귀인(天乙貴人) — 일간별 귀인 지지
  const gwiin:Record<number,number[]>={0:[1,7],4:[1,7],6:[1,7],1:[0,8],5:[0,8],2:[11,9],3:[11,9],7:[6,2],8:[5,3],9:[5,3]};
  if(has(zhis,gwiin[c.dGan]||[]))
    out.push({key:'천을',name:'천을귀인',hanja:'天乙貴人',
      head:'결정적 순간마다 사람이 붙는, 타고난 귀인복',
      body:'명식에 <b>천을귀인(天乙貴人)</b>이 있습니다. 사주 중 으뜸으로 치는 길신 — 벼랑 끝이라 생각한 자리에서 뜻밖의 사람·발주처가 손을 내밀어준 경험이 한두 번이 아니셨을 겁니다. 이 복은 사람에게 정을 들일수록 커지니, 관계를 넓게 오래 보십시오.'});
  // 현침살(懸針殺) — 甲午·甲申·辛卯·辛未 일주
  if(['0_6','0_8','7_3','7_7'].includes(dj))
    out.push({key:'현침',name:'현침살',hanja:'懸針殺',
      head:'입만 열면 정곡을 찌르는, 바늘 같은 예리함',
      body:'일주에 <b>현침(懸針)</b>이 섰습니다. 남이 못 보는 허점을 단번에 짚어내는 날카로운 통찰 — 협상 테이블에서 대표님의 무기입니다. 다만 그 말이 바늘이라 옳은 말도 상처를 남기니, 정확함 뒤에 한마디 온기를 더하면 사람이 남습니다.'});
  // 역마살(驛馬殺) — 지지 寅申巳亥
  if(has(zhis,[2,8,5,11]))
    out.push({key:'역마',name:'역마살',hanja:'驛馬殺',
      head:'한자리에 못 앉는, 넓힐수록 사는 확장의 기운',
      body:'명식에 <b>역마(驛馬)</b>가 붙었습니다. 가만히 지키는 것보다 현장을 돌고 판을 넓힐 때 운이 트이는 기질 — 지역·업역을 넓히는 확장이 대표님께 유리합니다. 다만 벌인 판이 많아 관리에서 새기 쉬우니, 뻗을 때일수록 안살림 챙길 사람을 곁에 두십시오.'});
  // 화개살(華蓋殺) — 일지 辰戌丑未
  if([4,10,1,7].includes(c.dZhi) && out.length<2)
    out.push({key:'화개',name:'화개살',hanja:'華蓋殺',
      head:'무리 속에서도 끝내 혼자인, 고독한 장인의 별',
      body:'일지에 <b>화개(華蓋)</b>가 앉았습니다. 사람은 많이 겪되 속을 다 내주진 않는, 한 분야를 깊이 파는 전문가의 부호입니다. 외로우셨을 겁니다 — 허나 그 고독이 남들 못 따라오는 전문성을 벼렸으니, 이제는 그 깊이를 사람 키우는 데 나눠 쓰실 때입니다.'});
  return out.slice(0,2);
}

// ── 사정률 (결정론적 · 서버에서만 정밀값 산출) ─────────
const TILT:Record<string,number>={in:2,bi:1,jae:1,sik:-1,gwan:-2};
function mulberry32(a:number){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function mkBridge(rel:string,me:number,td:number){const M=EL[me],D=EL[td];
  if(rel==='in')return `오늘은 <b>${D}</b> 기운이 당신의 <b>${M}</b> 기운을 살리는 날 — 위로 뻗어 사정률이 <b>상단</b>으로 뽑혔습니다.`;
  if(rel==='bi')return `오늘은 당신과 같은 <b>${M}</b> 기운이 힘을 보태는 날 — <b>상단</b> 흐름으로 뽑혔습니다.`;
  if(rel==='jae')return `오늘은 당신이 다스리는 <b>${D}</b> 기운의 날, 재물의 기운이라 <b>약간 위</b>로 뽑혔습니다.`;
  if(rel==='sik')return `오늘은 당신의 <b>${M}</b> 기운이 <b>${D}</b>로 새어나가는 날 — 힘이 빠져 <b>하단</b>으로 뽑혔습니다.`;
  return `오늘은 <b>${D}</b> 기운이 당신의 <b>${M}</b> 기운을 누르는 날 — 눌린 기운이라 <b>하단</b>으로 뽑혔습니다.`;}
export type Sajeong = {
  rel:string; tilt:number; up:boolean;
  dir:string; bandLo:string; bandHi:string; pos:number; bridge:string;
  precise:string; // ⚠️ 유료값 — API에서 잠금 시 응답 전 제거
};
// ── 세운(歲運): 그 해의 간지 × 명식 상성 ─────────────────
// 타고난 사주는 고정이지만, 그 해(세운)가 명식을 살리느냐 누르느냐로
// '올해의 흐름'은 매년 바뀐다. 대표·회사·궁합을 연도별로 보는 근거.
export function yearGanji(year:number){
  const g=((year-4)%10+10)%10, z=((year-4)%12+12)%12;
  return {g,z,el:GAN_EL[g],hanja:GAN[g]+ZHI[z]};
}
export type Seun = { year:number; rel:string; el:number; gan:number; zhi:number; hanja:string; tilt:number };
export function seunOf(c:Chart, year:number):Seun{
  const y=yearGanji(year);
  const rel=relation(c.dayMasterEl,y.el);
  return { year, rel, el:y.el, gan:y.g, zhi:y.z, hanja:y.hanja, tilt:(TILT[rel]??0) };
}
export function sajeong(c:Chart, today:{gan:number;zhi:number;el:number}):Sajeong{
  const rel=relation(c.dayMasterEl,today.el), t=TILT[rel];
  const seed=((c.yGan*31+c.yZhi*17+c.mGan*13+c.mZhi*7+c.dGan*3+c.dZhi)*997+(today.gan*11+today.zhi)*61)>>>0;
  const r=mulberry32(seed)();
  const center=100+t*0.35+(r-0.5)*0.4;
  const precise=Math.round(center*100)/100;
  const up=t>0;
  return {
    rel, tilt:t, up,
    dir: up?'상단 밴드':'하단 밴드',
    bandLo:(up?100.0:98.6).toFixed(1), bandHi:(up?101.2:100.2).toFixed(1),
    pos: Math.max(4,Math.min(96,(precise-98)/4*100)),
    bridge: mkBridge(rel,c.dayMasterEl,today.el),
    precise: precise.toFixed(2),
  };
}
