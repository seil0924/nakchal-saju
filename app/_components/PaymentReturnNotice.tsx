import Link from 'next/link';
import { BOKCHAE_PENDING, PAYMENT_RETURN_COPY, type PaymentReturnState } from '@/lib/payment-status';
import { supportHref } from '@/lib/support';

export default function PaymentReturnNotice({ state, bokchae = false, onClose }: { state: PaymentReturnState; bokchae?: boolean; onClose?: () => void }) {
  const copy = PAYMENT_RETURN_COPY[state];
  return <section className={'paynote payment-return ' + (state === 'pending' ? 'stuck' : 'cancel')} role="status" aria-label="결제 결과 안내">
    <strong>{copy.title}</strong>
    <p>{bokchae ? state === 'pending' ? BOKCHAE_PENDING : '결제창에서 돌아왔습니다. 승인 알림을 받았거나 결제 여부가 확실하지 않다면 다시 결제하지 말고 카드사·간편결제 앱의 승인 내역을 확인한 뒤 문의해주세요.' : copy.text}</p>
    <div className="payment-return-actions">
      {!bokchae && <Link href="/find" className="payment-records">구매 기록 확인하기</Link>}
      <Link href={supportHref('pay')}>결제 문의하기</Link>
      {onClose && <button type="button" onClick={onClose} aria-label="결제 결과 안내 닫기">닫기</button>}
    </div>
  </section>;
}
