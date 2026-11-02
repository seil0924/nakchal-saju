'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SUPPORT_TOPICS, supportDraft, supportMailto, type SupportTopic } from '@/lib/support';

export default function ContactMail({ email, initialTopic = 'pay', reportId = '' }: { email: string; initialTopic?: SupportTopic; reportId?: string }) {
  useEffect(() => {
    if (location.hash === '#write') requestAnimationFrame(() => {
      const heading = document.getElementById('support-write-title');
      heading?.focus({ preventScroll: true }); heading?.scrollIntoView({ block: 'start' });
    });
  }, []);
  const [topic, setTopic] = useState<SupportTopic>(initialTopic);
  const [drafts, setDrafts] = useState<Partial<Record<SupportTopic, string>>>({});
  const [message, setMessage] = useState('');
  const body = drafts[topic] ?? supportDraft(topic, reportId);
  const selected = SUPPORT_TOPICS.find(t => t.key === topic)!;
  async function copy(kind: 'address' | 'draft') {
    try {
      await navigator.clipboard.writeText(kind === 'address' ? email : `받는 주소: ${email}\n제목: [낙찰사주 문의] ${selected.label}\n\n${body}`);
      setMessage(kind === 'address' ? '이메일 주소를 복사했습니다. 사용하시는 메일의 받는 사람 칸에 붙여넣어주세요.' : '제목과 문의 내용을 복사했습니다. 사용하시는 메일에 붙여넣고 보내주세요.');
    } catch { setMessage('자동 복사가 되지 않았습니다. 아래 이메일 주소와 작성한 내용을 직접 선택해 복사해주세요.'); }
  }
  return <section className="support-card support-form" id="write" aria-labelledby="support-write-title">
    <h2 id="support-write-title" tabIndex={-1}>이메일로 문의하기</h2>
    <p className="support-caption">① 유형 선택 → ② 아는 내용만 작성 → ③ 메일에서 보내기</p>
    <fieldset><legend>1. 어떤 도움이 필요한가요?</legend><div className="support-options">
      {SUPPORT_TOPICS.map(t => <label key={t.key}><input type="radio" name="support-topic" value={t.key} checked={topic === t.key} onChange={() => { setTopic(t.key); setMessage(''); }} />{t.label}</label>)}
    </div></fieldset>
    {topic === 'pay' && <p className="support-caption">다시 결제하기 전에 <Link href="/find">구매 기록 찾기</Link>를 확인해보세요. 해결되지 않으면 아래 내용을 보내주세요.</p>}
    {topic === 'refund' && <p className="support-caption"><Link href="/refund">환불 기준과 처리 순서</Link>를 확인할 수 있습니다. 열람 여부나 주문번호를 몰라도 아는 내용으로 요청해주세요.</p>}
    <label htmlFor="support-body">2. 문의 내용을 작성해주세요</label>
    <p className="support-caption">모르는 항목은 비워두셔도 됩니다. 카드번호 전체·비밀번호·인증번호는 적지 마세요.</p>
    <textarea id="support-body" value={body} maxLength={3000} onChange={e => { setDrafts(d => ({ ...d, [topic]: e.target.value })); setMessage(''); }} aria-describedby="support-draft-help" />
    <p id="support-draft-help" className="support-caption">이 화면에서 작성만 하면 접수되지 않습니다. 메일 앱에서 내용을 확인한 뒤 직접 ‘보내기’를 눌러주세요.</p>
    <a className="ct-go" href={supportMailto(email, topic, body)}>3. 메일 앱에서 확인하고 보내기 →</a>
    <div className="support-actions"><button type="button" onClick={() => copy('draft')}>제목·내용 전체 복사</button><button type="button" onClick={() => copy('address')}>이메일 주소 복사</button></div>
    <p className="support-status" role="status">{message}</p>
    <p>받는 주소: <span className="support-email">{email}</span></p>
    <details><summary>메일 앱이 열리지 않나요?</summary><p>‘제목·내용 전체 복사’를 누른 뒤 평소 쓰는 네이버·다음·Gmail 등의 메일에서 새 메일을 작성해주세요. 받는 주소에 위 고객센터 이메일을 입력하고, 복사한 내용을 붙여넣어 보내면 됩니다.</p></details>
    <p className="support-caption">화면 캡처가 필요하면 메일에서 첨부해주세요. 문의 답변과 환불 처리 안내는 보내신 이메일로 드립니다. 받은 순서대로 확인하며, 답장이 보이지 않으면 스팸함도 확인해주세요.</p>
  </section>;
}
