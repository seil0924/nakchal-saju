// lib/manse-core.ts — 만세력 공통 코어 (서버·클라 공용, server-only 아님)
// engine.ts(서버)·preview.ts(클라)가 이 파일을 import 해 만세력 중복을 제거한다.

export const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const;
export const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const;
export const EL  = ['木','火','土','金','水'] as const;
export const EL_HEX = ['#2e8b57','#b5402f','#b58a2f','#6b7280','#2e5aa8'];
export const SIP = ['비겁','식상','재성','관성','인성'] as const;
export const GAN_EL = [0,0,1,1,2,2,3,3,4,4];
export const ZHI_EL = [4,2,0,0,2,1,1,2,3,3,2,4];
export const pil = (g:number,z:number)=>GAN[g]+ZHI[z];

export type Chart = {
  yGan:number; yZhi:number; mGan:number; mZhi:number;
  dGan:number; dZhi:number; hGan:number|null; hZhi:number|null;
  dayMasterEl:number; dist:number[];
};

// ── 율리우스 적일 → 일주 ──────────────────────────────
export function jdn(y:number,m:number,d:number){
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

// 한국 서머타임(일광절약시간) 시행 기간 — 이때 태어난 시각은 −1시간 보정해야 시주가 맞음
const DST:[number,number][]=[[19480601,19480913],[19490403,19490911],[19500401,19500910],[19510506,19510909],
  [19550505,19550909],[19560520,19560930],[19570505,19570922],[19580504,19580921],[19590503,19590920],[19600501,19600918],
  [19870510,19871011],[19880508,19881009]];
function isDST(y:number,m:number,d:number){const k=y*10000+m*100+d;return DST.some(([a,b])=>k>=a&&k<b);}

// ── 원국(명식) 공통 계산 — 서버 compute()·클라 computePreview() 공용 ──
export type CorePillars = { yGan:number;yZhi:number;mGan:number;mZhi:number;dGan:number;dZhi:number;hGan:number|null;hZhi:number|null;dayMasterEl:number };
export function corePillars(y:number,m:number,d:number,hourFloat:number|null,yaja=false):CorePillars{
  const lam=sunLongAt(y,m,d,hourFloat);
  let yy=y; if(m<=2 && lam<315) yy=y-1;              // 입춘(315°) 전이면 사주상 전해
  const yGan=((yy-4)%10+10)%10, yZhi=((yy-4)%12+12)%12;
  const mZhi=(2+Math.floor(((lam-315+360)%360)/30))%12, mOrder=(mZhi-2+12)%12, mStart=((yGan%5)*2+2)%10, mGan=(mStart+mOrder)%10;
  const dIdx=((jdn(y,m,d)+49)%60+60)%60, dGan=dIdx%10, dZhi=dIdx%12;
  let hGan:number|null=null,hZhi:number|null=null;
  if(hourFloat!==null){let hf=hourFloat;if(hf<0)hf+=24;hZhi=((Math.floor((hf+1)/2))%12+12)%12;
    const hourDayGan=yaja?(dGan+1)%10:dGan;        // 야자시(23시~): 익일 일간으로 시간(時干)
    hGan=((hourDayGan%5)*2+hZhi)%10;}
  return {yGan,yZhi,mGan,mZhi,dGan,dZhi,hGan,hZhi,dayMasterEl:GAN_EL[dGan]};
}
// 생일 문자열 → 계산 파라미터(서머타임·진태양시·야자시·음력 보정). null 가드는 호출측에서.
export function resolveBirth(dateISO:string,timeHHMM:string|null,cal:'solar'|'lunar'='solar',isLeap=false){
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
  return {y,m,d,hf,yaja};
}
