export const SUPPORT_TOPICS = [
  { key: 'pay', label: '결제했는데 안 열려요', fields: ['결제자 성함:', '결제일시·금액:', '주문번호 또는 리포트 주소 (모르면 생략):', '현재 보이는 화면·오류:'] },
  { key: 'refund', label: '환불을 요청하고 싶어요', fields: ['결제자 성함:', '결제일시·금액:', '주문번호 또는 리포트 주소 (모르면 생략):', '유료 내용 열람 여부 (모르면 모름):', '환불 요청 사유:'] },
  { key: 'report', label: '풀이 내용이 궁금해요', fields: ['리포트 주소 (모르면 생략):', '궁금한 부분:'] },
  { key: 'bug', label: '화면에 오류가 있어요', fields: ['문제가 생긴 화면:', '어떤 버튼을 눌렀는지:', '휴대폰·PC / 브라우저 (아는 만큼):', '오류 내용:'] },
  { key: 'biz', label: '제휴·광고 문의', fields: ['회사명:', '회신받을 연락처:', '제안 내용:'] },
  { key: 'etc', label: '기타 문의', fields: ['문의 내용:'] },
] as const;
export type SupportTopic = typeof SUPPORT_TOPICS[number]['key'];
export function supportTopic(value?: string): SupportTopic {
  return SUPPORT_TOPICS.some(t => t.key === value) ? value as SupportTopic : 'pay';
}
// Carry only the report identifier, never an access token or buyer details.
export function supportReport(value?: string): string {
  return typeof value === 'string' && /^r?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : '';
}
export function supportHref(topic: SupportTopic, reportId?: string): string {
  const id = supportReport(reportId);
  return `/contact?topic=${topic}${id ? '&report=' + encodeURIComponent(id) : ''}`;
}
export function supportDraft(topic: SupportTopic, reportId = ''): string {
  const item = SUPPORT_TOPICS.find(t => t.key === topic)!;
  const id = supportReport(reportId);
  return item.fields.map(field => id && field.includes('리포트 주소') ? `리포트 주소: https://nakchalsaju.com/report/${id}` : field).join('\n') + '\n';
}
export function supportMailto(email: string, topic: SupportTopic, body: string): string {
  const title = SUPPORT_TOPICS.find(t => t.key === topic)!.label;
  return `mailto:${email}?subject=${encodeURIComponent(`[낙찰사주 문의] ${title}`)}&body=${encodeURIComponent(body)}`;
}
