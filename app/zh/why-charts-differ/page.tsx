import '@/app/en/why-charts-differ/why.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import ChartDiff from '@/app/_components/ChartDiff';
import { solarShiftMin } from '@/lib/manse-core';
import { findCity } from '@/lib/cities';
import { cityZh, countryZh } from '@/lib/cities-zh';

const BASE = 'https://nakchalsaju.com';

export const metadata: Metadata = {
  title: { absolute: '為什麼各家八字排盤結果不同？' },
  description: '同一個生辰，兩個網站給出不同的命盤。常見原因有五個：真太陽時、已廢止的夏令時間、節氣交界、子時換日，以及把農曆日期當成國曆輸入。附可自行操作的並排對照。',
  keywords: ['八字排盤不同', '為何命盤不一樣', '真太陽時', '時柱不準', '節氣交界', '子時換日'],
  alternates: {
    canonical: '/zh/why-charts-differ',
    languages: { 'en': '/en/why-charts-differ', 'zh-Hant': '/zh/why-charts-differ', 'x-default': '/en/why-charts-differ' },
  },
  openGraph: {
    title: '為什麼各家八字排盤結果不同？',
    description: '五個原因，加上一組你可以用自己生辰跑一遍的並排對照。',
    url: BASE + '/zh/why-charts-differ', type: 'article', locale: 'zh_TW', siteName: 'Nakchal Saju',
  },
  twitter: {
    card: 'summary_large_image',
    title: '為什麼各家八字排盤結果不同？',
    description: '五個原因，加上一組你可以用自己生辰跑一遍的並排對照。',
  },

const SAMPLE = ['Urumqi, China', 'Madrid, Spain', 'Paris, France', 'Seoul, South Korea',
  'Warsaw, Poland', 'Chicago, United States', 'London, United Kingdom', 'New York, United States',
  'Tokyo, Japan', 'Sydney, Australia'];


export default function WhyZhPage() {
  const rows = SAMPLE.map(k => {
    const c = findCity(k)!;
      return { city: cityZh(c), country: countryZh(c), jan: solarShiftMin(c, 1990, 1, 15, 12, 0) };
  }).sort((a, b) => a.jan - b.jan);

  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '為什麼兩個排盤網站給我不同的八字？',
        acceptedAnswer: { '@type': 'Answer', text: '多半出在時柱，因為時鐘時間不等於太陽時。一個國家共用一條標準經線，出生地在該經線以東或以西就有偏差 — 馬德里約七十五分鐘，烏魯木齊超過兩小時。其他原因包括已廢止的夏令時間、節氣交接的確切時刻、晚上十一點後出生如何換日，以及把農曆日期當成國曆輸入。' } },
      { '@type': 'Question', name: '哪一張才是對的？',
        acceptedAnswer: { '@type': 'Answer', text: '就時柱而言，用了出生地的那一張。真太陽時不是門派之見，而是算術：離標準經線每一度經度差四分鐘。子時換日則是各家確有分歧之處，兩種答案都站得住腳。' } },
      { '@type': 'Question', name: '不知道出生時辰的話還有影響嗎？',
        acceptedAnswer: { '@type': 'Answer', text: '影響較小。沒有時辰就只讀三柱，時柱不列入，最大的分歧來源也就消失了。但若出生日期在節氣交界一天之內，月柱仍可能不同。' } },
    ],
  };

  return (
    <div className="app home" lang="zh-Hant">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <div className="topbar">
        <Link className="logo" href="/zh/bazi" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>八字</Link>
        <Link className="bz-lang" href="/zh/bazi">排盤</Link>
      </div>

      <div className="hero"><div className="kick">同 日 異 命 · 一 生 兩 盤</div>
        <h1 style={{ fontSize: 19, marginTop: 8, lineHeight: 1.35 }}>為什麼各家八字排盤<br />結果會不一樣？</h1>
        <div style={{ color: '#c3cfe3', fontSize: 12, marginTop: 8, fontWeight: 500 }}>五個原因 — 以及一組你可以自己跑的並排對照</div>
      </div>

      <ChartDiff lang="zh" />

      <section className="bz-read" lang="zh-Hant">
        <h3>一、時鐘時間不是太陽時</h3>
        <p>這是最大的一項。整個國家共用一條標準經線，因此出生地若在它以東或以西，當地的正午就不是十二點。算法很單純 — <b>離該經線每一度經度差四分鐘</b>。西班牙位於格林威治以西卻採用中歐時間，馬德里因此偏差超過一小時。新疆在兩千公里外使用北京時間。</p>

        <div className="why-tbl">
          <div className="why-h"><span>出生地</span><span>真太陽時校正</span></div>
          {rows.map(r => (
            <div className="why-r" key={r.city}>
              <span>{r.city}<em>{r.country}</em></span>
              <span className={'why-n ' + (Math.abs(r.jan) >= 30 ? 'big' : '')}>
                {r.jan === 0 ? '無' : `${r.jan > 0 ? '+' : '−'}${Math.abs(r.jan)} 分`}
              </span>
            </div>
          ))}
          <p className="why-cap">以一月中旬為準，不含夏令時間。夏季實施夏令時間的國家還要再加一小時。</p>
        </div>

        <p>一小時的誤差會讓時柱整整移動一個地支，因為每個地支涵蓋兩小時。半小時的誤差則在出生時刻靠近交界時就會移動 — 而那是全部出生人數的四分之一。</p>

        <h3>二、早已廢止的夏令時間</h3>
        <p>韓國在一九四八至一九六〇年、以及一九八七至一九八八年實施過夏令時間。在那些期間出生的人，時鐘讀數比標準時快一小時，不知道這段歷史的排盤工具會把時柱往後放一個地支。這種陷阱在多數國家都有，規則屢經更動且少有整齊可循。這是查表問題，不是門派問題 — 一套工具要嘛帶著時區歷史，要嘛沒有。</p>

        <h3>三、月柱在節氣轉換，不在某個日期</h3>
        <p>月柱在太陽到達特定視黃經時轉換。那個時刻逐年相差數小時，因此不會落在固定的日曆日期上。查表判斷的工具，會把節氣交界一天之內出生的人放進錯誤的月份 — 而月柱正是論命最倚重的一柱。</p>

        <h3>四、夜裡十一點之後出生</h3>
        <p>從十一點開始的那個地支，一派歸入翌日的循環，另一派仍算當日。各家確有分歧，兩種立場都源遠流長。若兩張命盤只差在日柱，而出生時間又在深夜，通常就是這個原因 — 兩套工具都沒壞。值得知道的是某次論命採用了哪一種慣例。</p>

        <h3>五、把農曆日期當成國曆輸入</h3>
        <p>舊時家中記載常用農曆。輸入到預期國曆的欄位裡，會產生一張看似合理、實則差了好幾週的命盤。若一張盤感覺整整偏了一個月左右，這是第一個該檢查的地方。</p>

        <h3>那到底哪一張對？</h3>
        <p>前三項有正確答案，而且是算術而非見解。第四項是各家真正的分歧。第五項則要回頭問：那個日期出自哪一種曆。</p>
        <p>想用把出生地算進去的方式看自己的盤，<Link href="/zh/bazi">排盤工具在這裡</Link>。免費，會問你在哪裡出生，並且會告訴你校正了幾分鐘。</p>
      </section>
    </div>
  );
}

