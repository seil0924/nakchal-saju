import '@/app/en/bazi/bazi.css';
import { ogCard } from '@/lib/og';
import type { Metadata } from 'next';
import Link from 'next/link';
import BaziCalc from '@/app/_components/BaziCalc';

// 번체 중국어판. 홍콩·대만·마카오가 八字 검색 강도 1~3위다.
// CSS 는 영어판 것을 그대로 쓴다 — 두 벌로 나누면 언젠가 한쪽만 고쳐진다.
const BASE = 'https://nakchalsaju.com';

export const metadata: Metadata = {
  title: { absolute: '八字排盤 — 真太陽時四柱計算器' },
  description: '免費八字排盤。輸入出生年月日、時辰與城市，時柱依出生地真太陽時校正，節氣由太陽視黃經天文推算，而非查固定日曆。',
  keywords: ['八字', '八字排盤', '四柱', '真太陽時', '節氣', '日主', '十神', '免費排盤'],
  alternates: {
    canonical: '/zh/bazi',
    languages: { 'ko-KR': '/', 'en': '/en/bazi', 'zh-Hant': '/zh/bazi', 'x-default': '/en/bazi' },
  },
  openGraph: {
    title: '八字排盤 — 真太陽時四柱計算器',
    description: '免費八字排盤。依出生地校正真太陽時，節氣天文推算。',
    url: BASE + '/zh/bazi', type: 'website', locale: 'zh_TW', siteName: 'Nakchal Saju',
    images: ogCard({ seal: '命', k: '四柱 · 真太陽時', t: '免費八字排盤', s: '節氣以太陽黃經計算，非查表' }),
  },
  twitter: {
    card: 'summary_large_image',
    title: '八字排盤 — 真太陽時四柱計算器',
    description: '免費八字排盤。依出生地校正真太陽時，節氣天文推算。',
  },
};

export default function BaziZhPage() {
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication',
      name: '八字排盤', applicationCategory: 'ReferenceApplication',
      operatingSystem: 'Any', url: BASE + '/zh/bazi', inLanguage: 'zh-Hant',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' },
      description: '免費四柱八字排盤，依出生地校正真太陽時。',
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: '什麼是八字？',
          acceptedAnswer: { '@type': 'Answer', text: '八字又稱四柱，把出生的那一刻對應成八個字：年、月、日、時各有一個天干與一個地支。每個字帶有五行之一與陰陽屬性，論命所看的正是這些字彼此生剋的關係。' } },
        { '@type': 'Question', name: '為什麼要問出生地？',
          acceptedAnswer: { '@type': 'Answer', text: '時柱依真太陽時而定，不是時鐘時間。時鐘是按全國統一的標準經線設定的，因此出生地在該經線以東或以西就會有偏差。馬德里約落後時鐘七十五分鐘，烏魯木齊超過兩小時。只問日期與時間的排盤工具，無法為遠離標準經線出生的人定出時柱。' } },
        { '@type': 'Question', name: '不知道出生時辰怎麼辦？',
          acceptedAnswer: { '@type': 'Answer', text: '仍可排出年、月、日三柱。日主、五行強弱與大部分十神不需時柱也能看。日後查到時辰再補上即可。' } },
      ],
    },
  ];
  return (
    <div className="app home" lang="zh-Hant">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <div className="topbar">
        <Link className="logo" href="/zh/bazi" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>八字</Link>
        <Link className="bz-lang" href="/en/bazi" hrefLang="en">English</Link>
      </div>

      <div className="hero"><div className="kick">八 字 · 四 柱</div>
        <h1 style={{ fontSize: 19, marginTop: 8, lineHeight: 1.35 }}>你的八字，<br />時柱算得對的那一種</h1>
        <div style={{ color: '#c3cfe3', fontSize: 12, marginTop: 8, fontWeight: 500 }}>免費 · 免註冊 · 依出生地校正真太陽時</div>
      </div>

      <BaziCalc lang="zh" />

      <section className="bz-read" lang="zh-Hant">
        <h3>八個字是什麼</h3>
        <p>八字把出生的一刻讀成四柱 — 年、月、日、時。每一柱上為<b>天干</b>、下為<b>地支</b>，合計八個字，這就是「八字」的由來。每個字各帶五行之一與陰陽，論命看的是它們如何相生相剋。</p>

        <h3>日主是全盤的樞紐</h3>
        <p>日柱的天干代表本人。其餘七個字都相對於它來讀 — 何者生我、何者洩我、何者為我所剋。這層關係就是<b>十神</b>所命名的東西。正財並不等於財富本身，而是日主所能執掌之物。</p>

        <h3>時柱是各家排盤最常分歧之處</h3>
        <p>時鐘時間是行政上的方便。整個國家共用一條標準經線，住在它以東或以西的人便與太陽不同步。西班牙位於格林威治以西卻採用中歐時間，馬德里因此比太陽落後約<b>七十五分鐘</b>。新疆使用北京時間，偏差超過<b>兩小時</b>。時柱跟的是太陽，不是時鐘。</p>
        <p>有些排盤工具處理得當，有些根本不問出生地。只要日期與時間的工具，無法為遠離標準經線出生的人定出時柱 — 這正是兩個網站給你不同命盤最常見的原因。<Link href="/zh/why-charts-differ">我們在這裡逐條說明</Link>。</p>

        <h3>節氣用推算，不用查表</h3>
        <p>月柱在<b>節氣</b>交接時轉換，也就是太陽到達特定視黃經的那一刻。這個時刻逐年相差數小時，因此用固定日曆日期判斷，對節氣前後出生的人就會判錯。本工具按實際日期推算太陽位置，這是唯一能把那些人放對月份的辦法。</p>

        <h3>這套算法從哪裡來</h3>
        <p>這個傳統在東亞是共通的 — 韓國稱<i>사주</i>、中國稱<i>八字</i>、日本稱<i>四柱推命</i> — 算法相同，只是名稱不同。本工具由太陽視黃經推算節氣而非查表，並且會問你在哪裡出生，因為時柱取決於此。</p>
      </section>
    </div>
  );
}

