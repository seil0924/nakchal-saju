import type { Metadata } from 'next';
import Link from 'next/link';
import SiteTop from '@/app/_components/SiteTop';
import Mascot from '@/app/_components/Mascot';
import { hasBaljuPass } from '@/lib/store';
import { buyerKeyFromCookie } from '@/lib/buyer';
import { requireUser } from '@/lib/supabase/server';
import { BOKCHAE_PENDING, PURCHASE_PENDING } from '@/lib/payment-status';
import { supportHref } from '@/lib/support';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '구매 내용 확인',
  description: '구매한 이용권을 확인하고 다시 이용하는 방법을 안내합니다.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/thanks' },
};

export default async function ThanksPage({ searchParams }: { searchParams: { kind?: string; paid?: string; why?: string } }) {
  const isBokchae = searchParams?.kind === 'bokchae';
  const user = isBokchae ? null : await requireUser();
  const passReady = !isBokchae && await hasBaljuPass(user?.id, buyerKeyFromCookie());
  const bokchaePending = isBokchae && (searchParams.paid !== '1' || !!searchParams.why);
  const needsCheck = isBokchae ? bokchaePending : !passReady;
  const title = needsCheck ? '결제 결과 확인이 필요합니다' : isBokchae ? '정성에 감사드립니다' : '발주처 패스가 열렸습니다';
  const sub = isBokchae
    ? bokchaePending ? BOKCHAE_PENDING : '정성으로 받았습니다. 대표님의 다음 입찰에 좋은 흐름이 함께하기를 빕니다.'
    : passReady ? '핵심 발주처의 상세 풀이를 이용할 수 있습니다. 아래에서 발주처를 선택해주세요.' : PURCHASE_PENDING;

  return (
    <div className="app home">
      <SiteTop />

      <div style={{ padding: '40px 22px 24px', textAlign: 'center' }}>
        <Mascot art="milestone" width={300} className="center pagepic" eager />

        <div style={{ fontSize: 13, color: '#2f56c4', fontWeight: 700, marginBottom: 8 }}>{needsCheck ? '추가 결제 전 확인' : isBokchae ? '감사합니다' : '이용권 확인 완료'}</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.4, color: 'var(--ink)', margin: '0 0 12px' }}>{title}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.85, color: '#3a3630', fontWeight: 500, margin: '0 auto 26px', maxWidth: 340 }}>{sub}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
          <Link href={bokchaePending ? supportHref('pay') : isBokchae ? "/reading" : passReady ? "/balju" : "/find"} style={{ display: 'block', textAlign: 'center', background: '#2f56c4', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 12, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 17, textDecoration: 'none' }}>{bokchaePending ? '복채 결제 문의하기 →' : isBokchae ? '오늘의 투찰 택일 보기 →' : passReady ? '발주처 상세 보러 가기 →' : '구매 기록 확인하기 →'}</Link>
          {needsCheck && !isBokchae && <Link href={supportHref('pay')} className="checkout-find">기록이 없거나 열리지 않나요? 결제 문의하기</Link>}
          <Link href="/vault" style={{ display: 'block', textAlign: 'center', background: '#fff', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>보관함으로</Link>
          <Link href="/" style={{ display: 'block', textAlign: 'center', color: '#58616a', padding: '8px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>홈으로 돌아가기</Link>
        </div>

        {!needsCheck && <p style={{ fontSize: 13, color: '#58616a', lineHeight: 1.7, margin: '22px auto 0', maxWidth: 340 }}>
          써 보신 뒤 한 줄 남겨 주시면 다음 대표님께 도움이 됩니다: {' '}
          <Link href="/review" style={{ color: 'var(--navy)', fontWeight: 700 }}>후기 남기기</Link>
        </p>}

        <p style={{ fontSize: 13, color: '#636d77', lineHeight: 1.65, margin: '26px auto 0', maxWidth: 340 }}>영수증과 결제 내역은 결제한 카드사나 간편결제 앱에서 봅니다. 확인이 어려우면 <Link href={supportHref('pay')}>결제 문의하기</Link>를 이용해주세요.</p>
      </div>
    </div>
  );
}
