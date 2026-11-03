export type QaSection = { t: string; html: string; free: boolean };
export type QaSource = { id: string; index: number; title: string; text: string };
export type QaTurn = { question: string; answer: string };
export type QaAnswer = { answer: string; citations: { index: number; title: string; quote: string }[]; followUps: string[] };
export const QA_QUESTION_MAX = 500;
export const QA_DAILY_LIMIT = 20;
export const qaEligible = (level: number, bpass: boolean, cat?: string | null) => level >= 1 || (bpass && cat === 'balju');

export function plainReportText(html: string): string {
  return html.replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code: string) => {
      const n = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' ';
    })
    .replace(/&(nbsp|amp|lt|gt|quot|apos);/g, (_, key: string) => ({ nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[key] || ' '))
    .replace(/\s+/g, ' ').trim();
}

export function redactQaText(text: string, privateValues: string[]): string {
  let clean = text;
  for (const value of [...new Set(privateValues)].filter(v => v.length >= 2).sort((a, b) => b.length - a.length)) clean = clean.split(value).join('[입력 정보]');
  return clean.replace(/https?:\/\/\S+/gi, '[링크]')
    .replace(/[\w.+-]{1,100}@[\w.-]{1,200}\.[a-z]{2,20}/gi, '[이메일]')
    .replace(/01[016789][- .]?\d{3,4}[- .]?\d{4}/g, '[연락처]');
}

// Only server-computed, already unlocked HTML is supplied. Never include teasers.
export function qaSources(sections: QaSection[], privateValues: string[], sectionIndex?: number): QaSource[] {
  let budget = 32000;
  return sections.flatMap((s, index) => {
    if (!s.html || (sectionIndex !== undefined && index !== sectionIndex) || budget <= 0) return [];
    const text = redactQaText(plainReportText(s.html), privateValues).slice(0, Math.min(8000, budget));
    budget -= text.length;
    return text ? [{ id: `section-${index}`, index, title: redactQaText(plainReportText(s.t), privateValues), text }] : [];
  });
}

export function parseQaRequest(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const b = value as Record<string, unknown>;
  if (typeof b.reportId !== 'string' || !/^r?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b.reportId)) return null;
  if (typeof b.question !== 'string' || !b.question.trim() || b.question.length > QA_QUESTION_MAX) return null;
  if (b.t !== undefined && (typeof b.t !== 'string' || b.t.length > 200)) return null;
  if (b.year !== undefined && (!Number.isInteger(b.year) || Number(b.year) < 1900 || Number(b.year) > 2100)) return null;
  if (b.sectionIndex !== undefined && (!Number.isInteger(b.sectionIndex) || Number(b.sectionIndex) < 0 || Number(b.sectionIndex) > 100)) return null;
  if (b.consent !== true || !Array.isArray(b.history) || b.history.length > 4) return null;
  const history: QaTurn[] = [];
  for (const turn of b.history) {
    if (!turn || typeof turn.question !== 'string' || typeof turn.answer !== 'string' || turn.question.length > QA_QUESTION_MAX || turn.answer.length > 3000) return null;
    history.push({ question: turn.question, answer: turn.answer });
  }
  return { reportId: b.reportId, question: b.question.trim(), t: (b.t as string) || null, year: b.year as number | undefined, sectionIndex: b.sectionIndex as number | undefined, history };
}

export function validateQaAnswer(value: unknown, sources: QaSource[]): QaAnswer {
  const b = value as any;
  if (!b || typeof b.answer !== 'string' || b.answer.length > 3000 || typeof b.supported !== 'boolean' || !Array.isArray(b.citations) || !Array.isArray(b.followUps)) throw new Error('invalid_answer');
  if (!b.supported) return { answer: '현재 리포트의 내용만으로는 이 질문에 답하기 어렵습니다. 궁금한 항목을 선택하거나 리포트 문장을 짚어서 질문해주세요.', citations: [], followUps: ['이 풀이의 핵심을 쉽게 설명해주세요.'] };
  if (!b.answer.trim()) throw new Error('empty_answer');
  if (!b.citations.length || b.citations.length > 3) throw new Error('missing_evidence');
  const citations = b.citations.map((c: any) => {
    const source = sources.find(s => s.id === c.sourceId);
    if (!source || typeof c.quote !== 'string') throw new Error('invalid_evidence');
    const quote = c.quote.replace(/\s+/g, ' ').trim();
    if (quote.length < 8 || quote.length > 240 || !source.text.includes(quote)) throw new Error('invalid_evidence');
    return { index: source.index, title: source.title, quote };
  });
  return { answer: b.answer.trim(), citations, followUps: b.followUps.filter((q: unknown): q is string => typeof q === 'string' && q.trim().length > 0 && q.length <= 100).slice(0, 3) };
}
