'use client';
import { Suspense, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { paymentReturnState } from '@/lib/payment-status';
import PaymentReturnNotice from './PaymentReturnNotice';

export default function PayNotice() {
  return <Suspense fallback={null}><ReturnNotice /></Suspense>;
}

function ReturnNotice() {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = pathname + '?' + search.toString();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const state = paymentReturnState(search.get('paid'), search.get('why'));
  // These pages verify access or show their own payment guidance.
  if (!state || dismissed === key || pathname.startsWith('/report/') || pathname === '/thanks' || pathname === '/bokchae') return null;
  // Keep callback parameters: reloading must not erase an unresolved result.
  return <div className="paytoast">
    <PaymentReturnNotice state={state} onClose={() => setDismissed(key)} />
  </div>;
}
