// 조회 기록 한 줄(kind·slug)을 사람이 읽는 화면 이름과 주소로 바꾼다.
// 슬러그만 찍혀 있으면 '어느 글이 읽혔는지'를 알 수 없었다(2026-10-28).
import { getAllColumns } from '@/lib/column';
import { glossaryBySlug } from '@/lib/glossary';
import { SRC_LABEL, isSrc } from '@/lib/track-src';

const KIND_NAME: Record<string, string> = {
  home: '홈', reading: '무료 입력 화면', report: '리포트 결과 화면', product: '상품 상세', ceo: '닮은 CEO',
  column: '칼럼', balju: '발주처', glossary: '용어', why: '고민별 안내', saju: '일간·오행 안내',
  region: '지역별 안내', industry: '업종별 안내', taekil: '택일', tool: '도구·안내',
  today: '오늘의 투찰 운세', saeobunse: '사업운', sajang: '대표가 될 사주일까',
};

let colTitle: Map<string, string> | null = null;
const columnTitle = (slug: string) => {
  if (!colTitle) colTitle = new Map(getAllColumns().map(c => [c.slug, c.title]));
  return colTitle.get(slug);
};

const enc = (s: string) => encodeURIComponent(s);

export function pageOf(kind: string, slug: string | null): { name: string; href: string | null } {
  const k = KIND_NAME[kind] ?? kind;
  if (!slug) {
    const bare: Record<string, string> = { home: '/', reading: '/reading', today: '/today', sajang: '/sajang', saeobunse: '/saeobunse', why: '/why', taekil: '/taekil', glossary: '/glossary', column: '/column' };
    return { name: k, href: bare[kind] ?? null };
  }
  switch (kind) {
    case 'column': return { name: `칼럼 · ${columnTitle(slug) ?? slug}`, href: `/column/${slug}` };
    case 'glossary': return { name: `용어 · ${glossaryBySlug(slug)?.term ?? slug}`, href: `/glossary/${enc(slug)}` };
    case 'tool': return { name: `/${slug}`, href: `/${slug}` };
    case 'saeobunse': {
      // '2027-을목' 은 /saeobunse/2027/을목, '2027' 은 /saeobunse/2027
      const [y, il] = slug.split('-');
      return { name: `사업운 · ${y}년${il ? ' ' + il + ' 일간' : ''}`, href: `/saeobunse/${y}${il ? '/' + enc(il) : ''}` };
    }
    case 'today': return { name: `오늘의 투찰 운세 · ${slug} 일간`, href: `/today/${enc(slug)}` };
    default: return { name: `${k} · ${slug}`, href: `/${kind}/${enc(slug)}` };
  }
}

export function srcName(src: string): string {
  if (src === 'unknown') return '알 수 없음';
  return isSrc(src) ? SRC_LABEL[src] : src;
}

// '네이버 5 · 직접 방문 2' 처럼 많은 순으로 잇는다.
export function srcLine(by: Record<string, number>): string {
  return Object.entries(by).sort((a, b) => b[1] - a[1]).map(([s, n]) => `${srcName(s)} ${n}`).join(' · ');
}
