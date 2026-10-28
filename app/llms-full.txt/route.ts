import { FAQ_MAIN, GUIDE_FAQS } from '@/lib/faq';
import { GUIDES, REGIONS, INDUSTRIES } from '@/lib/seo-landings';
import { CONCEPTS } from '@/lib/seo-concepts';
import { CLIENTS } from '@/lib/clients';
import { GLOSSARY } from '@/lib/glossary';
import { getAllColumns } from '@/lib/column';
import { TAEKIL } from '@/lib/taekil';
import { TAEKIL_YEARS } from '@/lib/taekil-year';
import { TYPES } from '@/lib/sajang';

export const dynamic = 'force-static';

const BASE = 'https://nakchalsaju.com';

export function GET() {
  const parts: string[] = [];
  parts.push('# 낙찰사주 (nakchal-saju): 전체 콘텐츠');
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
    parts.push(`(${BASE}/saju/${encodeURIComponent(c.slug)})`);
    parts.push('');
  }

  // 택일과 대표 유형(2026-10-28). 검색으로 가장 많이 들어오는 무료 화면인데 전문에 빠져 있었다.
  parts.push('## 택일 (건제십이신)');
  for (const t of TAEKIL) {
    parts.push(`### ${t.kw}`);
    parts.push(t.lead);
    parts.push(t.pick);
    parts.push(`(${BASE}/taekil/${encodeURIComponent(t.slug)}, 연도판 ${TAEKIL_YEARS.map(y => `${BASE}/taekil/${encodeURIComponent(t.slug)}/${y}`).join(' ')})`);
    parts.push('');
  }

  parts.push('## 나는 대표가 될 사주일까 (다섯 갈래 대표)');
  parts.push('재성, 식상, 비겁, 일간의 힘, 천간에 드러난 재성·식상 다섯 신호가 몇 개 서는지로 네 단계 판정을 내고, 원국 일곱 자리 십성 중 가장 많은 무리로 대표 유형을 나눈다. 사업의 성패를 정하지 않는다.');
  for (const t of Object.values(TYPES)) parts.push(`- ${t.name}: ${t.one} 잘 맞는 판은 ${t.fit}.`);
  parts.push(`(${BASE}/sajang)`);
  parts.push('');

  parts.push('## 공공 발주처 사전 (설립일 기반 궁합)');
  parts.push(`아래 ${CLIENTS.length}곳의 설립일을 사전으로 두고 대표 사주와의 상성 및 조달 특성을 제공한다.`);
  for (const c of CLIENTS) parts.push(`- ${c.name} (설립 ${c.date}, ${c.cat})${c.tip ? ' · ' + c.tip : ''}`);
  parts.push('');

  parts.push('## 입찰·명리 용어 정의');
  for (const t of GLOSSARY) { parts.push(`### ${t.term} (${t.cat})`); parts.push(t.def); parts.push(''); }

  parts.push('## 업종별 입찰');
  for (const r of INDUSTRIES) { parts.push(`### ${r.name} 대표`); parts.push(r.intro); parts.push(`- 적격심사 특성: ${r.trait}`); parts.push(`- 명리 관점: ${r.myeong}`); parts.push(''); }

  parts.push('## 지역별 입찰');
  parts.push(REGIONS.map(r => `${r.name}(${BASE}/region/${r.slug})`).join(' · '));
  parts.push('');

  parts.push('## 사주 칼럼 (연재)');
  for (const c of getAllColumns()) {
    parts.push(`### ${c.title}`);
    parts.push(c.description);
    for (const f of c.faq ?? []) parts.push(`- Q. ${f.q} → ${f.a}`);
    parts.push(`(${BASE}/column/${c.slug})`);
    parts.push('');
  }

  parts.push('## 고지');
  parts.push('사주명리 이론에 기반한 참고·오락용 정보. 미래를 예측하거나 특정 결과(낙찰 등)를 보장하지 않으며, 실제 투찰금액 산정 근거로 사용할 수 없음.');

  return new Response(parts.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
