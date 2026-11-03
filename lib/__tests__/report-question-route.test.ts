import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/report/question/route';
import { getReport, getReportAccess } from '../store';
import { entitlement, adminBypass } from '../entitle';
import { buyerCanViewReport } from '../buyer-report-access';
import { computeReport } from '../report';
import { answerReportQuestion, reportQaAvailable, reserveQaQuestion } from '../report-qa-server';
vi.mock('../store', () => ({ getReport: vi.fn(), getReportAccess: vi.fn() }));
vi.mock('../entitle', () => ({ entitlement: vi.fn(), adminBypass: vi.fn() }));
vi.mock('../buyer-report-access', () => ({ buyerCanViewReport: vi.fn() }));
vi.mock('../supabase/server', () => ({ requireUser: vi.fn().mockResolvedValue(null) }));
vi.mock('../report', () => ({ computeReport: vi.fn() }));
vi.mock('../report-qa-server', () => ({ answerReportQuestion: vi.fn(), reportQaAvailable: vi.fn(), reserveQaQuestion: vi.fn() }));
const reportId = '12345678-1234-1234-1234-123456789012';
const body = { reportId, t: 'right-token', question: '김테스트의 1980-01-02 풀이를 설명해주세요.', consent: true, history: [] };
const post = (change = {}, headers = {}) => POST(new Request('https://nakchalsaju.com/api/report/question', { method: 'POST', headers, body: JSON.stringify({ ...body, ...change }) }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(reportQaAvailable).mockReturnValue(true);
  vi.mocked(getReportAccess).mockResolvedValue({ owner: null, token: 'right-token' });
  vi.mocked(adminBypass).mockResolvedValue(false); vi.mocked(buyerCanViewReport).mockResolvedValue(false);
  vi.mocked(entitlement).mockResolvedValue({ level: 2, bpass: false, admin: false });
  vi.mocked(getReport).mockResolvedValue({ birth: '1980-01-02', name: '김테스트', cat: 'daepyo' });
  vi.mocked(computeReport).mockReturnValue({ sections: [{ t: '역할', html: '<p>김테스트님은 역할을 나누어 확인해주세요.</p>', free: false }, { t: '잠김', html: '', free: false }] } as any);
  vi.mocked(reserveQaQuestion).mockResolvedValue(19);
  vi.mocked(answerReportQuestion).mockResolvedValue({ answer: '설명', citations: [], followUps: [] });
});
describe('구매한 리포트 후속 질문 API', () => {
  it('활성화 설정이 없으면 모델을 호출하지 않는다', async () => {
    vi.mocked(reportQaAvailable).mockReturnValue(false); expect((await post()).status).toBe(503); expect(getReport).not.toHaveBeenCalled();
  });
  it('다른 사이트의 요청과 동의 없는 질문을 거절한다', async () => {
    expect((await post({}, { origin: 'https://untrusted.example' })).status).toBe(403);
    expect((await post({ consent: false })).status).toBe(400); expect(answerReportQuestion).not.toHaveBeenCalled();
  });
  it('틀린 토큰이면 유료 리포트 본문과 AI에 접근하지 못한다', async () => {
    expect((await post({ t: 'wrong' })).status).toBe(403); expect(computeReport).not.toHaveBeenCalled(); expect(reserveQaQuestion).not.toHaveBeenCalled();
  });
  it('구매자 쿠키로 검증된 다른 기기에서도 이용한다', async () => {
    vi.mocked(buyerCanViewReport).mockResolvedValue(true); expect((await post({ t: 'old-token' })).status).toBe(200);
  });
  it('클라이언트가 결제 레벨·본문을 위조해도 무료 리포트는 거절한다', async () => {
    vi.mocked(entitlement).mockResolvedValue({ level: 0, bpass: false, admin: false });
    expect((await post({ level: 2, html: '유료 본문' })).status).toBe(402); expect(answerReportQuestion).not.toHaveBeenCalled();
  });
  it('발주처 패스는 무료 tier 안의 확장 풀이에서도 질문할 수 있다', async () => {
    vi.mocked(entitlement).mockResolvedValue({ level: 0, bpass: true, admin: false });
    vi.mocked(getReport).mockResolvedValue({ birth: '1980-01-02', cat: 'balju' });
    vi.mocked(computeReport).mockReturnValue({ sections: [{ t: '발주처 풀이', html: '<p>패스로 열린 발주처 상세 풀이입니다.</p>', free: true }] } as any);
    expect((await post()).status).toBe(200);
    vi.mocked(getReport).mockResolvedValue({ birth: '1980-01-02', cat: 'daepyo' });
    expect((await post()).status).toBe(402);
    expect(answerReportQuestion).toHaveBeenCalledTimes(1);
  });
  it('잠긴 항목과 한도 초과는 외부 요청 전에 차단한다', async () => {
    expect((await post({ sectionIndex: 1 })).status).toBe(400);
    vi.mocked(reserveQaQuestion).mockResolvedValue(-1); expect((await post()).status).toBe(429); expect(answerReportQuestion).not.toHaveBeenCalled();
  });
  it('DB 한도 검사가 실패하면 무제한 호출로 우회하지 않는다', async () => {
    vi.mocked(reserveQaQuestion).mockRejectedValue(new Error('missing migration'));
    expect((await post()).status).toBe(503); expect(answerReportQuestion).not.toHaveBeenCalled();
  });
  it('서버 본문만 보내고 이름·생년월일·토큰을 외부 요청에서 제외한다', async () => {
    const r = await post({ html: '위조 본문', year: 2027 });
    expect(r.status).toBe(200); expect(r.headers.get('Cache-Control')).toBe('no-store');
    expect(computeReport).toHaveBeenCalledWith(expect.anything(), 2, 2027, false);
    expect(JSON.stringify(vi.mocked(answerReportQuestion).mock.calls)).not.toMatch(/김테스트|1980-01-02|right-token|위조 본문|잠김/);
    expect((await r.json()).remaining).toBe(19);
  });
  it('제공자 오류 원문을 고객 응답에 노출하지 않는다', async () => {
    vi.mocked(answerReportQuestion).mockRejectedValue(new Error('secret_api_key'));
    const r = await post(); expect(r.status).toBe(503); const result = await r.json();
    expect(JSON.stringify(result)).not.toContain('secret_api_key'); expect(result.remaining).toBe(19);
  });
});
