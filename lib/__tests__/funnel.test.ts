import { describe, expect, it } from 'vitest';
import { aggregateFunnel, cleanJourney, decodeEvent, encodeEvent, type Journey, type FunnelEvent } from '../funnel';
import { POST } from '../../app/api/funnel/route';
const j: Journey = { id: 'a'.repeat(32), source: 'sajang', cat: 'daepyo' };
const row = (event: FunnelEvent) => ({ slug: encodeEvent(j,event), created_at: '2026-11-04T03:00:00Z' });
describe('전환 집계', () => {
  it('허용 값만 저장하고 개인 정보는 제거한다', () => {
    expect(cleanJourney({ ...j, name: '이름', birth: '1971-07-16' })).toEqual(j);
    expect(cleanJourney({ ...j, id: '01012345678' })).toBeNull();
    expect(decodeEvent(encodeEvent(j,'free_result'))).toEqual({ journey:j,event:'free_result' });
    expect(decodeEvent(j.id+'.sajang.daepyo.paid')).toBeNull();
  });
  it('중복은 제거하고 결제 완료는 원장에서만 채운다', () => {
    const events = [row('free_result'),row('free_result'),row('checkout_open'),row('payment_start'),row('payment_cancel')];
    const before = aggregateFunnel(events,[]).find(r=>r.source===j.source&&r.cat===j.cat)!;
    expect(before.counts.free_result).toBe(1);
    expect(before.counts.preview_view).toBe(0);
    expect(before.counts.paid).toBe(0);
    const after = aggregateFunnel(events,[j,j]).find(r=>r.source===j.source&&r.cat===j.cat)!;
    expect(after.counts.paid).toBe(1);
    expect(after.counts.payment_cancel).toBe(1);
    expect(after.transitions.find(t=>t.from==='payment_start')).toMatchObject({advanced:1,missing:0});
  });
  it('서로 다른 여정을 합쳐 가짜 전환을 만들지 않는다', () => {
    const events=[row('preview_view'),{...row('checkout_open'),slug:encodeEvent({...j,id:'b'.repeat(32)},'checkout_open')}];
    const stat=aggregateFunnel(events,[]).find(r=>r.source===j.source&&r.cat===j.cat)!;
    expect(stat.transitions.find(t=>t.from==='preview_view')).toMatchObject({total:1,advanced:0,missing:1});
  });
  it('공개 API는 결제 완료 위조와 다른 origin을 거절한다', async () => {
    const req=(event:string,origin='http://localhost')=>new Request('http://localhost/api/funnel',{method:'POST',headers:{origin,'user-agent':'Mozilla/5.0','sec-fetch-site':'same-origin'},body:JSON.stringify({journey:j,event})});
    expect((await POST(req('paid'))).status).toBe(400);
    expect((await POST(req('free_result','https://example.com'))).status).toBe(403);
    expect((await POST(req('free_result'))).status).toBe(204);
    const proxied = new Request('http://localhost/api/funnel',{method:'POST',headers:{origin:'https://nakchalsaju.com','x-forwarded-host':'nakchalsaju.com','user-agent':'Mozilla/5.0','sec-fetch-site':'same-origin'},body:JSON.stringify({journey:j,event:'input_view'})});
    expect((await POST(proxied)).status).toBe(204);
  });
});
