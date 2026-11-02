import { describe, expect, it } from 'vitest';
import { supportTopic, supportReport, supportDraft, supportHref, supportMailto } from '../support';

const id = '12345678-abcd-1234-abcd-123456789abc';
describe('문의 양식과 결제 도움말 연결', () => {
  it('환불 링크에서 환불 유형을 고르고, 알 수 없는 유형은 결제 도움말로 안내한다', () => {
    expect(supportTopic('refund')).toBe('refund'); expect(supportTopic('unknown')).toBe('pay');
    expect(supportDraft('refund')).toContain('열람 여부');
  });
  it('리포트 식별자만 전달하며 외부 URL이나 접근 토큰을 넘기지 않는다', () => {
    expect(supportHref('pay', id)).toBe('/contact?topic=pay&report=' + id);
    expect(supportDraft('pay', id)).toContain('https://nakchalsaju.com/report/' + id);
    expect(supportReport(id + '?t=private-token')).toBe('');
    expect(supportHref('pay', 'https://outside.example/')).toBe('/contact?topic=pay');
  });
  it('한글·줄바꿈·특수문자를 메일 본문으로만 전달한다', () => {
    const body = '환불 문의\n내용: A&B?subject=바꾸기 #확인';
    const url = new URL(supportMailto('test@example.com', 'refund', body));
    expect(url.pathname).toBe('test@example.com');
    expect(url.searchParams.get('body')).toBe(body);
    expect(url.searchParams.get('subject')).toBe('[낙찰사주 문의] 환불을 요청하고 싶어요');
    expect([...url.searchParams.keys()]).toEqual(['subject', 'body']);
  });
});
