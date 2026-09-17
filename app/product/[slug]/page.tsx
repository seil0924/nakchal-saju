import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import './product.css';
import SiteTop from '@/app/_components/SiteTop';
import { PRODUCT_PAGES, productPageBySlug } from '@/lib/product-pages';
import { CAT_INFO } from '@/lib/report-categories';
import { won } from '@/lib/constants';
import { computeReport } from '@/lib/report';
import Preview from './Preview';

// 상품 상세페이지 (2026-09-17). 사주 사이트 15곳이 공통으로 쓰는 순서를 따른다:
// 고민 → 결과 미리보기 → 무료/유료 구분 → 목차 → 분량 → 가격 → 문답 → 입력.
// 분량은 예시 입력으로 실제 리포트를 계산해 센다 — 부풀린 숫자를 적지 않는다.
export const revalidate = 86400;

export function generateStaticParams() {
  return PRODUCT_PAGES.flatMap(p => [p.slug, ...(p.old || [])]).filter((s, i, a) => a.indexOf(s) === i).map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = productPageBySlug(decodeURIComponent(params.slug));
  if (!p) return { title: '낙찰사주' };
  const info = CAT_INFO[p.key];
  const hook = p.hook.replace(/\{\/?b\}/g, '').replace(/\n/g, ' ');
  return {
    title: `${info.name} — ${hook}`,
    description: p.sub,
    alternates: { canonical: `/product/${p.slug}` },
  };
}

// 대표 그림이 들어오기 전까지 히어로에 놓는 상품 아이콘(홈 목록과 같은 선 아이콘)
const ART: Record<string, string> = {
  daepyo: 'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c1.2-3.5 3.9-5.3 7-5.3s5.8 1.8 7 5.3',
  sajeong: 'M5 6h14v14H5zM8.5 4v4M15.5 4v4M5 10h14M9.5 15l2 2 3.5-3.5',
  gunghap: 'M9 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM15 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  daeun: 'M4 18l5-5 4 3 7-8M15 8h5v5',
  calendar: 'M5 6h14v14H5zM8.5 4v4M15.5 4v4M5 10h14M8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 16.5h.01M12 16.5h.01',
  calendar_year: 'M4 5h16v15H4zM8 3v4M16 3v4M4 9h16M7 12h2M11 12h2M15 12h2M7 15h2M11 15h2M15 15h2M7 18h2',
  balju: 'M3 10l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  ijeon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
};

function Hook({ s }: { s: string }) {
  return <>{s.split('\n').map((line, li) => {
    let on = false;
    const out: React.ReactNode[] = [];
    line.split(/(\{b\}|\{\/b\})/).forEach((x, i) => {
      if (x === '{b}') on = true; else if (x === '{/b}') on = false;
      else if (x) out.push(on ? <b key={i}>{x}</b> : <span key={i}>{x}</span>);
    });
    return <span key={li} className="pd-line">{out}</span>;
  })}</>;
}

// 예시 입력 하나로 무료·유료 분량을 센다(태그를 뺀 글자 수, 장 수)
function measure(key: string): { freeChars: number; paidChars: number; chapters: number } | null {
  if (key === 'ijeon') return null;
  try {
    const input: any = {
      name: '예시', birth: '1975-05-15', time: null, cal: 'solar', leap: false, cat: key,
      legal: '2010-03-02', legalName: '예시건설', partner: '1978-06-06', partnerName: '예시 대표',
      ally: '1999-09-09', allyName: '예시토건', client: '2001-01-05', clientName: '한국도로공사', clientCore: true,
    };
    const strip = (h: string) => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().length;
    const f = computeReport(input, 0), p = computeReport(input, 2, undefined, true);
    return {
      freeChars: f.sections.filter(s => s.html).reduce((a, s) => a + strip(s.html), 0),
      paidChars: p.sections.reduce((a, s) => a + strip(s.html), 0),
      chapters: p.sections.length,
    };
  } catch { return null; }
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const p = productPageBySlug(slug);
  if (!p) notFound();
  if (p.slug !== slug) permanentRedirect(`/product/${p.slug}`);
  const info = CAT_INFO[p.key];
  const hasImg = fs.existsSync(path.join(process.cwd(), 'public', 'product', `${p.img}.webp`));
  const m = measure(p.key);
  const others = PRODUCT_PAGES.filter(x => x.key !== p.key);
  const freeCount = p.key === 'daepyo' ? 6 : 0;   // 대표 사주는 앞 6장이 무료

  return (
    <div className="app pdpage">
      <SiteTop />

      <header className={'pd-hero' + (hasImg ? ' img' : '')}>
        {hasImg
          ? <img className="pd-art" src={`/product/${p.img}.webp`} alt="" width={780} height={520} />
          : (
            <div className={`pd-art pd-art-none k-${p.key}`} aria-hidden="true">
              <i className="o1" /><i className="o2" /><i className="o3" /><i className="o4" /><i className="o5" />
              <span className="pd-ic"><svg viewBox="0 0 24 24"><path d={ART[p.key]} /></svg></span>
            </div>
          )}
        <p className="pd-kick">{p.kicker}</p>
        <h1><Hook s={p.hook} /></h1>
        <p className="pd-sub">{p.sub}</p>
        <ul className="pd-badges">
          <li>명식·첫 장 무료</li><li>생년월일만 30초</li><li>가입 없이</li>
        </ul>
        <Link className="pd-cta" href={p.href}>무료로 먼저 보기</Link>
      </header>

      <section className="pd-sec">
        <h2>이런 고민이 있으신가요</h2>
        <ul className="pd-pains">{p.pains.map(x => <li key={x}>{x}</li>)}</ul>
      </section>

      <section className="pd-sec pd-gray">
        <h2>결과는 이렇게 나옵니다</h2>
        <Preview k={p.key} />
        <p className="pd-note">예시 화면입니다. 실제 결과는 대표님 생년월일로 계산됩니다.</p>
      </section>

      <section className="pd-sec">
        <h2>무료로 보는 것, 결제하면 열리는 것</h2>
        <div className="pd-two">
          <div className="pd-col free">
            <h3>무료 — 바로 보입니다</h3>
            <ul>{p.free.map(x => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="pd-col paid">
            <h3>결제하면 열립니다</h3>
            <ul>{p.paid.map(x => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="pd-sec">
        <h2>목차</h2>
        <ol className="pd-toc">
          {p.toc.map((x, i) => {
            const free = /— 무료$/.test(x) || i < freeCount;
            return (
              <li key={x} className={free ? 'free' : 'lock'}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="t">{x.replace(/ — 무료$/, '')}</span>
                <span className="s">{free ? '무료' : ''}</span>
              </li>
            );
          })}
        </ol>
        {m && (
          <dl className="pd-size">
            <div><dt>무료로 보이는 글</dt><dd>{m.freeChars.toLocaleString()}<small>자</small></dd></div>
            <div><dt>전체 열었을 때</dt><dd>{m.paidChars.toLocaleString()}<small>자</small></dd></div>
            <div><dt>장 수</dt><dd>{m.chapters}<small>장</small></dd></div>
          </dl>
        )}
        {m && <p className="pd-note">예시 생년월일 하나로 실제 리포트를 계산해 센 글자 수입니다(표·달력의 숫자 제외). 입력에 따라 조금씩 다릅니다.</p>}
      </section>

      <section className="pd-sec pd-gray">
        <h2>가격</h2>
        <div className="pd-price">
          <div className="pd-pl">
            <b>{info.name}</b>
            <span>명식·첫 장은 무료 · 잠긴 장을 열 때만 결제</span>
          </div>
          <div className="pd-pv">{won(info.price)}</div>
        </div>
        <ul className="pd-pay">
          <li>카카오페이 · 토스페이 · 신용/체크카드</li>
          <li>결제 즉시 열람 · 보관함에서 다시 보기</li>
          <li>열람 전 청약철회 가능 · <Link href="/refund">환불 안내</Link></li>
        </ul>
        <Link className="pd-sample" href="/samples">결제하면 열리는 화면, 샘플 리포트로 먼저 보기 →</Link>
      </section>

      <section className="pd-sec">
        <h2>자주 묻는 질문</h2>
        <div className="pd-faq">
          {p.faq.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </section>

      <section className="pd-sec">
        <h2>다른 풀이</h2>
        <ul className="pd-others">
          {others.map(o => (
            <li key={o.key}><Link href={`/product/${o.slug}`}><b>{CAT_INFO[o.key].name}</b><span>{o.sub}</span></Link></li>
          ))}
        </ul>
        <p className="pd-disc">명리 기반 참고 정보입니다. 투찰금액 산정이나 낙찰 여부 판단의 근거로 쓸 수 없습니다.</p>
      </section>

      <div className="pd-bar">
        <div className="pd-bar-tx"><b>{info.name}</b><span>명식·첫 장 무료</span></div>
        <Link className="pd-bar-go" href={p.href}>무료로 먼저 보기</Link>
      </div>
    </div>
  );
}
