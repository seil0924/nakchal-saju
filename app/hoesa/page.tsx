// app/hoesa — 회사(법인) 사주 한 장.
//
// **왜 이 화면인가.** 개인 사주 앱은 법인이라는 개념이 없어 이 계산을 하지 않고,
// 입찰정보 서비스는 사주가 없다. 둘이 겹치는 자리가 비어 있어서 여기를 무료 입구로 세운다.
// 그리고 "법인 설립일 사주"를 검색하는 사람은 사실상 전부 사업자다 — 타겟팅이 공짜다.
//
// **폼도 결과도 서버가 그린다.** JS 없이 GET 으로 동작하므로
// ① 결과 주소가 그대로 공유 링크가 되고 ② 크롤러가 결과를 읽는다.
//
// **무료는 여기까지다.** 지금 구간이 확장이냐 수성이냐까지. 다음 10년 전개와
// 대표×회사 궁합은 회사 대운(29,000) 상품이다 — 그 선을 여기서 넘기지 않는다.
import type { Metadata } from 'next';
import Link from 'next/link';
import { ogCard, ogCardUrl } from '@/lib/og';
import { bizFooterLine } from '@/lib/bizinfo';
import {
  companyChart, companyDaeun, companySeun, elBalance,
  PHASE_LABEL, PHASE_HINT, DAEUN_LINE, elName, elHex, ganjaOf, eunNeun,
} from '@/lib/hoesa';
import './hoesa.css';

const BASE = 'https://nakchalsaju.com';
const T = '회사 사주 — 법인 설립일로 보는 우리 회사의 명식과 지금 구간';
const D = '사람에게 생년월일이 있듯 회사에는 설립일이 있습니다. 법인 설립일만 넣으면 회사의 명식 여덟 글자와, 지금이 확장 구간인지 수성 구간인지를 30초에 무료로 봅니다.';

export const metadata: Metadata = {
  title: T, description: D,
  alternates: { canonical: '/hoesa' },
  keywords: ['회사 사주', '법인 사주', '법인 설립일 사주', '회사 운세', '사업자등록일 사주', '회사 대운', '법인 설립일 택일'],
  openGraph: {
    title: T, description: D, url: `${BASE}/hoesa`, type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: ogCard({ seal: '會', k: '會社 四柱', t: '우리 회사의 사주', s: '설립일만 · 30초 · 무료' }),
  },
  twitter: {
    card: 'summary_large_image', title: T, description: D,
    images: [ogCardUrl({ seal: '會', k: '會社 四柱', t: '우리 회사의 사주', s: '설립일만 · 30초 · 무료' })],
  },
};

const FAQ = [
  ['회사에도 사주가 있나요?', '법인은 등기상 설립일을 기준으로 사주를 세웁니다. 사람과 똑같이 오행 균형과 10년 단위 대운이 생겨서, "예전엔 술술 됐는데 요즘 유독 더디다" 같은 흐름이 회사에도 나타납니다.'],
  ['설립 시각은 몰라도 되나요?', '괜찮습니다. 등기 시각을 아는 회사가 거의 없어 시주를 뺀 삼주(여섯 글자)로 봅니다. 회사의 결과 구간을 읽는 데는 충분합니다.'],
  ['개인사업자도 되나요?', '사업자등록일을 넣으시면 됩니다. 법인 설립일과 같은 방식으로 봅니다.'],
  ['확장·수확·수성 구간은 뭐가 다른가요?', '확장은 밖에서 밀어주는 때라 사람과 자금을 태워 벌일 때이고, 수확은 새로 벌이기보다 이미 벌여 둔 것을 거두고 굳힐 때이며, 수성은 내실·부채정리·핵심 집중의 때입니다. 계절을 거스르면 탈이 납니다 — 겨울의 무리한 확장과 봄의 과한 몸사림 둘 다 손해입니다.'],
];

export default function Hoesa({ searchParams }: { searchParams: { d?: string; n?: string } }) {
  const raw = (searchParams?.d || '').trim();
  const name = (searchParams?.n || '').trim().slice(0, 30);
  const ch = raw ? companyChart(raw) : null;
  const bad = !!raw && !ch;
  const label = name || '이 회사';
  const now = new Date();
  const curYear = now.getFullYear();

  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };

  return (
    <div className="app">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <div className="hero">
        <div className="k">會 社 四 柱</div>
        <h1>우리 회사의 사주</h1>
        <p>설립일만 넣으면 30초 · 가입도 결제도 없습니다</p>
      </div>

      <div className="wrap">
        <div className="card">
          <div className="st"><span className="b" />법인 설립일 · 사업자등록일</div>
          <form className="hsform" method="get" action="/hoesa">
            <div>
              <label htmlFor="n">회사명 <span style={{ fontWeight: 500, color: '#8d8672' }}>(선택)</span></label>
              <input id="n" name="n" type="text" maxLength={30} defaultValue={name} placeholder="○○건설" autoComplete="organization" />
            </div>
            <div>
              <label htmlFor="d">설립일 (양력)</label>
              <input id="d" name="d" type="date" required defaultValue={raw} min="1900-01-01" max="2100-12-31" />
            </div>
            <button className="hsgo" type="submit">회사 사주 보기 →</button>
          </form>
          {bad && <p className="note" style={{ color: '#a3341f', fontWeight: 700 }}>날짜를 다시 확인해 주세요. 실제로 있는 날이어야 합니다.</p>}
          <p className="note">사람에게 생년월일이 있듯, 회사에는 설립일이 있습니다. 그날의 여덟 글자가 회사의 타고난 결과 10년 흐름을 정합니다.</p>
        </div>

        {ch && <Result ch={ch} label={label} curYear={curYear} raw={raw} name={name} />}

        <div className="card">
          <div className="st"><span className="b" />자주 묻는 질문</div>
          {FAQ.map(([q, a]) => (
            <div key={q} style={{ marginBottom: 13 }}>
              <p style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--navy)', marginBottom: 4 }}>Q. {q}</p>
              <p style={{ fontSize: 13, color: '#4a4636', lineHeight: 1.75 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="foot">
        <div className="crule" />
        <div aria-hidden="true" className="colo">士</div>
        명리 기반 참고 정보입니다 · 경영 판단의 근거로 사용할 수 없습니다<br />
        <Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link> · <Link href="/pricing">이용안내·요금</Link>
        <div className="bizinfo">{bizFooterLine()}</div>
      </div>
    </div>
  );
}

function Result({ ch, label, curYear, raw, name }: {
  ch: NonNullable<ReturnType<typeof companyChart>>; label: string; curYear: number; raw: string; name: string;
}) {
  const d = companyDaeun(ch, curYear);
  const s = companySeun(ch, curYear);
  const b = elBalance(ch);
  const cur = d.list[d.curBlock];
  const share = `${BASE}/hoesa?d=${encodeURIComponent(raw)}${name ? `&n=${encodeURIComponent(name)}` : ''}`;

  return (
    <>
      <div className="card">
        <div className="st"><span className="b" />{label}의 명식 <span style={{ fontWeight: 500, color: '#8d8672', fontSize: 12 }}>· 설립 {ch.foundYear}년</span></div>
        <div className="_hspil">
          {(['년주', '월주', '일주'] as const).map((lb, i) => {
            const [g, z] = [[ch.yGan, ch.yZhi], [ch.mGan, ch.mZhi], [ch.dGan, ch.dZhi]][i];
            return (
              <div className="p" key={lb}>
                <div className="lb">{lb}</div>
                <div className="gz" style={{ color: elHex(elIdxOf(g)) }}>{ganjaOf(g, z)}</div>
                <div className="el">{elName(elIdxOf(g))}</div>
              </div>
            );
          })}
        </div>
        {/* 여기는 방금 자기 회사 명식을 처음 본 자리다. 변명이 아니라 사실만 적는다 —
            "아는 회사가 없어서"로 시작하면 아무도 안 물어본 의심을 먼저 심는다.
            왜 시주가 없는지는 아래 문답("설립 시각은 몰라도 되나요?")에 그대로 있다. */}
        <p className="note">회사 명식은 설립일의 세 기둥 — <b>년주·월주·일주</b>로 세웁니다.</p>
      </div>

      <div className="card">
        <div className={`hsphase ${d.phase}`}>
          <div className="k">지금 {label}{eunNeun(label)}</div>
          <div className="v">{PHASE_LABEL[d.phase]}</div>
          <div className="d">{DAEUN_LINE[d.rel]}</div>
          <div className="d" style={{ marginTop: 6, fontWeight: 700 }}>{PHASE_HINT[d.phase]}</div>
          <div className="age">설립 {d.age}년차 · {cur.from}~{cur.to}년차 구간 ({ganjaOf(cur.gan, cur.zhi)})</div>
        </div>
        <p className="note">계절을 거스르면 탈이 납니다 — 겨울의 무리한 확장과 봄의 과한 몸사림, 둘 다 손해입니다.</p>
      </div>

      <div className="card">
        <div className="st"><span className="b" />{curYear}년 {s.hanja} — 올해의 흐름</div>
        <div className="hsseun">
          <span className="tag">{s.tag}</span>
          <span className="tx">{s.line}</span>
        </div>
      </div>

      <div className="card">
        <div className="st"><span className="b" />오행 균형</div>
        <div className="hsbal">
          {b.dist.map((v, i) => (
            <div className="c" key={i}>
              <div className="e" style={{ color: elHex(i) }}>{elName(i)}</div>
              <div className="n">{v}</div>
            </div>
          ))}
        </div>
        <p className="note">
          {b.zero
            ? <>여덟 글자가 <b>{elName(b.strong)}</b>으로 쏠리고 <b>{elName(b.weak)}</b> 한 자리가 비었습니다. 비어 있는 쪽이 이 회사가 반복해서 걸리는 지점입니다.</>
            : <><b>{elName(b.strong)}</b>이 두텁고 <b>{elName(b.weak)}</b>이 옅습니다. 옅은 쪽을 사람이나 시스템으로 채우면 균형이 섭니다.</>}
        </p>
      </div>

      <div className="card">
        <div className="hslock">
          <div className="t">여기서부터는 대표님과 함께 봐야 합니다</div>
          <div className="d">
            회사가 어떤 결인지는 위에서 다 보셨습니다. 남은 질문은 하나입니다 —
            <b> 이 회사가 대표님을 밀어주는가, 아니면 계속 빼가는가.</b><br />
            그리고 <b>다음 10년</b>의 확장·정비 구간이 언제 오는지도 함께 봅니다.
          </div>
          <div className="hsex">
            <Link href="/reading?cat=daeun">회사 대운 · 대표 궁합 보기 →</Link>
            <Link href="/column/hoesa-daepyo-gunghap">회사와 대표의 궁합이란</Link>
            <Link href="/column/gaeeop-taekil">설립일 택일은 어떻게 하나</Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="st"><span className="b" />이 결과 공유하기</div>
        <p className="note" style={{ marginTop: 0, wordBreak: 'break-all' }}>{share}</p>
        <p className="note">이 주소를 그대로 보내시면 같은 결과가 열립니다. 설립일만 담겨 있어 회사 내부 정보는 들어 있지 않습니다.</p>
      </div>
    </>
  );
}

// 천간 → 오행 (甲乙목 丙丁화 戊己토 庚辛금 壬癸수)
const elIdxOf = (g: number) => Math.floor(g / 2);
