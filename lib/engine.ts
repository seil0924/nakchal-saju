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
export function compute(y:number,m:number,d:number,hourFloat:number|null):Chart{
  const lam=sunLongAt(y,m,d,hourFloat);
  let yy=y; if(m<=2 && lam<315) yy=y-1;              // 입춘(315°) 전이면 사주상 전해
  const yGan=((yy-4)%10+10)%10, yZhi=((yy-4)%12+12)%12;
  const mZhi=(2+Math.floor(((lam-315+360)%360)/30))%12, mOrder=(mZhi-2+12)%12, mStart=((yGan%5)*2+2)%10, mGan=(mStart+mOrder)%10;
  const dIdx=((jdn(y,m,d)+49)%60+60)%60, dGan=dIdx%10, dZhi=dIdx%12;
  let hGan:number|null=null,hZhi:number|null=null;
  if(hourFloat!==null){let hf=hourFloat;if(hf<0)hf+=24;hZhi=((Math.floor((hf+1)/2))%12+12)%12;hGan=((dGan%5)*2+hZhi)%10;}
  const dist=[0,0,0,0,0];
  dist[GAN_EL[yGan]]++;dist[ZHI_EL[yZhi]]++;dist[GAN_EL[mGan]]++;dist[ZHI_EL[mZhi]]++;dist[GAN_EL[dGan]]++;dist[ZHI_EL[dZhi]]++;
  if(hGan!==null){dist[GAN_EL[hGan]]++;dist[ZHI_EL[hZhi!]]++;}
  return {yGan,yZhi,mGan,mZhi,dGan,dZhi,hGan,hZhi,dayMasterEl:GAN_EL[dGan],dist};
}
// 생일 → 명식 (진태양시 -30분 보정)
export function chartFromBirth(dateISO:string,timeHHMM:string|null,cal:'solar'|'lunar'='solar',isLeap=false):Chart{
  let [y,m,d]=dateISO.split('-').map(Number);
  if(cal==='lunar'){const so=lunarToSolar(y,m,d,isLeap);y=so.y;m=so.m;d=so.d;}
  let hf:number|null=null;
  if(timeHHMM){const [hh,mm]=timeHHMM.split(':').map(Number);hf=hh+mm/60-0.5;} // 진태양시
  return compute(y,m,d,hf);
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
