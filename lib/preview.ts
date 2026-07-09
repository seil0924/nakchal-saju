// lib/preview.ts — 클라이언트용 명식 미리보기 (안전 부분집합)
// ⚠️ 사정률(방향·밴드·소수점)은 여기 없음 — 그건 서버(engine.ts)에서만.
//    여기는 만세력 명식 + 십성만 계산해 입력 중 실시간 표시에 씁니다.

export const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
export const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
export const EL  = ['木','火','土','金','水'];
export const EL_HEX = ['#2e8b57','#b5402f','#b58a2f','#6b7280','#2e5aa8'];
export const SIP = ['비겁','식상','재성','관성','인성'];
const GAN_EL = [0,0,1,1,2,2,3,3,4,4];
const ZHI_EL = [4,2,0,0,2,1,1,2,3,3,2,4];
export const pil = (g:number,z:number)=>GAN[g]+ZHI[z];

function jdn(y:number,m:number,d:number){const a=Math.floor((14-m)/12);const yy=y+4800-a;const mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
const TERMS=[[1,6,1],[2,4,2],[3,6,3],[4,5,4],[5,6,5],[6,6,6],[7,7,7],[8,8,8],[9,8,9],[10,8,10],[11,7,11],[12,7,0]];
function monthZhi(y:number,m:number,d:number){let z=0;for(const [tm,td,zi] of TERMS){if(m>tm||(m===tm&&d>=td))z=zi;}return z;}
function beforeIpchun(m:number,d:number){return (m<2)||(m===2&&d<4);}

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

export type PChart = { yGan:number;yZhi:number;mGan:number;mZhi:number;dGan:number;dZhi:number;hGan:number|null;hZhi:number|null;dayMasterEl:number };
export function computePreview(y:number,m:number,d:number,hourFloat:number|null):PChart{
  let yy=y;if(beforeIpchun(m,d))yy=y-1;
  const yGan=((yy-4)%10+10)%10,yZhi=((yy-4)%12+12)%12;
  const mZhi=monthZhi(y,m,d),mOrder=(mZhi-2+12)%12,mStart=((yGan%5)*2+2)%10,mGan=(mStart+mOrder)%10;
  const dIdx=((jdn(y,m,d)+49)%60+60)%60,dGan=dIdx%10,dZhi=dIdx%12;
  let hGan:number|null=null,hZhi:number|null=null;
  if(hourFloat!==null){let hf=hourFloat;if(hf<0)hf+=24;hZhi=((Math.floor((hf+1)/2))%12+12)%12;hGan=((dGan%5)*2+hZhi)%10;}
  return {yGan,yZhi,mGan,mZhi,dGan,dZhi,hGan,hZhi,dayMasterEl:GAN_EL[dGan]};
}
export function chartFromInput(dateISO:string,timeHHMM:string|null,cal:'solar'|'lunar'='solar',isLeap=false):PChart|null{
  if(!dateISO) return null;
  let [y,m,d]=dateISO.split('-').map(Number);
  if(!y||!m||!d) return null;
  if(cal==='lunar'){const so=lunarToSolar(y,m,d,isLeap);y=so.y;m=so.m;d=so.d;}
  let hf:number|null=null;
  if(timeHHMM){const [hh,mm]=timeHHMM.split(':').map(Number);hf=hh+mm/60-0.5;}
  return computePreview(y,m,d,hf);
}
export function sipsungPreview(c:PChart):number[]{
  const me=c.dayMasterEl;
  const els=[GAN_EL[c.yGan],ZHI_EL[c.yZhi],GAN_EL[c.mGan],ZHI_EL[c.mZhi],ZHI_EL[c.dZhi]];
  if(c.hGan!==null){els.push(GAN_EL[c.hGan],ZHI_EL[c.hZhi!]);}
  const dd=[0,0,0,0,0];
  for(const e of els){if(e===me)dd[0]++;else if((me+1)%5===e)dd[1]++;else if((me+2)%5===e)dd[2]++;else if((e+2)%5===me)dd[3]++;else if((e+1)%5===me)dd[4]++;}
  return dd;
}
export const GAN_ELc=GAN_EL; export const ZHI_ELc=ZHI_EL;
export const SIJIN=[
 ['자시','23:00~01:00'],['축시','01:00~03:00'],['인시','03:00~05:00'],['묘시','05:00~07:00'],
 ['진시','07:00~09:00'],['사시','09:00~11:00'],['오시','11:00~13:00'],['미시','13:00~15:00'],
 ['신시','15:00~17:00'],['유시','17:00~19:00'],['술시','19:00~21:00'],['해시','21:00~23:00']];
// 시진 index → 대표 시각(HH:MM) for time field
export const SIJIN_MID=['00:30','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
