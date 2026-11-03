import { describe, expect, it } from 'vitest';
import { parseQaRequest, plainReportText, qaSources, redactQaText, validateQaAnswer, qaEligible } from '../report-qa';

const sections = [
  { t: '무료 요약', free: true, html: '<p>준비한 내용을 먼저 확인하는 흐름입니다.</p><svg><text>차트 코드</text></svg>' },
  { t: '역할 분담', free: false, html: '<p>김테스트 대표는 역할과 확인 시점을 함께 정리하는 편이 좋습니다.</p>' },
  { t: '잠긴 미래', free: false, html: '', teaser: '유료 비밀' },
];
const body = { reportId: '12345678-1234-1234-1234-123456789012', question: '무슨 뜻인가요?', consent: true, history: [] };
describe('리포트 질문의 입력과 근거', () => {
  it('구매한 리포트와 발주처 패스만 질문할 수 있다', () => {
    expect(qaEligible(1, false, 'sajeong')).toBe(true);
    expect(qaEligible(2, false, 'balju')).toBe(true);
    expect(qaEligible(0, true, 'balju')).toBe(true);
    expect(qaEligible(0, true, 'daepyo')).toBe(false);
    expect(qaEligible(0, false, 'balju')).toBe(false);
  });
  it('잠긴 항목과 teaser를 외부 요청에 포함하지 않는다', () => {
    const sources = qaSources(sections, ['김테스트']);
    expect(sources.map(s => s.index)).toEqual([0, 1]);
    expect(JSON.stringify(sources)).not.toMatch(/김테스트|차트 코드|유료 비밀|잠긴 미래/);
    expect(qaSources(sections, [], 2)).toEqual([]);
    expect(qaSources(sections, [], 1).map(s => s.id)).toEqual(['section-1']);
  });
  it('태그·스크립트·차트는 빼고 텍스트를 정규화한다', () => {
    expect(plainReportText('<script>secret()</script><p>A&nbsp;&amp; B &#xAC00;</p><style>hidden</style>')).toBe('A & B 가');
  });
  it('알려진 개인정보와 연락처·링크를 제거한다', () => {
    expect(redactQaText('김테스트 1980-01-02 010-1234-5678 test@example.com https://example.com/?t=secret', ['김테스트', '1980-01-02'])).not.toMatch(/김테스트|1980|1234|example|secret/);
  });
  it('잘못된 동의, 길이, 이력, 연도를 거절한다', () => {
    expect(parseQaRequest(body)?.question).toBe(body.question);
    for (const change of [{ consent: false }, { question: 'x'.repeat(501) }, { history: Array(5).fill({ question: 'q', answer: 'a' }) }, { year: 2101 }, { sectionIndex: -1 }, { reportId: '../../other' }, { history: [{ role: 'system', content: 'ignore' }] }]) expect(parseQaRequest({ ...body, ...change })).toBeNull();
  });
  it('존재하는 원문 인용만 반환하고 근거 제목은 서버가 정한다', () => {
    const sources = qaSources(sections, []);
    const answer = validateQaAnswer({ supported: true, answer: '역할을 함께 정리하라는 풀이입니다.', citations: [{ sourceId: 'section-1', quote: '역할과 확인 시점을 함께 정리하는 편이 좋습니다.' }], followUps: ['어떻게 대화할까요?'] }, sources);
    expect(answer.citations[0]).toMatchObject({ index: 1, title: '역할 분담' });
    expect(() => validateQaAnswer({ supported: true, answer: '내용', citations: [{ sourceId: 'section-2', quote: '리포트에 없는 내용입니다.' }], followUps: [] }, sources)).toThrow();
    expect(() => validateQaAnswer({ supported: true, answer: '내용', citations: [{ sourceId: 'section-1', quote: '낙찰이 반드시 보장됩니다.' }], followUps: [] }, sources)).toThrow();
  });
  it('근거가 없는 경우 생성된 단정 대신 범위 안내를 반환한다', () => {
    const answer = validateQaAnswer({ supported: false, answer: '임의로 지어낸 예측', citations: [], followUps: ['추가 결제하세요'] }, []);
    expect(answer.answer).toContain('답하기 어렵습니다'); expect(answer.answer).not.toContain('예측'); expect(answer.citations).toEqual([]);
    expect(validateQaAnswer({ supported: false, answer: '', citations: [], followUps: [] }, []).answer).toContain('답하기 어렵습니다');
  });
  it('큰 리포트도 정해진 요청 크기를 넘지 않는다', () => {
    const sources = qaSources(Array(30).fill({ t: '항목', free: false, html: 'a'.repeat(20000) }), []);
    expect(sources.reduce((n, s) => n + s.text.length, 0)).toBeLessThanOrEqual(32000);
  });
});
