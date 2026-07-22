import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function SaeobUnseIndex() {
  const y = new Date().getFullYear();
  const clamped = Math.min(2035, Math.max(2026, y));
  redirect(`/saeobunse/${clamped}`);
}
