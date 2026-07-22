import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const BASE = 'https://nakchalsaju.com';
const MIN = 2026, MAX = 2035;

const STEM_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const STEM_EL = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];
const STEM_COLOR = ['푸른', '푸른', '붉은', '붉은', '노란', '노란', '흰', '흰', '검은', '검은'];
const BRANCH_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const BR_HAN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const LIUHE = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
const SANHE = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]];
const CHONG = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
const GEN: Record<string, string> = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
const KE: Record<string, string> = { 목: '토', 토: '수', 수: '화', 화: '금', 금: '목' };
const THEME: Record<string, string> = {
  화: '火 기운이 강해 속도·확장·경쟁·가시성이 두드러지는 해',
  목: '木 기운의 해 — 성장·시작·새 판을 벌이기에 좋은 흐름',
  토: '土 기운의 해 — 안정·기반·신뢰가 힘이 되는 해',
  금: '金 기운의 해 — 결실·정리·수확과 규율이 중요한 해',
  수: '水 기운의 해 — 유연·지혜·준비와 흐름 읽기가 관건',
};
const BASE_TXT: Record<string, string> = {
  taese: '본인의 해(태세) — 주도권과 변화가 함께 오는 해.',
  liuhe: '올해와 육합(六合) — 귀인·협력운이 좋은 해.',
  sanhe: '올해와 삼합(三合) — 큰 흐름을 함께 타는 해.',
  chong: '올해와 충(沖) — 변화·이동수가 큰 해.',
  none: '올해와 큰 충·합은 없는 해 — 실속과 관리가 관건.',
};
const NUANCE: Record<string, string> = {
  gen_in: '올해가 밀어주는 기운 — 지원·성장운 가세, 적극적으로.',
  gen_out: '기운을 내주는 자리 — 소진 주의, 내실 다지기.',
  ke_in: '눌리는 기운 — 무리한 확장보다 수비·관리.',
  ke_out: '취하는 기운 — 재물·기회에 적극적으로.',
  same: '같은 기운 — 경쟁 속 차별화가 관건.',
};
const mod = (n: number, m: number) => ((n % m) + m) % m;
function yInfo(y: number) {
  const s = mod(y - 4, 10), b = mod(y - 4, 12);
  return { s, b, el: STEM_EL[s], ganzhi: STEM_KO[s] + BRANCH_KO[b] + '년', label: STEM_COLOR[s] + ' ' + ANIMAL[b] + '의 해', theme: THEME[STEM_EL[s]] };
}
function branchRel(b: number, Y: number) {
  if (b === Y) return 'taese';
  if (LIUHE.some(p => p.includes(b) && p.includes(Y))) return 'liuhe';
  if (SANHE.some(g => g.includes(b) && g.includes(Y))) return 'sanhe';
  if (CHONG.some(p => p.includes(b) && p.includes(Y))) return 'chong';
  return 'none';
}
function stemRel(pE: string, yE: string) {
  if (GEN[yE] === pE) return 'gen_in';
  if (GEN[pE] === yE) return 'gen_out';
  if (KE[yE] === pE) return 'ke_in';
  if (KE[pE] === yE) return 'ke_out';
  return 'same';
}
function build(y: number) {
  const { b: Yb, el: yE } = yInfo(y);
  return [...Array(12)].map((_, b) => {
    const base = BASE_TXT[branchRel(b, Yb)];
    const rows = [0, 12, 24, 36, 48].map(o => {
      const by = 1960 + b + o, ps = mod(by - 4, 10), pE = STEM_EL[ps];
      return { by, ganzhi: STEM_KO[ps] + BRANCH_KO[b], nuance: NUANCE[stemRel(pE, yE)] };
    });
    return { a: ANIMAL[b] + '띠', h: BR_HAN[b], base, rows };
  });
}

export function generateStaticParams() {
  return Array.from({ length: MAX - MIN + 1 }, (_, i) => ({ year: String(MIN + i) }));
}
export function generateMetadata({ params }: { params: { year: string } }): Metadata {
  const y = Number(params.year);
  if (!Number.isInteger(y) || y < MIN || y > MAX) return {};
  const yi = yInfo(y);
  const title = `${y} ${yi.ganzhi} 12지신 사업·입찰운세 — 출생연도별 | 낙찰사주`;
  const description = `${y}년(${yi.ganzhi}, ${yi.label}) 띠별·출생연도별 사업·입찰운세. 같은 띠라도 년주(年柱)에 따라 다른 올해의 수주 흐름과 실전 수칙.`;
  return {
    title, description,
    keywords: [`${y} 사업운세`, '띠별 운세', '출생연도별 운세', '12지신 운세', yi.ganzhi, '입찰운'],
    alternates: { canonical: `/saeobunse/${y}` },
    openGraph: { title: `${y} ${yi.ganzhi} 12지신 사업·입찰운세`, description: '띠별·출생연도별 올해의 수주 흐름', type: 'article', siteName: '낙찰사주', url: `${BASE}/saeobunse/${y}` },
  };
}

export default function YearPage({ params }: { params: { year: string } }) {
  const y = Number(params.year);
  if (!Number.isInteger(y) || y < MIN || y > MAX) notFound();
  const yi = yInfo(y);
  const DATA = build(y);
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: `${y} ${yi.ganzhi} 12지신 사업·입찰운세`,
    description: `${y}년 띠별·출생연도별 사업·입찰 운세와 실전 수칙.`,
    author: { '@type': 'Organization', name: '낙찰사주' }, publisher: { '@id': BASE + '/#org' },
    inLanguage: 'ko', datePublished: `${y}-01-01`, mainEntityOfPage: `${BASE}/saeobunse/${y}`,
  };
  const years = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i);
  return (
    <div className="app home">
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/reading" aria-label="오늘의 전망"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />

      <div style={{ padding: '18px 18px 4px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.28em', color: '#a99f88', fontWeight: 700, marginBottom: 6 }}>{yi.ganzhi} · 事業運</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 8px' }}>{y} {yi.ganzhi} 12지신 사업·입찰운세</h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 12px' }}>{y}년은 <b>{yi.ganzhi} — {yi.label}</b>. {yi.theme}입니다. 같은 띠라도 <b>태어난 해(년주)</b>에 따라 올해 기운과의 관계가 달라집니다 — 출생연도별로 짚어드립니다.</p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '0 0 16px' }}>
          {years.map(yy => (
            <Link key={yy} href={`/saeobunse/${yy}`} style={{ fontSize: 12.5, fontWeight: 700, textDecoration: 'none', padding: '5px 10px', borderRadius: 999, border: '1px solid var(--line)', color: yy === y ? '#fff' : '#8a806a', background: yy === y ? 'linear-gradient(135deg,var(--red),#7f1a17)' : '#fff' }}>{yy}</Link>
          ))}
        </div>

        {DATA.map((t, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '15px 16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#a5241f,#7d1d12)', color: '#f6e7c8', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 19 }}>{t.h}</span>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15.5, color: 'var(--ink)' }}>{t.a}</div>
                <div style={{ fontSize: 12.5, color: '#6a6152', fontWeight: 600 }}>{t.base}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, borderTop: '1px solid var(--line)', paddingTop: 9 }}>
              {t.rows.map((r, j) => (
                <div key={j} style={{ display: 'flex', gap: 9, fontSize: 13, lineHeight: 1.5, alignItems: 'baseline' }}>
                  <span style={{ flex: '0 0 82px', color: '#8a806a', fontWeight: 700, fontFamily: 'var(--serif)' }}>{r.by}<span style={{ fontSize: 11, color: '#b0a690', marginLeft: 4 }}>{r.ganzhi}</span></span>
                  <span style={{ color: '#4a4438' }}>{r.nuance}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ background: 'linear-gradient(135deg,#2a2622,#1c1916)', border: '1px solid var(--gold2)', borderRadius: 16, padding: '18px 17px', margin: '6px 0 4px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 16, color: '#f6e7c8', marginBottom: 6 }}>년주는 큰 흐름일 뿐입니다</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: '#d8cdb5', margin: '0 0 12px' }}>같은 해에 태어나도 월·일·시에 따라 사주는 전혀 달라집니다. 대표님의 <b style={{ color: '#f0d9a8' }}>정확한 생년월일</b>로 오늘의 사정률·발주처 궁합·투찰 택일까지 만세력으로 짚어보세요.</p>
          <Link href="/reading" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 12, padding: '13px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 15.5, textDecoration: 'none' }}>내 사주로 30초 무료 확인 →</Link>
        </div>

        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, margin: '14px 0 22px' }}>※ 년주(태어난 해의 간지)와 올해 간지의 오행 관계로 산출한 참고·오락용 정보입니다. 중요한 사업 판단은 대표님의 종합적 검토와 함께하세요.</p>
      </div>
    </div>
  );
}
