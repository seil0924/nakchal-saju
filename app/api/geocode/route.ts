// app/api/geocode/route.ts — 주소 → 좌표. 브이월드 지오코더 2.0 프록시.
//
// 서버를 거치는 이유가 둘 있다.
// ① 인증키를 브라우저에 노출하지 않는다.
// ② api.vworld.kr 은 CORS 를 열어주지 않아 브라우저에서 직접 못 부른다.
//
// 브이월드 이용조건상 응답을 저장할 수 없다(실시간 사용만 허용).
// 그래서 좌표도 주소도 DB 에 남기지 않고 그대로 돌려주기만 한다.
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 서울 리전에 붙인다. 미국 리전(iad1)에서 부르면 브이월드가 응답 없이 소켓을
// 끊어버렸다(UND_ERR_SOCKET). 국내 공공 API 는 해외 IP 를 반기지 않는다.
export const preferredRegion = ['icn1'];

// https 를 먼저 쓰되 http 도 남겨둔다. 공공 API 쪽 인증서 체인이 종종 불완전해
// 서버런타임 fetch 가 TLS 단계에서 그대로 터지는 일이 있다. 그때 조용히 죽지 않게.
const ENDPOINTS = ['https://api.vworld.kr/req/address', 'http://api.vworld.kr/req/address'];

// 기본 undici UA 를 그대로 두면 걸러내는 국내 API 가 있다. 사람 흉내가 아니라
// 정직하게 서비스 이름을 밝히되, 일반적인 브라우저 UA 형태를 갖춰 보낸다.
const UA = 'Mozilla/5.0 (compatible; NakchalSaju/1.0; +https://nakchalsaju.com)';

type Point = { lat: number; lng: number; matched: string; kind: 'ROAD' | 'PARCEL' };
type Out = { hit: Point | null; err: string | null };

async function lookup(address: string, kind: 'ROAD' | 'PARCEL', key: string): Promise<Out> {
  const qs = new URLSearchParams({
    service: 'address', request: 'getcoord', version: '2.0',
    crs: 'EPSG:4326', address, type: kind, format: 'json', key,
  });
  let err: string | null = null;
  for (const base of ENDPOINTS) {
    try {
      const r = await fetch(base + '?' + qs.toString(), {
        cache: 'no-store',
        headers: { accept: 'application/json', 'user-agent': UA, referer: 'https://nakchalsaju.com/' },
        signal: AbortSignal.timeout(6000),
      });
      if (!r.ok) { err = 'http_' + r.status; continue; }
      const text = await r.text();
      let j: any = null;
      try { j = JSON.parse(text); } catch { err = 'not_json:' + text.slice(0, 60); continue; }
      const res = j && j.response;
      if (!res) { err = 'no_response'; continue; }
      if (res.status !== 'OK') {
        // NOT_FOUND 는 정상적인 '못 찾음'이라 다음 엔드포인트로 넘길 필요가 없다.
        err = 'status_' + res.status + (res.error ? ':' + (res.error.text || '') : '');
        return { hit: null, err };
      }
      const p = res.result && res.result.point;
      const lat = Number(p && p.y), lng = Number(p && p.x);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) { err = 'no_point'; continue; }
      const matched = (res.refined && res.refined.text) || address;
      return { hit: { lat, lng, matched, kind }, err: null };
    } catch (e: any) {
      err = 'throw:' + (e && ((e.cause && e.cause.code) || e.name || e.message) || 'unknown');
    }
  }
  return { hit: null, err };
}

export async function GET(req: Request) {
  const key = process.env.VWORLD_KEY;
  if (!key) return NextResponse.json({ ok: false, reason: 'nokey' }, { status: 503 });

  const url = new URL(req.url);
  const address = (url.searchParams.get('address') || '').trim();
  const debug = url.searchParams.get('debug') === '1';
  if (!address || address.length > 120) {
    return NextResponse.json({ ok: false, reason: 'bad_address' }, { status: 400 });
  }

  // 도로명으로 먼저 찾고, 안 잡히면 지번으로 한 번 더 본다.
  // 대표님들이 '가장로 31' 같은 도로명과 '둔산동 1420' 같은 지번을 섞어 쓴다.
  const road = await lookup(address, 'ROAD', key);
  const hit = road.hit ? road : await lookup(address, 'PARCEL', key);

  if (!hit.hit) {
    return NextResponse.json(
      { ok: false, reason: 'not_found', ...(debug ? { detail: [road.err, hit.err] } : {}) },
      { status: 404 },
    );
  }
  const h = hit.hit;
  return NextResponse.json({ ok: true, lat: h.lat, lng: h.lng, matched: h.matched, kind: h.kind });
}

// 프로젝트 함수 리전을 icn1(서울)로 바꾼 뒤 재배포해야 위 preferredRegion 이 실제로 먹는다.
