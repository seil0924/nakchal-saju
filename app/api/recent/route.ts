// app/api/recent/route.ts — 홈에서 "최근 발행" 3편을 읽어가는 경량 엔드포인트.
// 칼럼 로더가 파일시스템(server-only)을 쓰기 때문에 클라이언트 컴포넌트가 직접 못 부른다.
// 콘텐츠는 빌드 시점에 고정되므로 한 시간 캐시로 충분하다.
import { NextResponse } from 'next/server';
import { getAllColumns } from '@/lib/column';

export const revalidate = 3600;

export function GET() {
  const all = getAllColumns();
  return NextResponse.json({
    total: all.length,
    items: all.slice(0, 3).map(c => ({ slug: c.slug, title: c.title, date: c.date })),
  });
}
