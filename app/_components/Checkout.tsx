'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import BuyerFields, { type BuyerState } from './BuyerFields';
import { buyerInputError } from '@/lib/buyer-input';
import { won } from '@/lib/constants';
import { PURCHASE_PENDING } from '@/lib/purchase-client';
import './checkout.css';

type Props = { name: string; price: number; details: string[]; subject?: string; buyer: BuyerState; setBuyer: (p: Partial<BuyerState>) => void; consent: boolean; setConsent: (v: boolean) => void; busy: boolean; error: string; recovery: boolean; onPay: () => void; onClose: () => void; onCheck: () => void };

export default function Checkout(p: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [validation, setValidation] = useState('');
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; box.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  function submit(e: React.FormEvent) {
    e.preventDefault(); if (p.busy || p.recovery) return;
    const error = buyerInputError(p.buyer.name, p.buyer.phone) || (!p.buyer.agree ? '개인정보 수집·이용 동의를 확인해주세요.' : !p.consent ? '결제 및 이용약관 동의를 확인해주세요.' : '');
    setValidation(error);
    if (error) { requestAnimationFrame(() => box.current?.querySelector<HTMLElement>('[role="alert"]')?.focus()); return; }
    p.onPay();
  }
  return createPortal(<div className="checkout-overlay" onClick={e => { if (e.target === e.currentTarget && !p.busy) p.onClose(); }}>
    <div className="checkout-panel" role="dialog" aria-modal="true" aria-labelledby="checkout-title" ref={box} tabIndex={-1} onKeyDown={e => {
      if (e.key === 'Escape' && !p.busy) p.onClose();
      if (e.key !== 'Tab') return;
      const nodes = box.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled)');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === box.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }}>
      <div className="checkout-top"><span>1 구매 확인 · 2 카드 결제 · 3 리포트 열기</span><button type="button" aria-label="결제 창 닫기" disabled={p.busy} onClick={p.onClose}>×</button></div>
      <h2 id="checkout-title">구매할 내용을 확인해주세요</h2>
      <div className="checkout-order"><b>{p.name}</b>{p.subject && <p>{p.subject}</p>}<ul>{p.details.map(x => <li key={x}>{x}</li>)}</ul><div className="checkout-total"><span>이번 결제 금액 · 부가세 포함</span><strong>{won(p.price)}</strong></div><small>한 번 결제 · 자동으로 반복 결제되지 않습니다</small></div>
      <form onSubmit={submit}>
        {!p.recovery && <fieldset disabled={p.busy}>
          <h3>구매 기록을 찾을 정보</h3>
          <p className="checkout-help">풀이 대상과 구매자가 다르면, 구매자의 성함과 번호로 바꿔주세요. 다음에도 이 정보로 찾습니다.</p>
          <BuyerFields v={p.buyer} set={v => { setValidation(''); p.setBuyer(v); }} />
          <label className="consent"><input type="checkbox" checked={p.consent} onChange={e => { setValidation(''); p.setConsent(e.target.checked); }} /><span>결제 및 <Link href="/terms" className="legal-link">이용약관</Link>·<Link href="/privacy" className="legal-link">개인정보처리방침</Link>에 동의합니다. (열람 후 청약철회 제한: <Link href="/refund" className="legal-link">청약철회·환불 안내</Link>)</span></label>
        </fieldset>}
        {(validation || p.error || p.recovery) && <div className="errbox" role="alert" tabIndex={-1}>{validation || p.error || PURCHASE_PENDING}</div>}
        {p.recovery ? <div className="purchase-actions"><button type="button" disabled={p.busy} onClick={p.onCheck}>결제 상태 다시 확인</button><Link href="/find">구매 기록으로 찾기</Link><Link href="/contact">문의하기</Link></div> : <><button className="paygo" type="submit" disabled={p.busy || !p.price}>{p.busy ? '결제 결과를 확인하고 있습니다…' : `${won(p.price)} 카드 결제로 이어가기`}</button><p className="checkout-help">다음 결제창에서 신용·체크카드를 선택합니다. 결제 후 구매한 내용이 열리고, 보관함에서 다시 볼 수 있습니다.</p></>}
      </form>
      <button className="checkout-back" type="button" disabled={p.busy} onClick={p.onClose}>무료 결과로 돌아가기</button>
      <Link className="checkout-find" href="/find">이미 구매하셨나요? 구매한 리포트 찾기 →</Link>
    </div>
  </div>, document.body);
}
