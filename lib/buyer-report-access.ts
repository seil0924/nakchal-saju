import 'server-only';
import { buyerKeyFromCookie } from './buyer';
import { purchasesOf } from './store';

// /find sets this httpOnly cookie after matching checkout details. Legacy
// account-owned reports may have no usable access token on another device.
export async function buyerCanViewReport(reportId: string): Promise<boolean> {
  const key = buyerKeyFromCookie();
  if (!key) return false;
  const completed = await purchasesOf(key);
  return completed.some(purchase => purchase.reportId === reportId);
}
