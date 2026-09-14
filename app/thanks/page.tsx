import type { Metadata } from 'next';
import Link from 'next/link';
import SiteTop from '@/app/_components/SiteTop';

export const metadata: Metadata = {
  title: '결제가 완료되었습니다',
  description: '낙찰사주 결제가 정상적으로 완료되었습니다.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/thanks' },
};

export default function ThanksPage({ searchParams }: { searchParams: { kind?: string } }) {
  const isBokchae = searchParams?.kind === 'bokchae';
  const title = isBokchae ? '복채가 잘 전달되었습니다' : '결제가 완료되었습니다';
  const sub = isBokchae
    ? '정성으로 받았습니다. 대표님의 다음 입찰에 좋은 흐름이 함께하기를 빕니다.'
    : '결제가 정상적으로 처리되었습니다. 이용해 주셔서 감사합니다.';

  return (
    <div className="app home">
      <SiteTop />

      <div style={{ padding: '40px 22px 24px', textAlign: 'center' }}>
        <div aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: '#eef3fe', margin: '0 auto 18px' }}>
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#2f56c4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>

        <div style={{ fontSize: 13, color: '#2f56c4', fontWeight: 700, marginBottom: 8 }}>결제 완료</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.4, color: 'var(--ink)', margin: '0 0 12px' }}>{title}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.85, color: '#3a3630', fontWeight: 500, margin: '0 auto 26px', maxWidth: 340 }}>{sub}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
          <Link href="/reading" style={{ display: 'block', textAlign: 'center', background: '#3f6be0', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 12, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 17, textDecoration: 'none' }}>오늘의 투찰 택일 보기 →</Link>
          <Link href="/mypage" style={{ display: 'block', textAlign: 'center', background: '#fff', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>보관함으로</Link>
          <Link href="/" style={{ display: 'block', textAlign: 'center', color: '#58616a', padding: '8px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>홈으로 돌아가기</Link>
        </div>

        {/* 후기를 청하는 자리는 여기다. 결제 직후가 유일하게 「써 봤다」가 확실한 시점이라,
            후기가 실제로 들어오는 통로가 이 링크 하나뿐이다. */}
        <p style={{ fontSize: 13, color: '#58616a', lineHeight: 1.7, margin: '22px auto 0', maxWidth: 340 }}>
          써 보신 뒤 한 줄 남겨 주시면 다음 대표님께 도움이 됩니다 —{' '}
          <Link href="/review" style={{ color: 'var(--navy)', fontWeight: 700 }}>후기 남기기</Link>
        </p>

        <p style={{ fontSize: 13, color: '#636d77', lineHeight: 1.65, margin: '26px auto 0', maxWidth: 340 }}>영수증·결제 내역은 결제하신 카드사/간편결제 앱에서 확인하실 수 있습니다. 문의는 사이트 하단 연락처로 남겨주세요.</p>
      </div>
    </div>
  );
}
