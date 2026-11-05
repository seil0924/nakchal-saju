import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText, reportShareText, shareLink } from './share-client';

afterEach(() => vi.unstubAllGlobals());
const data = { title: '대표 사주', text: '검사용 풀이', url: 'https://example.com/report/test' };
function setup(share?: ReturnType<typeof vi.fn>, clipboard = vi.fn().mockResolvedValue(undefined)) {
  const alert = vi.fn(), prompt = vi.fn();
  vi.stubGlobal('navigator', { share, clipboard: { writeText: clipboard } });
  vi.stubGlobal('window', { alert, prompt });
  return { clipboard, alert, prompt };
}
describe('sharing recovery', () => {
  it('lets the user copy directly even when native sharing exists', async () => {
    const share = vi.fn(), { clipboard } = setup(share);
    await shareLink(data, true);
    expect(share).not.toHaveBeenCalled();
    expect(clipboard).toHaveBeenCalledWith(`${data.text}\n${data.url}`);
  });
  it('uses the native share dialog when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined), { clipboard } = setup(share);
    await shareLink(data);
    expect(share).toHaveBeenCalledWith(data);
    expect(clipboard).not.toHaveBeenCalled();
  });
  it('does not copy or show errors after the user cancels sharing', async () => {
    const { clipboard, alert, prompt } = setup(vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')));
    await shareLink(data);
    expect(clipboard).not.toHaveBeenCalled(); expect(alert).not.toHaveBeenCalled(); expect(prompt).not.toHaveBeenCalled();
  });
  it.each([undefined, vi.fn().mockRejectedValue(new Error('share unavailable'))])('copies when native sharing is missing or fails', async share => {
    const { clipboard, alert } = setup(share);
    await shareLink(data);
    expect(clipboard).toHaveBeenCalledWith(`${data.text}\n${data.url}`);
    expect(alert).toHaveBeenCalledOnce();
  });
  it('offers manual copying instead of silently swallowing clipboard rejection', async () => {
    const { prompt, alert } = setup(undefined, vi.fn().mockRejectedValue(new Error('denied')));
    expect(await copyText(data.url)).toBe(false);
    expect(prompt).toHaveBeenCalledWith(expect.any(String), data.url);
    expect(alert).not.toHaveBeenCalled();
  });
  it('retains the actual product and does not label every result a bid score', () => {
    expect(reportShareText('검사님의 대표 사주', '강점과 주의점')).toContain('대표 사주\n강점과 주의점');
    expect(reportShareText('회사 대운')).not.toContain('낙찰 유리도');
    expect(reportShareText('회사 대운')).not.toContain('undefined');
  });
});
