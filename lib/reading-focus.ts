export const ENTRY_QUESTIONS = {
  ceo: { question: '내가 대표가 된다면 어떤 스타일일까요?', mk: '方' },
  bi: { question: '내 추진력은 언제 강점이 되고, 언제 무리가 될까요?', mk: '人' },
  sik: { question: '아이디어를 실행하는 힘, 어디까지 직접 맡는 게 좋을까요?', mk: '人' },
  jae: { question: '기회를 알아보는 감각과 감당할 범위는 어떻게 나눌까요?', mk: '財' },
  gwan: { question: '책임감을 살리면서 혼자 짊어지지 않으려면 어떻게 할까요?', mk: '人' },
  in: { question: '꼼꼼한 검토가 실행을 늦추지 않으려면 어떻게 할까요?', mk: '方' },
} as const;
export type Focus = { id: string; question: string; mk: string; open: boolean };
export function entryQuestion(id: unknown) {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(ENTRY_QUESTIONS, id) ? ENTRY_QUESTIONS[id as keyof typeof ENTRY_QUESTIONS] : null;
}
export function firstReadingSection(sections: { mk: string; html: string }[], focus?: Focus | null) {
  const target = focus ? sections.findIndex(s => s.mk === focus.mk && !!s.html) : -1;
  return target >= 0 ? target : sections.findIndex(s => !!s.html);
}
