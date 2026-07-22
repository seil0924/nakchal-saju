import type { Metadata } from 'next';
import Link from 'next/link';

const BASE = 'https://nakchalsaju.com';

export const metadata: Metadata = {
  title: '2026 병오년 12지신 사업·입찰운세 — 띠별 수주 흐름 | 낙찰사주',
  description: '2026 병오년(붉은 말의 해) 12지신 띠별 사업·입찰·계약 운세. 대표·자영업·수주 사업자를 위한 올해의 흐름과 실전 수칙을 만세력으로 짚어드립니다.',
  keywords: ['2026 사업운세', '띠별 운세', '12지신 운세', '병오년', '입찰운', '사업자 운세', '올해의 운세'],
  alternates: { canonical: '/사업운세' },
  openGraph: { title: '2026 병오년 12지신 사업·입찰운세', description: '띠별 올해의 수주 흐름과 실전 수칙', type: 'article', siteName: '낙찰사주', url: BASE + '/사업운세' },
};

const TTI = [
  { a: '쥐띠', h: '子', y: '60·72·84·96·08년생', flow: '子午 충(沖) — 변화·이동수가 큰 해. 확장보다 정비가 유리합니다.', tip: '신규 무리보다 기존 발주처 재계약에 집중. 큰 건은 상반기보다 하반기로.' },
  { a: '소띠', h: '丑', y: '61·73·85·97·09년생', flow: '土가 火를 받아 단단해지는 해. 꾸준함이 빛납니다.', tip: '다년·유지보수 용역에 강세. 쌓아온 레퍼런스가 재입찰·수의계약의 무기.' },
  { a: '호랑이띠', h: '寅', y: '62·74·86·98·10년생', flow: '木生火 — 불은 지피는 나무. 추진력이 최고조에 이릅니다.', tip: '신규 진출·공격적 투찰 유리. 단, 마진 얇은 저가 투찰은 경계.' },
  { a: '토끼띠', h: '卯', y: '63·75·87·99·11년생', flow: '부드러운 나무의 해 — 관계·협업운이 좋습니다.', tip: '컨소시엄·공동수급이 유리. 혼자보다 손잡을 때 판이 커집니다.' },
  { a: '용띠', h: '辰', y: '64·76·88·00·12년생', flow: '화려하고 큰 판의 해. 규모 있는 사업에 도전운이 붙습니다.', tip: '스케일은 키우되 계약·법무(관재)는 평소보다 꼼꼼하게.' },
  { a: '뱀띠', h: '巳', y: '65·77·89·01·13년생', flow: '병오년과 같은 火 — 존재감·수주 확대의 해.', tip: '경쟁입찰에서 승부운. 과열될수록 냉정하게, 감정적 결정은 금물.' },
  { a: '말띠', h: '午', y: '66·78·90·02·14년생', flow: '본인의 해(태세). 주도권과 변화가 동시에 옵니다.', tip: '변수가 많은 해 — 중요 계약·투찰은 택일을 신중히 잡으세요.' },
  { a: '양띠', h: '未', y: '67·79·91·03·15년생', flow: '火의 기운을 품는 흙 — 내실·저축의 해.', tip: '무리한 확장보다 안정적 소·중형 사업으로 곳간을 채우는 전략.' },
  { a: '원숭이띠', h: '申', y: '68·80·92·04·16년생', flow: '火克金 — 초반은 단련의 시간, 하반기 반등.', tip: '상반기 인내, 하반기 승부수. 기술·전문성으로 승부하는 해.' },
  { a: '닭띠', h: '酉', y: '69·81·93·05·17년생', flow: '세공되는 금 — 디테일과 품질이 곧 돈이 됩니다.', tip: '정밀·품질 요구 사업에 유리. 서류·적격심사 완성도가 당락을 가릅니다.' },
  { a: '개띠', h: '戌', y: '70·82·94·06·18년생', flow: '火의 창고(火庫) — 결실과 정리의 해.', tip: '벌린 일은 매듭짓고 정산·재계약에 강세. 우량 발주처에 집중.' },
  { a: '돼지띠', h: '亥', y: '71·83·95·07·19년생', flow: '水의 해 — 火와 상반, 재충전·준비의 시기.', tip: '큰 승부보다 내년 준비. 관계·정보를 축적하며 힘은 아끼세요.' },
];

export default function SaeobUnsePage() {
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: '2026 병오년 12지신 사업·입찰운세',
    description: '2026 병오년 띠별 사업·입찰·계약 운세와 실전 수칙.',
    author: { '@type': 'Organization', name: '낙찰사주' },
    publisher: { '@id': BASE + '/#org' },
    inLanguage: 'ko', datePublished: '2026-01-01', mainEntityOfPage: BASE + '/사업운세',
  };
  return (
    <div className="app home">
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/reading" aria-label="오늘의 전망"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />

      <div style={{ padding: '18px 18px 4px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.28em', color: '#a99f88', fontWeight: 700, marginBottom: 6 }}>丙午年 · 事業運</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 23, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 8px' }}>2026 병오년 12지신 사업·입찰운세</h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 14px' }}>2026년은 <b>병오년(丙午) — 붉은 말의 해</b>입니다. 火 기운이 강해 속도·확장·경쟁이 두드러지는 한 해. 대표님 띠별로 올해의 수주 흐름과 실전 수칙을 짚어드립니다.</p>

        {TTI.map((t, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '15px 16px', marginBottom: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 9 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#a5241f,#7d1d12)', color: '#f6e7c8', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 19 }}>{t.h}</span>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15.5, color: 'var(--ink)' }}>{t.a}</div>
                <div style={{ fontSize: 12, color: '#8a806a', fontWeight: 600 }}>{t.y}</div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#33383f', margin: '0 0 7px', fontWeight: 600 }}>{t.flow}</p>
            <div style={{ display: 'flex', gap: 7, fontSize: 13.5, color: '#4a4438', lineHeight: 1.6 }}><span style={{ color: 'var(--gold2)', fontWeight: 900 }}>실전</span><span>{t.tip}</span></div>
          </div>
        ))}

        <div style={{ background: 'linear-gradient(135deg,#2a2622,#1c1916)', border: '1px solid var(--gold2)', borderRadius: 16, padding: '18px 17px', margin: '6px 0 4px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 16, color: '#f6e7c8', marginBottom: 6 }}>띠 운세는 큰 흐름일 뿐입니다</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: '#d8cdb5', margin: '0 0 12px' }}>같은 띠라도 태어난 월·일·시에 따라 사주는 전혀 달라집니다. 대표님의 <b style={{ color: '#f0d9a8' }}>실제 생년월일</b>로 오늘의 사정률·발주처 궁합·투찰 택일까지 만세력으로 짚어보세요.</p>
          <Link href="/reading" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 12, padding: '13px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 15.5, textDecoration: 'none' }}>내 사주로 30초 무료 확인 →</Link>
        </div>

        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, margin: '14px 0 22px' }}>※ 띠별 운세는 참고·오락용 정보입니다. 중요한 사업 판단은 반드시 대표님의 종합적 검토와 함께하세요.</p>
      </div>
    </div>
  );
}
