import { openKcpPay, KCP_CLIENT_ENABLED } from '@/app/_components/kcpPay';

export class PurchaseError extends Error {
  constructor(message: string, public recover = false) { super(message); }
}
export const PURCHASE_PENDING = '결제 결과를 아직 확인하지 못했습니다. 다시 결제하지 말고 결제 상태를 확인해주세요. 계속 열리지 않으면 구매 기록 찾기 또는 문의를 이용해주세요.';

export async function requestJSON(url: string, body?: unknown) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const r = await fetch(url, { signal: controller.signal, cache: 'no-store', ...(body === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }) });
    const data = await r.json();
    return { ok: r.ok, data };
  } finally { clearTimeout(timer); }
}

// Never suggest another charge after authorization might have occurred.
export async function startPurchase(body: unknown): Promise<'confirmed' | 'cancelled' | 'redirect'> {
  let mayHaveCharged = false;
  try {
    const { ok, data: prep } = await requestJSON('/api/payment/prepare', body);
    if (!ok || !prep.paymentId) throw new PurchaseError(prep.error === 'already_paid'
      ? '이미 구매한 항목입니다. 결제 상태 확인 또는 구매 기록 찾기로 열어주세요.'
      : prep.message || '결제를 준비하지 못했습니다. 입력 내용을 확인하고 다시 시도해주세요.', prep.error === 'already_paid');
    if (KCP_CLIENT_ENABLED) {
      mayHaveCharged = true;
      const auth = await openKcpPay({ paymentId: prep.paymentId, amount: prep.amount, goodName: prep.orderName ?? '낙찰사주 리포트' });
      if (auth === 'redirect') return 'redirect';
      if (!auth) return 'cancelled';
      const approval = await requestJSON('/api/payment/kcp/approve', { paymentId: prep.paymentId, ...auth });
      if (!approval.ok || !approval.data.ok) throw new PurchaseError(PURCHASE_PENDING, true);
    } else {
      const demo = await requestJSON('/api/payment/mock-confirm', { paymentId: prep.paymentId });
      if (!demo.ok || !demo.data.ok) throw new PurchaseError('결제창을 열 수 없습니다. 잠시 후 다시 시도하거나 문의해주세요.');
    }
    return 'confirmed';
  } catch (e) {
    if (e instanceof PurchaseError) throw e;
    throw new PurchaseError(mayHaveCharged ? PURCHASE_PENDING : '연결이 지연되어 결제를 준비하지 못했습니다. 잠시 후 다시 시도해주세요.', mayHaveCharged);
  }
}
