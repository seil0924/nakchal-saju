import { NextResponse } from 'next/server';
import { getReport, getReportAccess } from '@/lib/store';
import { entitlement, adminBypass } from '@/lib/entitle';
import { canViewPaid } from '@/lib/report-access';
import { buyerCanViewReport } from '@/lib/buyer-report-access';
import { requireUser } from '@/lib/supabase/server';
import { computeReport } from '@/lib/report';
import { parseQaRequest, qaSources, redactQaText, qaEligible } from '@/lib/report-qa';
import { reportQaAvailable, reserveQaQuestion, answerReportQuestion } from '@/lib/report-qa-server';

export const maxDuration = 60;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req: Request) {
  if (!reportQaAvailable()) return json({ message: '리포트 질문 기능을 준비하고 있습니다. 기존 리포트는 그대로 읽을 수 있습니다.' }, 503);
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) return json({ message: '리포트 화면에서 다시 질문해주세요.' }, 403);
  let body;
  try {
    const raw = await req.text();
    if (raw.length > 18000) return json({ message: '질문이 너무 깁니다. 짧게 나누어 질문해주세요.' }, 400);
    body = parseQaRequest(JSON.parse(raw));
  } catch { return json({ message: '질문을 읽지 못했습니다. 다시 입력해주세요.' }, 400); }
  if (!body) return json({ message: '질문과 AI 답변 이용 동의를 확인해주세요. 질문은 500자까지 입력할 수 있습니다.' }, 400);
  let remaining: number | null = null;
  try {
    const { reportId, t, year, sectionIndex } = body;
    const user = await requireUser();
    const { owner, token } = await getReportAccess(reportId);
    const admin = await adminBypass();
    if (!admin && !canViewPaid({ auth: true, userId: user?.id ?? null, owner, token, t, reportId }) && !await buyerCanViewReport(reportId)) return json({ message: '이 리포트를 열 수 있는 구매 정보를 확인해주세요.', recovery: true }, 403);
    const ent = await entitlement(reportId, user?.id);
    if (ent.level < 1 && !ent.bpass) return json({ message: '구매한 리포트에서 질문할 수 있습니다.', recovery: true }, 402);
    const input = await getReport(reportId);
    if (!input) return json({ message: '리포트를 찾지 못했습니다. 구매 기록에서 다시 열어주세요.', recovery: true }, 404);
    const rep = computeReport(input, ent.level, year, ent.bpass);
    if (!qaEligible(ent.level, ent.bpass, input.cat)) return json({ message: '구매한 상세 풀이가 있는 리포트에서 질문해주세요.', recovery: true }, 402);
    const privateValues = [input.name, input.birth, input.time, input.partner, input.partnerName, input.legal, input.legalName, input.ally, input.allyName, input.client, input.clientName].filter((s): s is string => !!s);
    const sources = qaSources(rep.sections, privateValues, sectionIndex);
    if (!sources.length) return json({ message: '읽을 수 있는 리포트 항목을 선택해주세요.' }, 400);
    remaining = await reserveQaQuestion(reportId);
    if (remaining < 0) return json({ message: '오늘의 질문 이용 한도에 도달했습니다. 내일 다시 이용해주세요. 기존 리포트와 대화는 계속 읽을 수 있습니다.', limited: true }, 429);
    const answer = await answerReportQuestion(redactQaText(body.question, privateValues), body.history.map(turn => ({ question: redactQaText(turn.question, privateValues), answer: redactQaText(turn.answer, privateValues) })), sources);
    return json({ ...answer, remaining });
  } catch {
    // Never log questions, report contents, provider responses, or access tokens.
    return json({ message: '답변을 가져오지 못했습니다. 질문은 입력창에 남아 있습니다. 잠시 후 다시 요청해주세요.', remaining }, 503);
  }
}
