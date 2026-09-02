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
export function sunLong(jd:number):number{
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

// ── 출생지 ───────────────────────────────────────────
// 진태양시를 내려면 태어난 곳의 경도와 시간대가 있어야 한다.
// 예전에는 −30분(한국 경도 127.5°)으로 박아 두었는데, 그러면 한국 밖에서 태어난 사람의 시주가 틀린다.
export type Birthplace = { lng: number; tz: string; label?: string };
export const KOREA: Birthplace = { lng: 127.5, tz: 'Asia/Seoul', label: '대한민국' };

// 그 시간대의 그 순간 UTC 오프셋(분). 브라우저·Node 에 들어 있는 tz 자료를 그대로 쓴다 —
// 나라별 서머타임 이력(한국 1948~1988 포함)이 거기 다 있어 표를 따로 들고 있을 이유가 없다.
function tzOffsetMin(tz:string, utcMs:number):number{
  const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,hour12:false,
    year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'})
    .formatToParts(new Date(utcMs));
  const g=(k:string)=>Number(p.find(x=>x.type===k)!.value);
  const asUTC=Date.UTC(g('year'),g('month')-1,g('day'),g('hour')%24,g('minute'),g('second'));
  return Math.round((asUTC-utcMs)/60000);
}
// 벽시계 시각 → UTC. 오프셋이 그 순간에 달려 있어 한 번 되짚어야 맞는다.
function wallToUtcMs(y:number,m:number,d:number,hh:number,mi:number,tz:string):number{
  const naive=Date.UTC(y,m-1,d,hh,mi);
  const utc=naive-tzOffsetMin(tz,naive)*60000;
  return naive-tzOffsetMin(tz,utc)*60000;
}
// 그 해 그 지역의 '표준시' 오프셋 — 서머타임이 걸리지 않은 쪽.
// 서머타임은 언제나 시계를 앞으로 돌리므로 둘 중 작은 값이 표준시다(남반구도 같다).
function stdOffsetMin(tz:string,y:number):number{
  return Math.min(tzOffsetMin(tz,Date.UTC(y,0,15)),tzOffsetMin(tz,Date.UTC(y,6,15)));
}
// 진태양시 보정(분) = (출생지 경도 − 그날 표준자오선) × 4.
// 표준자오선을 '그날 실제 오프셋'에서 뽑기 때문에 서머타임도 이 식 하나로 같이 풀린다.
// 한국 평시 −30분, 1988년 서머타임 −90분으로 예전 값과 그대로 맞는다.
export function solarShiftMin(p:Birthplace,y:number,m:number,d:number,hh:number,mi:number):number{
  const off=tzOffsetMin(p.tz,wallToUtcMs(y,m,d,hh,mi,p.tz));
  return Math.round((p.lng-off/4)*4);
}
// 그날 서머타임으로 앞당겨진 양(분).
export function dstShiftMin(p:Birthplace,y:number,m:number,d:number,hh:number,mi:number):number{
  return tzOffsetMin(p.tz,wallToUtcMs(y,m,d,hh,mi,p.tz))-stdOffsetMin(p.tz,y);
}


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
export function resolveBirth(dateISO:string,timeHHMM:string|null,cal:'solar'|'lunar'='solar',isLeap=false,place:Birthplace=KOREA){
  let [y,m,d]=dateISO.split('-').map(Number);
  if(cal==='lunar'){const so=lunarToSolar(y,m,d,isLeap);y=so.y;m=so.m;d=so.d;}
  let hf:number|null=null, yaja=false;
  if(timeHHMM){
    const [hh,mm]=timeHHMM.split(':').map(Number);
    // 야자시는 예전대로 '표준시'로 가른다. 여기 손대면 이미 나간 리포트의 일주가 바뀌는 사람이 생긴다.
    yaja=(hh*60+mm-dstShiftMin(place,y,m,d,hh,mm))/60>=23;
    let total=hh*60+mm+solarShiftMin(place,y,m,d,hh,mm);
    const roll=(n:number)=>{const dt=new Date(Date.UTC(y,m-1,d));dt.setUTCDate(dt.getUTCDate()+n);y=dt.getUTCFullYear();m=dt.getUTCMonth()+1;d=dt.getUTCDate();};
    // 자정을 넘나들면 날짜를 옮긴다. 예전에는 음수로 새어 시주가 어긋났다(00:00~00:29 출생).
    // 전날로 넘어가면 그 날의 야자시가 되므로, 일주는 예전과 같은 자리에 남는다.
    if(total<0){ total+=1440; roll(-1); yaja=true; }
    else if(total>=1440){ total-=1440; roll(1); }
    hf=total/60;                                 // 진태양시
  }
  return {y,m,d,hf,yaja};
}

// ── 십성 관계 · 연간지 ─────────────────────────────
// engine.ts(서버) 에만 있던 것을 여기로 내렸다. /hoesa 처럼 유료 해석 없이
// 관계만 필요한 화면이 engine 을 끌어오지 않도록 — 그리고 같은 식을 두 벌 쓰지 않도록.
export function relation(me: number, td: number) {
  if (td === me) return 'bi'; if ((td + 1) % 5 === me) return 'in';
  if ((me + 1) % 5 === td) return 'sik'; if ((me + 2) % 5 === td) return 'jae';
  if ((td + 2) % 5 === me) return 'gwan'; return 'bi';
}
export function yearGanji(year: number) {
  const g = ((year - 4) % 10 + 10) % 10, z = ((year - 4) % 12 + 12) % 12;
  return { g, z, el: GAN_EL[g], hanja: GAN[g] + ZHI[z] };
}
