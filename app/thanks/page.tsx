import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '결제가 완료되었습니다 | 낙찰사주',
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
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/reading" aria-label="오늘의 전망"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>

      <div style={{ padding: '40px 22px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#a5241f,#7d1d12)', border: '2px solid var(--gold2)', color: '#f6e7c8', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 38, margin: '0 auto 20px', boxShadow: '0 8px 26px rgba(125,29,18,.28)' }}>士</div>

        <div style={{ fontSize: 11, letterSpacing: '.28em', color: '#a99f88', fontWeight: 700, marginBottom: 8 }}>結濟 完了</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 24, lineHeight: 1.4, color: 'var(--ink)', margin: '0 0 12px' }}>{title}</h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.85, color: '#3a3630', fontWeight: 500, margin: '0 auto 26px', maxWidth: 340 }}>{sub}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
          <Link href="/reading" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none' }}>오늘의 사정률 보기 →</Link>
          <Link href="/mypage" style={{ display: 'block', textAlign: 'center', background: '#fff', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 14, padding: '14px', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>보관함으로</Link>
          <Link href="/" style={{ display: 'block', textAlign: 'center', color: '#8a806a', padding: '8px', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>홈으로 돌아가기</Link>
        </div>

        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, margin: '26px auto 0', maxWidth: 340 }}>영수증·결제 내역은 결제하신 카드사/간편결제 앱에서 확인하실 수 있습니다. 문의는 사이트 하단 연락처로 남겨주세요.</p>
      </div>
    </div>
  );
}
