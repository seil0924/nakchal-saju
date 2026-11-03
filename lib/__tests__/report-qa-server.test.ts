import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { answerReportQuestion, reserveQaQuestion, reportQaAvailable } from '../report-qa-server';
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('../supabase/admin', () => ({ adminEnabled: () => true, supabaseAdmin: () => ({ rpc: mocks.rpc }) }));
vi.mock('../supabase/server', () => ({ authEnabled: () => true }));
const sources = [{ id: 'section-0', index: 0, title: '역할', text: '서로의 역할과 확인 시점을 함께 정리해주세요.' }];
const answer = { supported: true, answer: '역할을 정리하라는 풀이입니다.', citations: [{ sourceId: 'section-0', quote: sources[0].text }], followUps: ['무엇을 확인할까요?'] };
const response = (value: unknown) => new Response(JSON.stringify(value));
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()); vi.stubEnv('OPENAI_API_KEY', 'fake-test-key'); vi.stubEnv('REPORT_QA_MODEL', 'test-model'); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('AI 답변 요청과 반환 검증', () => {
  it('명시적으로 활성화하고 키와 모델을 설정해야 사용 가능하다', () => {
    vi.stubEnv('REPORT_QA_ENABLED', 'false'); expect(reportQaAvailable()).toBe(false);
    vi.stubEnv('REPORT_QA_ENABLED', 'true'); expect(reportQaAvailable()).toBe(true);
    vi.stubEnv('OPENAI_API_KEY', ''); expect(reportQaAvailable()).toBe(false);
  });
  it('대화 저장 없이 구조화된 답변을 요청하고 근거를 검증한다', async () => {
    vi.mocked(fetch).mockResolvedValue(response({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(answer) }] }] }));
    const result = await answerReportQuestion('설명해주세요', [], sources);
    expect(result.citations[0].index).toBe(0);
    const sent = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(sent).toMatchObject({ store: false, model: 'test-model', text: { format: { strict: true } } });
    expect(sent.tools).toBeUndefined();
  });
  it.each([{ status: 'incomplete', output: [] }, { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'broken json' }] }] }])('미완성·잘못된 응답을 성공 처리하지 않는다', async data => {
    vi.mocked(fetch).mockResolvedValue(response(data)); await expect(answerReportQuestion('질문', [], sources)).rejects.toThrow();
  });
  it('API가 거절하면 자동으로 재호출하지 않는다', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('private provider error', { status: 429 }));
    await expect(answerReportQuestion('질문', [], sources)).rejects.toThrow('answer_unavailable'); expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('서버의 원자적 한도 함수를 사용하고 DB 오류는 거절한다', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: 7, error: null }).mockResolvedValueOnce({ data: null, error: 'missing' });
    expect(await reserveQaQuestion('report')).toBe(7); expect(mocks.rpc).toHaveBeenCalledWith('reserve_report_question', { p_report_id: 'report' });
    await expect(reserveQaQuestion('report')).rejects.toThrow();
  });
});
