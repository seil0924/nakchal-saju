import { FAQ_MAIN, GUIDE_FAQS } from '@/lib/faq';
import { GUIDES, REGIONS } from '@/lib/seo-landings';
import { CONCEPTS } from '@/lib/seo-concepts';
import { CLIENTS } from '@/lib/clients';

export const dynamic = 'force-static';

const BASE = 'https://nakchal-saju.vercel.app';

export function GET() {
  const parts: string[] = [];
  parts.push('# 낙찰사주 (nakchal-saju) — 전체 콘텐츠');
  parts.push('');
  parts.push('> 공공입찰·조달·경매·수주 사업 대표와 법인을 위한 사주명리(만세력) 기반 의사결정 참고 서비스. 낙찰 결과를 예측·보장하지 않으며 투찰금액 산정 근거가 아님. 아래는 AI 인용을 돕기 위한 핵심 콘텐츠 전문(全文)이다.');
  parts.push('');

  parts.push('## 자주 묻는 질문 (FAQ)');
  for (const x of FAQ_MAIN) { parts.push(`### ${x.q}`); parts.push(x.a); parts.push(''); }

  parts.push('## 입찰 사주 가이드');
  for (const g of GUIDES) {
    parts.push(`### ${g.h1}`);
    parts.push(g.lead);
    for (const s of g.sections) parts.push(`- ${s.h}: ${s.p}`);
    const fq = GUIDE_FAQS[g.slug] ?? [];
    for (const f of fq) parts.push(`- Q. ${f.q} → ${f.a}`);
    parts.push(`(${BASE}/guide/${g.slug})`);
    parts.push('');
  }

  parts.push('## 명리 개념 사전 (일간·오행)');
  for (const c of CONCEPTS) {
    parts.push(`### ${c.h1}`);
    parts.push(c.lead);
    parts.push(`(${BASE}/사주/${c.slug})`);
    parts.push('');
  }

  parts.push('## 공공 발주처 사전 (설립일 기반 궁합)');
  parts.push('아래 100곳의 설립일을 사전으로 두고 대표 사주와의 상성 및 조달 특성을 제공한다.');
  for (const c of CLIENTS) parts.push(`- ${c.name} (설립 ${c.date}, ${c.cat})${c.tip ? ' — ' + c.tip : ''}`);
  parts.push('');

  parts.push('## 지역별 입찰');
  parts.push(REGIONS.map(r => `${r.name}(${BASE}/region/${r.slug})`).join(' · '));
  parts.push('');

  parts.push('## 고지');
  parts.push('사주명리 이론에 기반한 참고·오락용 정보. 미래를 예측하거나 특정 결과(낙찰 등)를 보장하지 않으며, 실제 투찰금액 산정 근거로 사용할 수 없음.');

  return new Response(parts.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
