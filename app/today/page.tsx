import '@/app/_components/ilgan.css';
// /today — 오늘의 투찰 운세, 일간 열 개(2026-10-28). 한 시간마다 다시 굽는다.
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteTop from '@/app/_components/SiteTop';
import IlganFinder from '@/app/_components/IlganFinder';
import { ogCard, ogCardUrl } from '@/lib/og';
import { kstYmd } from '@/lib/kst';
import { ILGAN, TONE_LABEL } from '@/lib/ilgan';
import { daySignal } from '@/lib/today-ilgan';

// 내용은 KST 자정에 한 번 바뀐다. 한 시간 주기면 자정부터 1시까지 어제 날짜가 남아 있어서 5분으로 줄였다(2026-10-28).
// 다시 굽는 일은 방문이 있을 때만 일어나고 계산뿐이라 비용이 거의 없다.
export const revalidate = 300;
const BASE = 'https://nakchalsaju.com';
const T = '오늘의 투찰 운세';
const D = '오늘 일진을 일간 열 개에 맞대어, 대표님 일간에게 오늘이 넣기 편한 날인지 미루는 편이 나은 날인지 매일 계산해 둡니다. 내 일간을 모르면 생년월일로 바로 찾습니다.';
const CARD = { seal: '今', k: '今日 投札', t: '오늘의 투찰 운세\n일간 열 개', s: '매일 바뀌는 신호 · 무료' };

export const metadata: Metadata = {
  title: { absolute: `${T}, 일간별로 매일 | 낙찰사주` }, description: D,
  keywords: ['오늘의 투찰 운세', '입찰 운세', '오늘 입찰 운', '오늘의 운세 사업', '투찰 좋은 날', '일간별 운세'],
  alternates: { canonical: '/today' },
  openGraph: { title: T, description: D, url: BASE + '/today', type: 'website', locale: 'ko_KR', siteName: '낙찰사주', images: ogCard(CARD) },
  twitter: { card: 'summary_large_image', title: T, description: D, images: [ogCardUrl(CARD)] },
};

export default function TodayHub() {
  const today = kstYmd();
  const rows = ILGAN.map(x => ({ x, s: daySignal(x.idx, today) }));
  return (
    <div className="app il-app">
      <SiteTop />
      <header className="il-hero">
        <p className="il-eye">{rows[0].s.label} · 일진 {rows[0].s.ganji}</p>
        <h1>오늘의 투찰 운세</h1>
        <p className="il-lead">같은 날이라도 대표님 일간에 따라 넣기 편한 날이 다릅니다. 내 일간을 눌러 보세요.</p>
      </header>
      <section className="il-sec">
        <ul className="il-grid">
          {rows.map(({ x, s }) => (
            <li key={x.slug}>
              <Link href={`/today/${encodeURIComponent(x.slug)}`}>
                <b>{x.ko}{x.el} <small style={{ fontSize: 13, color: '#58616a', fontWeight: 600 }}>{x.hanja}</small></b>
                <span className={'il-tag t-' + s.tone}>{TONE_LABEL[s.tone]}</span>
              </Link>
            </li>
          ))}
        </ul>
        <IlganFinder base="/today" />
        <Link className="il-cta" href="/reading?cat=sajeong">
          내 생년월일로 오늘 보기
          <small>일지 충까지 넣은 신호 · 30일 길일 · 무료로 시작</small>
        </Link>
        <p className="il-disc">일간 하나와 그날 일진, 건제십이신으로 낸 명리 기반 참고 정보입니다. 사정률은 복수예비가격 추첨이라 누구도 미리 맞히지 못합니다. 낙찰을 약속하지 않습니다.</p>
      </section>
    </div>
  );
}
