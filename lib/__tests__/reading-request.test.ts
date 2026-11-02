import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestReading, REPORT_TIMEOUT_MS } from '../reading-request';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('무료 결과 요청', () => {
  it('정상 결과를 불필요한 대기 없이 반환한다', async () => {
    const result = { reportId: 'r1', sections: [], hero: {} };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(result)));
    await expect(requestReading({}, new AbortController())).resolves.toEqual(result);
  });
  it('잘못된 날짜 응답은 입력 수정 안내로 바꾼다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'birth_invalid' }, { status: 400 })));
    await expect(requestReading({}, new AbortController())).rejects.toThrow('생년월일');
  });
  it('끊어진 연결과 잘못된 결과를 재시도할 수 있다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(requestReading({}, new AbortController())).rejects.toThrow('입력 내용은 그대로');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({})));
    await expect(requestReading({}, new AbortController())).rejects.toThrow('다시 시도');
  });
  it('응답이 멈춰도 무한 로딩에 머물지 않는다', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, opts) => new Promise((_resolve, reject) => {
      opts.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const result = expect(requestReading({}, new AbortController())).rejects.toThrow('응답이 늦어지고');
    await vi.advanceTimersByTimeAsync(REPORT_TIMEOUT_MS);
    await result;
  });
});
