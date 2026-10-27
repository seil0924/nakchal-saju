// /gosa — 착공 고사 축문 만들기와 고사 날짜(2026-10-27).
// 낙찰받은 대표님이 착공 때 지내는 고사. 축문을 매번 인터넷에서 베끼고 날짜 줄을 손으로 고치는 일을 덜어 드린다.
// 축문 틀은 『가례』 후토 축문(lib/gosa). 계산은 브라우저에서(날짜가 '오늘' 기준이라).
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteTop from '@/app/_components/SiteTop';
import { ogCard } from '@/lib/og';
import GosaClient from './GosaClient';

const BASE = 'https://nakchalsaju.com';
const TITLE = '착공 고사 축문 만들기: 회사명·공사명만 넣으면 날짜 간지까지';
const DESC = '착공·기공 고사 때 읽는 토지신 축문을 만들어 드립니다. 회사명, 대표 성함, 공사명, 고사 날짜를 넣으면 유세차로 시작하는 날짜 줄(음력·간지)까지 채운 한문 축문과 한글 음독, 뜻풀이가 나오고 바로 인쇄할 수 있습니다. 앞으로 60일 중 고사 지내기 좋은 날도 함께 봅니다.';

export const metadata: Metadata = {
  title: { absolute: TITLE + ' | 낙찰사주' },
  description: DESC,
  keywords: ['고사 축문', '착공 고사 축문', '기공식 축문', '고사 축문 양식', '토지신 축문', '개토제 축문', '고사 날짜', '착공 고사'],
  alternates: { canonical: '/gosa' },
  openGraph: { title: '착공 고사 축문 만들기', description: DESC, url: BASE + '/gosa', type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: ogCard({ seal: '祝', k: '起工 告祀 祝文', t: '착공 고사 축문 만들기', s: '날짜 간지까지 채워 바로 인쇄' }) },
};

const FAQ: [string, string][] = [
  ['축문 첫 줄의 날짜는 왜 음력으로 쓰나요?', '축문은 예부터 음력으로 날을 적습니다. "유세차 병오 구월 정사삭 십팔일 갑술"이라면 병오년 음력 9월, 그달 초하루의 일진이 정사, 그날이 18일이고 일진이 갑술이라는 뜻입니다. 양력 날짜를 넣으면 이 줄을 계산해서 채웁니다.'],
  ['한문은 어디서 온 것인가요?', '『가례(家禮)』에서 땅을 열기 전에 후토(토지신)께 고하는 축문입니다. 우리나라 고사와 개토제에서 흔히 쓰는 "감소고우 토지지신" 꼴을 따랐고, 땅을 여는 까닭을 적는 자리에 공사 이름과 기공(起工)을 넣었습니다. 집안과 지역마다 문구가 조금씩 다를 수 있습니다.'],
  ['한문 대신 한글로 읽어도 되나요?', '됩니다. 한문 축문 아래에 한글 음독과 뜻풀이를 함께 드립니다. 현장 분위기에 맞춰 음독을 읽거나 뜻풀이를 읽으시면 됩니다.'],
  ['고사 날짜는 무엇으로 고르나요?', '건제십이신 가운데 세우는 날(建), 이루는 날(成), 여는 날(開), 자리가 굳는 날(定)을 골랐습니다. 깨지는 날(破), 위태로운 날(危), 닫는 날(閉)은 목록에 나오지 않습니다. 손 없는 날(음력 끝자리 9·0)은 따로 표시만 합니다. 실제 착공일은 발주처 일정이 먼저입니다.'],
];

export default function GosaPage() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: '착공 고사 축문 만들기', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any',
      url: BASE + '/gosa', inLanguage: 'ko', offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }, description: DESC },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
  return (
    <div className="app gosa-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteTop />
      <div className="wrap gosa-wrap">
        <div className="gosa-head">
          <h1 className="ct-h">착공 고사 축문 만들기</h1>
          <p className="ct-lead">회사명, 대표 성함, 공사명, 고사 날짜를 넣으면 날짜 줄까지 채운 축문이 나옵니다. 그대로 인쇄해 읽으시면 됩니다. 회원가입도 결제도 없습니다.</p>
        </div>

        <GosaClient />

        <section className="card gosa-faq">
          <h2>자주 묻는 질문</h2>
          {FAQ.map(([q, a]) => (<div key={q}><p className="q">{q}</p><p className="a">{a}</p></div>))}
        </section>

        <section className="card gosa-more">
          <h2>착공 다음은</h2>
          <p>공사를 따낸 뒤에는 계약서 도장 찍는 날과 착공 날짜, 다음 투찰 날을 고를 일이 이어집니다.</p>
          <ul>
            <li><Link href={`/taekil/${encodeURIComponent('계약일')}`}>계약일 택일</Link></li>
            <li><Link href="/taekil">개업·법인설립·사무실 이전 택일</Link></li>
            <li><Link href="/reading?cat=sajeong">오늘의 투찰 택일 무료로 보기</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
