export type PaymentReturnState = 'cancelled' | 'failed' | 'pending';

// Return parameters guide the UI only. Paid access must still be verified by the server.
// Unknown or incomplete callbacks must never be treated as a confirmed cancellation.
export function paymentReturnState(paid: string | null | undefined, why: string | null | undefined): PaymentReturnState | null {
  if (paid == null && !why) return null;
  if (paid === '0' && why === 'auth:3001') return 'cancelled';
  if (paid === '0' && /^(auth|approve):/.test(why || '')) return 'failed';
  return 'pending';
}

export const PURCHASE_PENDING = '결제 결과를 아직 확인하지 못했습니다. 중복 결제를 피하려면 다시 결제하지 말고 구매 기록을 먼저 확인해주세요. 기록이 없거나 구매한 내용이 열리지 않으면 카드사·간편결제 앱의 승인 내역을 확인한 뒤 문의해주세요.';
export const BOKCHAE_PENDING = '복채 결제 결과를 아직 확인하지 못했습니다. 다시 결제하지 말고 카드사·간편결제 앱의 승인 내역을 먼저 확인해주세요. 복채는 리포트 구매 기록에 표시되지 않으므로, 확인이 어려우면 결제 문의를 이용해주세요.';
export const PAYMENT_RETURN_COPY = {
  cancelled: { title: '결제를 취소했습니다', text: '결제창에서 취소되어 돌아왔습니다. 카드 승인 알림을 받았거나 이미 결제한 적이 있다면, 다시 결제하기 전에 구매 기록을 확인해주세요.' },
  failed: { title: '결제를 완료하지 못했습니다', text: '결제 과정에서 오류가 발생했습니다. 카드 승인 알림을 받았거나 결제 여부가 확실하지 않다면, 다시 결제하지 말고 구매 기록을 먼저 확인해주세요.' },
  pending: { title: '결제 결과 확인이 필요합니다', text: PURCHASE_PENDING },
} as const;
