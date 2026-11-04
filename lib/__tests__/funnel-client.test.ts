import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const j = {id:'a'.repeat(32),source:'sajang' as const,cat:'daepyo'};
function storage() { const values = new Map<string,string>(); return {getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)}; }
beforeEach(()=>{vi.resetModules();vi.stubGlobal('window',{});vi.stubGlobal('localStorage',storage());vi.stubGlobal('sessionStorage',storage());vi.stubGlobal('fetch',vi.fn(async()=>({ok:true})));});
afterEach(()=>vi.unstubAllGlobals());
describe('전환 이벤트 클라이언트',()=>{
  it('연속 호출과 새로 불러오기에서 동일 단계는 한 번만 전송한다',async()=>{
    const a=await import('../funnel-client');a.trackFunnel(j,'free_result');a.trackFunnel(j,'free_result');
    await Promise.resolve();expect(fetch).toHaveBeenCalledTimes(1);
    vi.resetModules();const b=await import('../funnel-client');b.trackFunnel(j,'free_result');expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('관리자 기기는 전송하지 않는다',async()=>{
    localStorage.setItem('nv:skip','1');const {trackFunnel}=await import('../funnel-client');trackFunnel(j,'free_result');expect(fetch).not.toHaveBeenCalled();
  });
  it('저장소 차단·전송 실패가 결과 화면을 막지 않으며 다음 호출에서 다시 보낸다',async()=>{
    vi.stubGlobal('localStorage',{getItem:()=>{throw Error('blocked');}});
    vi.mocked(fetch).mockRejectedValueOnce(Error('offline'));
    const {trackFunnel}=await import('../funnel-client');trackFunnel(j,'free_result');
    await new Promise(r=>setTimeout(r,0));trackFunnel(j,'free_result');expect(fetch).toHaveBeenCalledTimes(2);
  });
});
