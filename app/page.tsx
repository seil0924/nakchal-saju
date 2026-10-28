import type { Metadata } from 'next';
import Link from 'next/link';
import './home6.css';
import { GUIDES, REGIONS, INDUSTRIES } from '@/lib/seo-landings';
import { CONCEPTS } from '@/lib/seo-concepts';
import TodayChip from '@/app/_components/TodayChip';
import LangNudge from '@/app/_components/LangNudge';
import TrustStrip from '@/app/_components/TrustStrip';
import ReviewStrip from '@/app/_components/ReviewStrip';
import { bizFooterLine } from '@/lib/bizinfo';
import { CLIENTS } from '@/lib/clients';
import { TYCOONS } from '@/lib/tycoon';
import { GLOSSARY } from '@/lib/glossary';
import { getAllColumns } from '@/lib/column';
import { GAN, ZHI, EL_HEX, GAN_ELc, ZHI_ELc } from '@/lib/preview';
import BrandMark from '@/app/_components/BrandMark';
import { FEATURED, GROUPS } from '@/lib/nav';

// 홈만 스스로를 정본으로 선언한다. 레이아웃에 두면 모든 페이지가 이걸 물려받아 홈을 가리킨다.
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    // 영어판이 어디 있는지 알려 준다. 자동 리다이렉트 대신 이걸로 구글이 알아서 고른다.
    languages: { 'ko-KR': '/', 'en': '/en/bazi', 'zh-Hant': '/zh/bazi', 'x-default': '/en/bazi' },
    // 자기 alternates 를 두면 레이아웃의 RSS 알림이 덮인다. 홈에도 다시 적는다.
    types: { 'application/rss+xml': [{ url: '/rss.xml', title: '낙찰사주 칼럼' }] },
  },
};

// 홈 — home6 (2026-09-14). 모바일 사주 사이트 15곳을 비교해 다시 짰다.
// 규칙: 첫 화면엔 한 줄 + 결과 예시 카드 + 버튼 하나, 그 아래 권하는 두 상품 → 나머지 목록(가격 없이 전부 '무료').
// 배경은 흰색·연회색·파랑 셋. 글씨는 13·15·17·22 네 단계. 표식은 오행 다섯 색 한 줄.
// 장식 한자는 쓰지 않는다 — 명식 간지·건제십이신처럼 뜻이 있는 한자만 남긴다.
// 후기가 붙으면 홈도 갱신돼야 한다. 관리자 등록 때 revalidatePath('/') 로 즉시 반영되고, 10분 주기도 함께 건다.
export const revalidate = 600;

// 처음 온 대표에게 권하는 두 가지. 아홉 칸이 같은 무게로 늘어서 있으면 무엇부터 누를지 모른다.
// 홈에는 가격을 적지 않는다(2026-09-15 대표 지시) — 금액이 줄줄이 보이면 아무도 안 들어온다.
// 모든 상품이 명식·방향·첫 장은 무료로 나오고, 결제는 결과 화면에서 잠긴 장을 열 때만 한다.
// 이름·아이콘·묶음은 데스크톱 왼쪽 메뉴와 같은 곳(lib/nav)에서 읽는다(2026-10-28).
// 첫 화면 예시 카드 — 실제 결과 화면과 같은 모양의 '예시'. 명식 간지와 오행 색은 실제 계산값(1971-07-16생)이다.
const SAMPLE = [
  { pos: '년주', g: 7, z: 11 }, { pos: '월주', g: 1, z: 7 }, { pos: '일주', g: 8, z: 2 },
];

// 대표가 밤에 혼자 되뇌는 말을 대표 말투로. 숫자나 후기처럼 읽히는 구체 횟수는 넣지 않는다(지어낸 사례가 된다).
const INNER = [
  '견적은 맞게 뽑았는데 또 하한가 근처에서 밀렸습니다.',
  '개찰 결과를 몇 번이고 다시 엽니다.',
  '월급날은 다가오는데 이번 달 낙찰이 없습니다.',
  '큰 건 하나를 두고 오늘 넣을지 내일 넣을지 밤새 고민합니다.',
];
const ALONE = [
  '직원에게는 괜찮다고 말합니다.',
  '집에는 이번 달 이야기를 꺼내지 않습니다.',
  '협정 상대에게는 흔들리는 모습을 보일 수 없습니다.',
];

const MORE: { href: string; label: string; sub: string }[] = [
  { href: '/why', label: '하한가·연패·큰 건 고민', sub: '실력이 아니라 흐름의 문제일 수 있습니다' },
  { href: '/samples', label: '샘플 리포트', sub: '결제하면 무엇이 열리는지 미리 봅니다' },
  { href: '/faq', label: '자주 묻는 질문', sub: '사정률·환불·계산 방법' },
  { href: '/bokchae', label: '복채', sub: '받은 풀이에 스스로 놓고 가는 마음' },
];

export default function Home() {
  // 하드코딩하지 않는다 — 실제 데이터에서 세야 콘텐츠가 늘 때 같이 오른다.
  const scale = [
    { n: getAllColumns().length, u: '편', t: '사주 칼럼' },
    { n: CLIENTS.length, u: '곳', t: '발주처' },
    { n: TYCOONS.length, u: '인', t: '거장 명식' },
    { n: GLOSSARY.length, u: '개', t: '용어' },
  ];
  return (
    <div className="app home6">
      <LangNudge />

      <header className="h6-top">
        <Link href="/" className="h6-brand" aria-label="낙찰사주 홈">
          <BrandMark size={40} />
          <span>낙찰사주</span>
        </Link>
        <Link href="/more" className="h6-menu" aria-label="메뉴 · 더보기">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </Link>
      </header>

      <section className="h6-intro">
        {/* 장면 그림 카드(연한 바탕)를 제목 위에 따로 두니 로고 거북과 겹쳐 스티커처럼 떠 보였다(2026-10-23 대표 지적).
            흰 바탕 거북을 제목 옆에 붙여 한 덩어리로 둔다. */}
        <div className="h6-head">
          <div>
            <p className="h6-eye">공공입찰 대표를 위한 사주</p>
            <h1>마감 10분 전,<br />투찰 버튼 위에서 손이 멈출 때</h1>
          </div>
          <BrandMark size={84} />
        </div>
        <p className="h6-lead">금액은 다 뽑았습니다. 남은 건 언제 넣느냐입니다.</p>

        <figure className="h6-sample" aria-label="결과 화면 예시">
          <figcaption><span className="h6-tag">예시</span>1971년 7월 16일생 대표</figcaption>
          <div className="h6-smain">
            <div className="h6-pils" aria-label="명식 辛亥 乙未 壬寅">
              {SAMPLE.map(p => (
                <div key={p.pos} className={'h6-pil' + (p.pos === '일주' ? ' day' : '')}>
                  <span className="h6-pp">{p.pos}</span>
                  <b style={{ background: EL_HEX[GAN_ELc[p.g]] }}>{GAN[p.g]}</b>
                  <b style={{ background: EL_HEX[ZHI_ELc[p.z]] }}>{ZHI[p.z]}</b>
                </div>
              ))}
            </div>
            <div className="h6-sig">
              <span className="h6-sl">투찰 택일 신호</span>
              <span className="h6-sn">65<small>점</small></span>
              <span className="h6-sv">넣을 만한 흐름</span>
            </div>
          </div>
          <p className="h6-snote">분석형 대표 · 30일 투찰 길일 · 시진별 흐름까지</p>
        </figure>

        <Link className="h6-cta" href="/reading?cat=sajeong">내 생년월일로 오늘 보기</Link>
        <p className="h6-assure">가입 없이 30초 · 결제는 결과를 본 뒤에 고릅니다</p>
      </section>

      {/* 흐름(2026-10-28): 대표 속마음 → 말할 곳 없는 자리 → 우리가 하는 일 → 상품 → 선 긋기 → 이럴 때 보세요.
          일본 경영자용 점술 페이지(直凛·フォーチュンネイジュ)의 순서를 입찰 대표 장면으로 옮겼다.
          겁주는 말·애원하는 말·결과 약속은 쓰지 않는다(일본 소비자계약법 불안 조장 취소권, docs/STYLE.md). */}
      <section className="h6-sec h6-gray h6-voice" aria-labelledby="h6-inner">
        <h2 id="h6-inner" className="h6-h">대표님 속마음</h2>
        <ul className="h6-lines">
          {INNER.map(t => <li key={t}>{t}</li>)}
        </ul>
        <ul className="h6-lines alone">
          {ALONE.map(t => <li key={t}>{t}</li>)}
        </ul>
        <p className="h6-turn">그래서 넣는 날도 결국 대표님 혼자 정합니다.</p>
      </section>

      <section className="h6-sec" aria-labelledby="h6-do">
        <h2 id="h6-do" className="h6-h">저희가 하는 일</h2>
        <ul className="h6-lines plain">
          <li>사정률은 복수예비가격 추첨으로 정해집니다. 저희도 맞히지 못합니다.</li>
          <li>대표님이 고를 수 있는 건 넣는 날과 시간입니다.</li>
          <li>그날이 대표님 일간을 살리는 날인지, 일지와 부딪히는 날인지 만세력으로 계산해 드립니다.</li>
        </ul>
        <p className="h6-free"><b>바로 나오는 것</b>대표님 명식, 오늘의 투찰 신호, 앞으로 30일 중 넣을 만한 날</p>
      </section>

      <section className="h6-sec" aria-labelledby="h6-first">
        <h2 id="h6-first" className="h6-h">처음이라면 이 둘부터</h2>
        <ul className="h6-feat">
          {FEATURED.map(f => (
            <li key={f.href}>
              <Link href={f.href} className="h6-fcard">
                <span className="h6-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={f.d} /></svg></span>
                <span className="h6-ftx">
                  <b>{f.label}</b>
                  <span>{f.sub}</span>
                  <em>무료로 보기</em>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {GROUPS.map(g => (
        <section key={g.key} className="h6-sec" aria-labelledby={'h6-g-' + g.key}>
          <h2 id={'h6-g-' + g.key} className="h6-h">{g.title}</h2>
          <ul className="h6-list">
            {g.items.map(o => (
              <li key={o.href}>
                <Link href={o.href} className="h6-row">
                  <span className="h6-ic sm"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={o.d} /></svg></span>
                  <span className="h6-rtx"><b>{o.label}</b><span>{o.sub}</span></span>
                  <span className="h6-pr free">무료</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="h6-sec h6-gray" aria-labelledby="h6-today">
        <h2 id="h6-today" className="h6-h">오늘, 넣을 날인가</h2>
        <TodayChip />
      </section>

      <ReviewStrip />

      <section className="h6-sec" aria-labelledby="h6-scale">
        <h2 id="h6-scale" className="h6-h">지금까지 쌓은 것</h2>
        <dl className="h6-scale">
          {scale.map(s => (
            <div key={s.t}><dt>{s.t}</dt><dd>{s.n}<small>{s.u}</small></dd></div>
          ))}
        </dl>
        <p className="h6-note">절기는 태양황경으로 계산하고 진태양시·야자시를 보정합니다. 고정 만세력표를 쓰지 않습니다.</p>
      </section>

      <section className="h6-sec h6-gray"><TrustStrip /></section>

      <section className="h6-sec h6-close" aria-labelledby="h6-when">
        <p className="h6-promise">낙찰을 약속하지 않습니다. 날을 정할 근거 하나를 드립니다. 정하는 건 대표님입니다.</p>
        <h2 id="h6-when" className="h6-h">이럴 때 먼저 보세요</h2>
        <ul className="h6-lines when">
          <li>큰 건을 넣기 전날 밤에</li>
          <li>몇 달째 결과가 없을 때</li>
          <li>협정 상대를 정하기 전에</li>
        </ul>
        <Link className="h6-cta" href="/reading?cat=sajeong">내 생년월일로 무료로 보기</Link>
      </section>

      <section className="h6-sec" aria-labelledby="h6-more">
        <h2 id="h6-more" className="h6-h">더 알아보기</h2>
        <ul className="h6-rows">
          {MORE.map(m => (
            <li key={m.href}><Link href={m.href}><b>{m.label}</b><span>{m.sub}</span></Link></li>
          ))}
        </ul>
      </section>

      <nav className="h6-sec h6-links" aria-label="입찰 사주 가이드">
        <h2 className="h6-h">입찰 사주 가이드</h2>
        <div className="h6-chips">
          {GUIDES.map(g => <Link key={g.slug} href={`/guide/${g.slug}`}>{g.keywords[0]}</Link>)}
          {REGIONS.map(r => <Link key={r.slug} href={`/region/${r.slug}`}>{r.name} 입찰</Link>)}
          {INDUSTRIES.map(x => <Link key={x.slug} href={`/industry/${x.slug}`}>{x.name}</Link>)}
          <Link href="/glossary">용어사전</Link>
          <Link href="/method">계산 방법</Link>
        </div>
      </nav>

      {/* 사주 개념 18장(/saju/*). 네이버 검색 유입의 대부분이 '식신생재'·'재다신약' 같은 개념어라 홈에서 길을 둔다. */}
      <nav className="h6-sec h6-links" aria-label="사주 개념">
        <h2 className="h6-h">사주 개념</h2>
        <div className="h6-chips">
          {CONCEPTS.map(c => <Link key={c.slug} href={`/saju/${c.slug}`}>{c.label}</Link>)}
        </div>
      </nav>

      <footer className="h6-foot">
        <p>명리 기반 참고 정보입니다. 투찰금액 산정 근거가 아닙니다.</p>
        <p className="h6-flinks"><Link href="/terms">이용약관</Link><Link href="/privacy">개인정보처리방침</Link><Link href="/refund">청약철회·환불</Link><Link href="/pricing">이용안내·요금</Link></p>
        <p className="h6-biz">{bizFooterLine()}</p>
      </footer>
    </div>
  );
}
