import { describe, expect, it } from 'vitest';
import { computeReport } from '../report';
import { saveReport, getReport, createOrder, confirmOrder, unlockLevel } from '../store';
import { ENTRY_QUESTIONS, firstReadingSection } from '../reading-focus';
describe('처음 질문을 구매 후에도 이어 읽기', () => {
  it.each(Object.keys(ENTRY_QUESTIONS))('%s 질문은 무료 본문을 노출하지 않고 구매 후 해당 장을 먼저 펼친다', async focusId => {
    const input = { name:'점검',birth:'1971-07-16',time:'09:20',cat:'daepyo',focusId };
    const free=computeReport(input,0);
    expect(free.focus?.open).toBe(false);
    expect(free.sections.find(s=>s.mk===free.focus?.mk)?.html).toBe('');
    const saved=await saveReport({...input,focus:free.focus});
    const order=await createOrder(saved.id,990,2);
    await confirmOrder(order.paymentId,990);
    const restored=(await getReport(saved.id))!;
    const paid=computeReport(restored,await unlockLevel(saved.id));
    expect(paid.focus?.question).toBe(free.focus?.question);
    expect(paid.focus?.open).toBe(true);
    expect(paid.sections[firstReadingSection(paid.sections,paid.focus)].mk).toBe(free.focus?.mk);
    expect(paid.sections[firstReadingSection(paid.sections,paid.focus)].html).not.toBe('');
  });
  it('기존 리포트와 다른 상품은 안전한 첫 장으로 열린다',()=>{
    const legacy=computeReport({birth:'1980-05-15',cat:'daepyo'},2);
    expect(legacy.focus).toBeNull();
    expect(firstReadingSection(legacy.sections,legacy.focus)).toBe(0);
    const other=computeReport({birth:'1980-05-15',cat:'calendar',focusId:'ceo'},0);
    expect(other.focus).toBeNull();
    expect(firstReadingSection(other.sections)).toBe(other.sections.findIndex(s=>!!s.html));
  });
});
