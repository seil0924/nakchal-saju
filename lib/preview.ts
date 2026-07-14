// lib/preview.ts — 클라이언트용 명식 미리보기 (안전 부분집합)
// 만세력 공통 계산은 ./manse-core 공용. 사정률(방향·밴드·소수점)은 여기 없음 — 서버(engine.ts)에서만.
import { GAN, ZHI, EL, EL_HEX, SIP, pil, GAN_EL, ZHI_EL, corePillars, resolveBirth, lunarToSolar } from './manse-core';
export { GAN, ZHI, EL, EL_HEX, SIP, pil, lunarToSolar };
export const GAN_ELc=GAN_EL; export const ZHI_ELc=ZHI_EL;

export type PChart = { yGan:number;yZhi:number;mGan:number;mZhi:number;dGan:number;dZhi:number;hGan:number|null;hZhi:number|null;dayMasterEl:number };

export function computePreview(y:number,m:number,d:number,hourFloat:number|null,yaja=false):PChart{
  return corePillars(y,m,d,hourFloat,yaja) as PChart;
}
export function chartFromInput(dateISO:string,timeHHMM:string|null,cal:'solar'|'lunar'='solar',isLeap=false):PChart|null{
  if(!dateISO) return null;
  const [yy,mm,dd]=dateISO.split('-').map(Number);
  if(!yy||!mm||!dd) return null;
  const r=resolveBirth(dateISO,timeHHMM,cal,isLeap);
  return computePreview(r.y,r.m,r.d,r.hf,r.yaja);
}
export function sipsungPreview(c:PChart):number[]{
  const me=c.dayMasterEl;
  const els=[GAN_EL[c.yGan],ZHI_EL[c.yZhi],GAN_EL[c.mGan],ZHI_EL[c.mZhi],ZHI_EL[c.dZhi]];
  if(c.hGan!==null){els.push(GAN_EL[c.hGan],ZHI_EL[c.hZhi!]);}
  const dd=[0,0,0,0,0];
  for(const e of els){if(e===me)dd[0]++;else if((me+1)%5===e)dd[1]++;else if((me+2)%5===e)dd[2]++;else if((e+2)%5===me)dd[3]++;else if((e+1)%5===me)dd[4]++;}
  return dd;
}
export const SIJIN=[
 ['자시','23:00~01:00'],['축시','01:00~03:00'],['인시','03:00~05:00'],['묘시','05:00~07:00'],
 ['진시','07:00~09:00'],['사시','09:00~11:00'],['오시','11:00~13:00'],['미시','13:00~15:00'],
 ['신시','15:00~17:00'],['유시','17:00~19:00'],['술시','19:00~21:00'],['해시','21:00~23:00']];
// 시진 index → 대표 시각(HH:MM) for time field
export const SIJIN_MID=['00:30','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
