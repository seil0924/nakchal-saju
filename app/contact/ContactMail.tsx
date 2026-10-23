'use client';
// 문의 유형 → 메일 제목·본문 양식. mailto 는 메일 앱이 없는 PC 에서 아무 일도 안 일어나니
// 주소 복사 버튼을 같이 둔다.
import { useState } from 'react';

const TYPES: { k: string; label: string; body: string[] }[] = [
  { k: 'pay', label: '결제·환불', body: ['결제자 성함:', '결제일시:', '주문번호 또는 리포트 주소:', '', '문의 내용:'] },
  { k: 'report', label: '리포트 내용', body: ['리포트 주소(보관함에서 복사):', '', '궁금한 부분:'] },
  { k: 'bug', label: '오류 신고', body: ['어느 화면에서:', '무엇을 눌렀더니:', '휴대폰·PC 기종(아는 만큼):', '', '화면 캡처가 있으면 첨부해 주세요.'] },
  { k: 'biz', label: '제휴·광고', body: ['회사명:', '담당자 연락처:', '', '제안 내용:'] },
  { k: 'etc', label: '기타', body: ['문의 내용:'] },
];

export default function ContactMail({ email }: { email: string }) {
  const [t, setT] = useState(TYPES[0]);
  const [copied, setCopied] = useState(false);
  const href = `mailto:${email}?subject=${encodeURIComponent(`[낙찰사주 문의] ${t.label}`)}&body=${encodeURIComponent(t.body.join('\n') + '\n')}`;

  async function copy() {
    try { await navigator.clipboard.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* 복사가 막힌 브라우저는 주소를 길게 눌러 복사 */ }
  }

  return (
    <div className="card ct-card">
      <div className="ct-lab" id="ct-type-lab">문의 유형</div>
      <div className="ct-types" role="radiogroup" aria-labelledby="ct-type-lab">
        {TYPES.map(x => (
          <button key={x.k} type="button" role="radio" aria-checked={t.k === x.k}
            className={t.k === x.k ? 'on' : ''} onClick={() => setT(x)}>{x.label}</button>
        ))}
      </div>
      <div className="ct-lab">메일에 채워지는 양식</div>
      <pre className="ct-pre">{`제목: [낙찰사주 문의] ${t.label}\n\n${t.body.join('\n')}`}</pre>
      <a className="ct-go" href={href}>메일 앱으로 문의 쓰기</a>
      <div className="ct-addr">
        <span>{email}</span>
        <button type="button" onClick={copy} aria-live="polite">{copied ? '복사했습니다' : '주소 복사'}</button>
      </div>
      <p className="ct-note">메일 앱이 열리지 않으면 주소를 복사해 쓰시는 메일에서 보내 주세요.</p>
    </div>
  );
}
