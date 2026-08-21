import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// 계측의 핵심은 "하루 1회"다. 새로고침으로 숫자가 부풀면 그 숫자는 못 쓴다.
// node 환경이라 window/localStorage/navigator 를 최소로 세운다.
// navigator 는 런타임에 따라 읽기 전용 접근자라 defineProperty 로 덮어야 한다.
function makeStore() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => { map.set(k, v); },
    removeItem: (k: string) => { map.delete(k); },
  };
}

function setGlobal(name: string, value: unknown) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}

let beacons: { url: string; body: string }[];

beforeEach(() => {
  vi.resetModules();
  beacons = [];
  setGlobal('window', globalThis);
  setGlobal('localStorage', makeStore());
  setGlobal('navigator', {
    sendBeacon: (url: string, blob: { text?: string }) => {
      beacons.push({ url, body: String(blob?.text ?? '') });
      return true;
    },
  });
  setGlobal('Blob', class {
    parts: unknown[];
    constructor(parts: unknown[]) { this.parts = parts; }
    get text() { return this.parts.join(''); }
  });
});

afterEach(() => {
  for (const k of ['window', 'localStorage', 'navigator', 'Blob', 'fetch']) {
    Reflect.deleteProperty(globalThis, k);
  }
});

describe('track', () => {
  it('처음 보는 화면은 한 번 보낸다', async () => {
    const { track } = await import('@/lib/track');
    track('home');
    expect(beacons).toHaveLength(1);
    expect(beacons[0].url).toBe('/api/track');
    expect(JSON.parse(beacons[0].body).kind).toBe('home');
  });

  it('같은 날 같은 화면을 다시 봐도 두 번 세지 않는다', async () => {
    const { track } = await import('@/lib/track');
    track('ceo');
    track('ceo');
    track('ceo');
    expect(beacons).toHaveLength(1);
  });

  it('슬러그가 다르면 각각 센다', async () => {
    const { track } = await import('@/lib/track');
    track('column', 'aaa');
    track('column', 'bbb');
    expect(beacons).toHaveLength(2);
    expect(JSON.parse(beacons[1].body).slug).toBe('bbb');
  });

  it('날짜가 바뀌면 다시 센다', async () => {
    const { track } = await import('@/lib/track');
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 21, 10, 0));
    track('reading');
    vi.setSystemTime(new Date(2026, 7, 22, 10, 0));
    track('reading');
    vi.useRealTimers();
    expect(beacons).toHaveLength(2);
  });

  it('저장소가 막혀 있어도 예외를 밖으로 던지지 않는다', async () => {
    setGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    });
    const { track } = await import('@/lib/track');
    expect(() => track('home')).not.toThrow();
  });

  it('sendBeacon 이 없으면 fetch 로 보낸다', async () => {
    setGlobal('navigator', {});
    const calls: { url: string; opt: { method: string; body: string } }[] = [];
    setGlobal('fetch', (url: string, opt: { method: string; body: string }) => {
      calls.push({ url, opt });
      return Promise.resolve({});
    });
    const { track } = await import('@/lib/track');
    track('balju', 'lh');
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('/api/track');
    expect(calls[0].opt.method).toBe('POST');
    expect(JSON.parse(calls[0].opt.body).slug).toBe('lh');
  });
});
