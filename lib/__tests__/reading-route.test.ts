import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/report/route';
import { computeReport } from '../report';
import { saveReport } from '../store';

vi.mock('../report', () => ({ computeReport: vi.fn(() => ({ hero: { label: '명리 해석 점수' }, sections: [] })) }));
vi.mock('../store', () => ({ saveReport: vi.fn(async () => ({ id: 'test-report', token: 'test-token' })), hasBaljuPass: vi.fn(async () => false) }));
vi.mock('../entitle', () => ({ adminBypass: vi.fn(async () => false) }));
vi.mock('../buyer', () => ({ buyerKeyFromCookie: vi.fn(() => null) }));
vi.mock('../supabase/server', () => ({ requireUser: vi.fn(async () => null) }));
beforeEach(() => vi.clearAllMocks());
const post = (body: unknown) => POST(new Request('http://localhost/api/report', { method: 'POST', body: JSON.stringify(body) }));

describe('리포트 생성 전 날짜·시간 검사', () => {
  it('질문 본문 위조는 버리고 허용된 질문 키·여정 필드만 원장에 남긴다', async () => {
    await post({name:'점검',birth:'1980-02-29',cat:'daepyo',focusId:'sik',focus:{question:'외부 문장',mk:'器'},journey:{id:'a'.repeat(32),source:'sajang',cat:'daepyo',phone:'01000000000'}});
    const saved = vi.mocked(saveReport).mock.calls[0][0];
    expect(saved.focus).toBeUndefined(); // mock computeReport에는 focus가 없다.
    expect(saved.focusId).toBe('sik');
    expect(saved.journey).toEqual({id:'a'.repeat(32),source:'sajang',cat:'daepyo'});
  });
  it('없는 날짜는 계산하거나 저장하지 않는다', async () => {
    const response = await post({ name: '점검', birth: '1981-02-29' });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'birth_invalid' });
    expect(computeReport).not.toHaveBeenCalled();
    expect(saveReport).not.toHaveBeenCalled();
  });
  it('없는 음력 윤달과 잘못된 시간을 막는다', async () => {
    expect((await post({ name: '점검', birth: '1980-01-15', cal: 'lunar', leap: true })).status).toBe(400);
    const response = await post({ name: '점검', birth: '1980-01-15', time: '24:00' });
    expect(await response.json()).toEqual({ error: 'time_invalid' });
    expect(saveReport).not.toHaveBeenCalled();
  });
  it('태어난 시간을 몰라도 정상 날짜로 무료 결과를 만든다', async () => {
    const response = await post({ name: '점검', birth: '1980-02-29', time: null, cat: 'sajeong' });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ reportId: 'test-report', level: 0 });
    expect(saveReport).toHaveBeenCalledOnce();
  });
});
