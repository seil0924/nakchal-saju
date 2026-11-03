'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { tokParam } from '@/lib/rtok';
import { QA_DAILY_LIMIT, QA_QUESTION_MAX, type QaAnswer, type QaSection } from '@/lib/report-qa';
import './report-questions.css';

type Props = { reportId: string; available?: boolean; year?: number; sections: QaSection[]; onSource: (index: number) => void };
type Turn = QaAnswer & { question: string };
const STARTERS = ['이 풀이의 핵심을 쉽게 설명해주세요.', '주의할 부분은 어떤 뜻인가요?', '함께 일하는 사람과 무엇을 이야기해보면 좋을까요?'];

// The parent keys by report + year, so conversations never carry into another report.
export default function ReportQuestions({ reportId, available, year, sections, onSource }: Props) {
  const [question, setQuestion] = useState('');
  const [section, setSection] = useState('');
  const [consent, setConsent] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [recover, setRecover] = useState(false);
  const [limited, setLimited] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const request = useRef<AbortController | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const result = useRef<HTMLDivElement>(null);
  const errorBox = useRef<HTMLParagraphElement>(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { if (error) errorBox.current?.focus(); }, [error]);
  if (!available) return null;

  function choose(text: string) { setQuestion(text); setError(''); field.current?.focus(); }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (request.current || limited) return;
    const q = question.trim();
    if (!q || q.length > QA_QUESTION_MAX) { setError('질문을 500자 이내로 입력해주세요.'); return; }
    if (!consent) { setError('AI 답변 이용 안내를 확인하고 동의해주세요.'); return; }
    const controller = new AbortController(); request.current = controller;
    const timer = setTimeout(() => controller.abort(), 45000);
    setBusy(true); setError(''); setRecover(false);
    try {
      const r = await fetch('/api/report/question', {
        method: 'POST', cache: 'no-store', signal: controller.signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, t: tokParam(reportId, new URLSearchParams(location.search).get('t')), year, question: q, consent,
          sectionIndex: section === '' ? undefined : Number(section), history: turns.slice(-4).map(({ question, answer }) => ({ question, answer })) }),
      });
      const data = await r.json();
      if (typeof data.remaining === 'number') { setRemaining(data.remaining); setLimited(data.remaining === 0); }
      if (!r.ok) { setRecover(!!data.recovery); if (data.limited) setLimited(true); throw new Error(data.message || '답변을 가져오지 못했습니다. 잠시 후 다시 요청해주세요.'); }
      setTurns(old => [...old, { question: q, answer: data.answer, citations: data.citations, followUps: data.followUps }]);
      setQuestion(''); setRemaining(data.remaining); setLimited(data.remaining === 0);
      requestAnimationFrame(() => { result.current?.focus(); result.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
    } catch (e) {
      if (controller.signal.aborted) setError('답변 연결이 지연되었습니다. 질문은 그대로 두었습니다. 잠시 후 다시 요청해주세요.');
      else setError(e instanceof Error ? e.message : '답변을 가져오지 못했습니다. 잠시 후 다시 요청해주세요.');
    } finally { clearTimeout(timer); request.current = null; setBusy(false); }
  }

  return <section className="report-questions no-print" aria-labelledby="report-questions-title">
    <div className="rq-kicker">구매한 풀이를 더 쉽게</div>
    <h2 id="report-questions-title">리포트에 이어서 질문하기</h2>
    <p className="rq-intro">궁금한 문장이나 뜻을 물어보세요. AI가 현재 열려 있는 풀이를 참고해 설명하고, 근거 문장을 함께 보여드립니다.</p>
    <p className="rq-help">새로운 운세를 계산하는 기능은 아닙니다. 답변이 틀릴 수 있으니 근거 문장과 함께 확인해주세요.</p>

    {turns.length > 0 && <div className="rq-conversation" aria-label="리포트 질문과 답변">
      {turns.map((turn, i) => <article className="rq-turn" key={i}>
        <h3>질문 {i + 1}</h3><p className="rq-question">{turn.question}</p>
        <div className="rq-answer" ref={i === turns.length - 1 ? result : undefined} tabIndex={-1}>
          <h4>리포트 기반 AI 답변</h4><p>{turn.answer}</p>
          {turn.citations.length > 0 && <div className="rq-evidence"><strong>답변의 근거</strong>{turn.citations.map((c, n) => <div key={n}>
            <blockquote>{c.quote}</blockquote><button type="button" onClick={() => onSource(c.index)}>{c.title} · 원문 펼치기</button>
          </div>)}</div>}
        </div>
      </article>)}
      <p className="rq-help">대화는 이 화면에서만 유지됩니다. 페이지를 떠나거나 새로고침하면 사라집니다.</p>
    </div>}

    <form onSubmit={submit}>
      <label htmlFor="rq-section">어느 부분이 궁금한가요?</label>
      <select id="rq-section" value={section} disabled={busy} onChange={e => { setSection(e.target.value); setError(''); }}>
        <option value="">열려 있는 풀이 전체</option>
        {sections.map((s, i) => s.html ? <option key={i} value={i}>{s.t}</option> : null)}
      </select>
      <div className="rq-suggestions" aria-label="추천 질문">
        {(turns.length ? turns[turns.length - 1].followUps : STARTERS).map(q => <button key={q} type="button" disabled={busy || limited} onClick={() => choose(q)}>{q}</button>)}
      </div>
      <label htmlFor="rq-question">궁금한 내용</label>
      <textarea ref={field} id="rq-question" rows={3} maxLength={QA_QUESTION_MAX} disabled={busy || limited} value={question} onChange={e => setQuestion(e.target.value)} placeholder="예: ‘역할을 나누라’는 말은 어떤 뜻인가요?" aria-describedby="rq-input-help" />
      <p id="rq-input-help" className="rq-help">{question.length}/{QA_QUESTION_MAX}자 · 이름·연락처·계좌번호는 적지 마세요.</p>
      <label className="rq-consent"><input type="checkbox" checked={consent} disabled={busy} onChange={e => setConsent(e.target.checked)} /><span>AI 답변을 위해 질문·최근 대화·풀이 발췌문을 OpenAI에 전송하는 데 동의합니다. 원본 생년월일과 결제 정보는 답변 요청에 포함하지 않습니다.</span></label>
      {error && <p ref={errorBox} tabIndex={-1} role="alert" className="rq-error">{error}</p>}
      {recover && <Link href="/find" className="rq-recover">구매 기록에서 리포트 다시 열기 →</Link>}
      <button className="rq-submit" type="submit" disabled={busy || limited}>{busy ? '리포트 근거를 확인하며 답변 중…' : limited ? '오늘의 질문 이용을 마쳤습니다' : turns.length ? '이어서 질문하기' : '리포트에 질문하기'}</button>
      <div role="status" className="rq-help">{busy ? '답변을 준비하고 있습니다. 잠시만 기다려주세요.' : limited ? '오늘의 질문 이용 한도에 도달했습니다. 내일 다시 이용해주세요.' : remaining !== null ? `오늘 이 리포트에서 ${remaining}회 더 요청할 수 있습니다.` : `리포트당 하루 ${QA_DAILY_LIMIT}회까지 요청할 수 있습니다.`}</div>
    </form>
  </section>;
}
