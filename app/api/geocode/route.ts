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

const ENDPOINT = 'https://api.vworld.kr/req/address';

type Point = { lat: number; lng: number; matched: string; kind: 'ROAD' | 'PARCEL' };

async function lookup(address: string, kind: 'ROAD' | 'PARCEL', key: string): Promise<Point | null> {
  const qs = new URLSearchParams({
    service: 'address', request: 'getcoord', version: '2.0',
    crs: 'EPSG:4326', address, type: kind, format: 'json', key,
  });
  const r = await fetch(ENDPOINT + '?' + qs.toString(), { cache: 'no-store' });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  const res = j && j.response;
  if (!res || res.status !== 'OK') return null;
  const p = res.result && res.result.point;
  const lat = Number(p && p.y), lng = Number(p && p.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const matched = (res.refined && res.refined.text) || address;
  return { lat, lng, matched, kind };
}

export async function GET(req: Request) {
  const key = process.env.VWORLD_KEY;
  if (!key) return NextResponse.json({ ok: false, reason: 'nokey' }, { status: 503 });

  const address = (new URL(req.url).searchParams.get('address') || '').trim();
  if (!address || address.length > 120) {
    return NextResponse.json({ ok: false, reason: 'bad_address' }, { status: 400 });
  }

  try {
    // 도로명으로 먼저 찾고, 안 잡히면 지번으로 한 번 더 본다.
    // 대표님들이 '가장로 31' 같은 도로명과 '둔산동 1420' 같은 지번을 섞어 쓴다.
    const road = await lookup(address, 'ROAD', key);
    const hit = road || (await lookup(address, 'PARCEL', key));
    if (!hit) return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, lat: hit.lat, lng: hit.lng, matched: hit.matched, kind: hit.kind });
  } catch {
    return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502 });
  }
}
