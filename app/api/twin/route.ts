// POST /api/twin — 생년월일만으로 '나와 닮은 세계적 CEO' 매칭 (바이럴 입구)
// 개인 심층값(원국·사정률·궁합)은 주지 않고 '유형 + 닮은 CEO + 명리 근거'만 반환해 갈증을 만든다.
//
// target 을 주면 그 거장 한 명과의 비교(여섯 부호 겹침/다름, 100명 중 순위)를 같이 준다.
// 거장 상세 페이지(/ceo/<이름>)가 검색으로 들어온 사람을 그 자리에서 견주게 하려고 붙였다(2026-10-21).
import { NextResponse } from 'next/server';
import { chartFromBirth, pil } from '@/lib/engine';
import { matchTycoon, compareTycoon, TYPE_NAME, TYPE_DESC, TYPE_GOOD, TYPE_RISK, TYPE_WAY, TYPE_MYEONG, TYPE_USER, TYPE_BIZ, TYPE_HOPE } from '@/lib/tycoon';

export async function POST(req: Request) {
  try {
    const { birth, time, cal, leap, target } = await req.json();
    if (!birth || !/^\d{4}-\d{2}-\d{2}$/.test(birth)) {
      return NextResponse.json({ error: 'birth_required' }, { status: 400 });
    }
    const c = chartFromBirth(birth, time ?? null, cal ?? 'solar', leap ?? false);
    const me = c.dayMasterEl;
    const tm = matchTycoon(c);
    const vs = typeof target === 'string' && target.length <= 40 ? compareTycoon(c, target) : null;
    return NextResponse.json({
      type: TYPE_NAME[me], typeDesc: TYPE_DESC[me],
      good: TYPE_GOOD[me], risk: TYPE_RISK[me], way: TYPE_WAY[me],
      myeong: TYPE_MYEONG[me], user: TYPE_USER[me], biz: TYPE_BIZ[me], hope: TYPE_HOPE[me],
      me,
      myPills: pil(c.dGan, c.dZhi),           // 내 일주(맛보기): 전체 원국은 리포트에서
      myDist: c.dist,                          // 내 여덟 글자 오행 분포
      level: tm.level, count: tm.count, matched: tm.matched,
      tycoon: tm.tycoon, tyPills: tm.pills, tyEl: tm.el,
      tyDist: tm.tyDist, story: tm.story,      // 인물 삼주 오행 분포 + 성장 서사
      profile: tm.profile,                     // 상징·분야·연대·전성기 규모·연혁
      vs,                                      // target 과의 비교(없으면 null)
    });
  } catch {
    return NextResponse.json({ error: 'compute_failed' }, { status: 400 });
  }
}
