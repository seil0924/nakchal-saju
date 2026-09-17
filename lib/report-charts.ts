// lib/report-charts.ts — 결과 리포트에 들어가는 그래프(SVG 문자열).
// 리포트 본문이 서버에서 HTML 문자열로 만들어지므로 그래프도 문자열로 만든다(라이브러리 없음).
// 색·글꼴은 ui.css 의 .rc-* 규칙이 덮어쓰고, 속성 값은 그 규칙이 없을 때의 기본값이다.
// 모든 값은 명식 계산에서 온다 — 그래프를 위해 숫자를 지어내지 않는다.

const f1 = (n: number) => Math.round(n * 10) / 10;
const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export type RadarSeries = { values: number[]; color: string; name?: string };

// 레이더(거미줄) — 축 5개(오행)나 6개(스코어카드). 두 계열을 겹치면 비교가 된다.
export function radarSvg(labels: string[], series: RadarSeries[], max: number, opt: { labelColors?: string[]; title?: string } = {}): string {
  const n = labels.length, W = 320, H = 268, cx = 160, cy = 132, R = 92;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = (r: number) => labels.map((_, i) => pt(i, r).map(f1).join(',')).join(' ');
  let g = '';
  for (let k = 1; k <= max; k++) g += `<polygon class="rc-grid" points="${ring((R * k) / max)}" fill="none" stroke="#e6e8ea" stroke-width="1"/>`;
  labels.forEach((_, i) => { const [x, y] = pt(i, R); g += `<line class="rc-grid" x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" stroke="#e6e8ea" stroke-width="1"/>`; });
  series.forEach((s, si) => {
    const pts = s.values.map((v, i) => pt(i, (R * Math.max(0, Math.min(max, v))) / max).map(f1).join(',')).join(' ');
    g += `<polygon points="${pts}" fill="${s.color}" fill-opacity="${si === 0 ? 0.18 : 0.12}" stroke="${s.color}" stroke-width="2"${si > 0 ? ' stroke-dasharray="5 4"' : ''} stroke-linejoin="round"/>`;
    s.values.forEach((v, i) => { const [x, y] = pt(i, (R * Math.max(0, Math.min(max, v))) / max); g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="3.2" fill="${s.color}"/>`; });
  });
  labels.forEach((l, i) => {
    const [x, y] = pt(i, R + 20);
    const anchor = Math.abs(x - cx) < 8 ? 'middle' : x > cx ? 'start' : 'end';
    const vals = series.map(s => s.values[i]).join(' : ');
    g += `<text class="rc-lab" x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" font-size="13" font-weight="700" fill="${opt.labelColors?.[i] || '#1e2124'}">${esc(l)}</text>`;
    g += `<text class="rc-val" x="${f1(x)}" y="${f1(y + 15)}" text-anchor="${anchor}" font-size="11.5" fill="#636d77">${esc(vals)}</text>`;
  });
  const legend = series.length > 1
    ? `<div class="rc-legend">${series.map((s, i) => `<span><i style="background:${s.color}${i > 0 ? ';opacity:.7' : ''}"></i>${esc(s.name || '')}</span>`).join('')}</div>`
    : '';
  return `<figure class="rchart rc-radar">${opt.title ? `<figcaption>${esc(opt.title)}</figcaption>` : ''}` +
    `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.title || '레이더 그래프')}">${g}</svg>${legend}</figure>`;
}

export type BarItem = { label: string; v: number; color: string; tag?: string; now?: boolean; dim?: boolean };

// 세로 막대 — 달별·해별 흐름. v 는 0~max, 위로 갈수록 밀어주는 흐름.
export function barsSvg(items: BarItem[], max: number, opt: { title?: string; top?: string; bottom?: string; unit?: string } = {}): string {
  const W = 320, H = 190, L = 8, Rr = 8, T = 30, B = 150;
  const slot = (W - L - Rr) / items.length, bw = Math.min(26, slot * 0.62);
  let g = '';
  [0.25, 0.5, 0.75, 1].forEach(k => { const y = f1(B - (B - T) * k); g += `<line class="rc-grid" x1="${L}" y1="${y}" x2="${W - Rr}" y2="${y}" stroke="#eef0f2" stroke-width="1"/>`; });
  g += `<line class="rc-axis" x1="${L}" y1="${B}" x2="${W - Rr}" y2="${B}" stroke="#cdd1d5" stroke-width="1"/>`;
  items.forEach((it, i) => {
    const x = L + slot * i + (slot - bw) / 2, h = Math.max(4, ((B - T) * Math.max(0, Math.min(max, it.v))) / max), y = B - h;
    const op = it.dim ? 0.3 : 1;
    if (it.now) g += `<rect class="rc-now" x="${f1(L + slot * i + 1)}" y="${T - 22}" width="${f1(slot - 2)}" height="${B - T + 44}" rx="6" fill="#eef3fe"/>`;
    g += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(bw)}" height="${f1(h)}" rx="4" fill="${it.color}" fill-opacity="${op}"/>`;
    if (it.tag) g += `<text class="rc-tag" x="${f1(x + bw / 2)}" y="${f1(y - 5)}" text-anchor="middle" font-size="${slot < 30 ? 9.5 : 11}" font-weight="700" fill="${it.color}" fill-opacity="${it.dim ? 0.5 : 1}">${esc(it.tag)}</text>`;
    g += `<text class="rc-lab" x="${f1(x + bw / 2)}" y="${B + 16}" text-anchor="middle" font-size="${slot < 30 ? 10.5 : 12}" font-weight="${it.now ? 800 : 600}" fill="${it.now ? '#2f56c4' : it.dim ? '#9aa1a8' : '#1e2124'}">${esc(it.label)}</text>`;
    if (it.now) g += `<text class="rc-nowt" x="${f1(x + bw / 2)}" y="${B + 30}" text-anchor="middle" font-size="10" font-weight="700" fill="#2f56c4">지금</text>`;
  });
  const side = opt.top || opt.bottom
    ? `<div class="rc-side">위로 높을수록 <b>${esc(opt.top || '')}</b> · 낮을수록 <b>${esc(opt.bottom || '')}</b></div>` : '';
  return `<figure class="rchart rc-bars">${opt.title ? `<figcaption>${esc(opt.title)}</figcaption>` : ''}` +
    `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.title || '막대 그래프')}">${g}</svg>${side}</figure>`;
}

export type LinePoint = { label: string; sub?: string; v: number; color: string; now?: boolean; dim?: boolean };

// 꺾은선 — 대운 여덟 구간처럼 긴 흐름. 점마다 오행 색.
export function lineSvg(points: LinePoint[], max: number, opt: { title?: string; top?: string; bottom?: string } = {}): string {
  const W = 320, H = 196, L = 16, Rr = 16, T = 30, B = 138;
  const step = (W - L - Rr) / Math.max(1, points.length - 1);
  const xy = points.map((p, i) => [L + step * i, B - ((B - T) * Math.max(0, Math.min(max, p.v))) / max]);
  let g = '';
  [0, 0.5, 1].forEach(k => { const y = f1(B - (B - T) * k); g += `<line class="rc-grid" x1="${L}" y1="${y}" x2="${W - Rr}" y2="${y}" stroke="#eef0f2" stroke-width="1"${k === 0.5 ? ' stroke-dasharray="3 4"' : ''}/>`; });
  const nowI = points.findIndex(p => p.now);
  if (nowI >= 0) g += `<rect class="rc-now" x="${f1(xy[nowI][0] - step / 2 + 2)}" y="${T - 20}" width="${f1(step - 4)}" height="${B - T + 58}" rx="6" fill="#eef3fe"/>`;
  const area = `M${f1(xy[0][0])},${B} ` + xy.map(([x, y]) => `L${f1(x)},${f1(y)}`).join(' ') + ` L${f1(xy[xy.length - 1][0])},${B} Z`;
  g += `<path d="${area}" fill="#3f6be0" fill-opacity=".08"/>`;
  g += `<polyline points="${xy.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ')}" fill="none" stroke="#3f6be0" stroke-width="2.2" stroke-linejoin="round"/>`;
  points.forEach((p, i) => {
    const [x, y] = xy[i];
    g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${p.now ? 6 : 4.5}" fill="${p.color}" fill-opacity="${p.dim ? 0.45 : 1}" stroke="#fff" stroke-width="2"/>`;
    g += `<text class="rc-lab" x="${f1(x)}" y="${B + 17}" text-anchor="middle" font-size="11" font-weight="${p.now ? 800 : 600}" fill="${p.now ? '#2f56c4' : p.dim ? '#9aa1a8' : '#1e2124'}">${esc(p.label)}</text>`;
    if (p.sub) g += `<text class="rc-val" x="${f1(x)}" y="${B + 31}" text-anchor="middle" font-size="10" fill="${p.now ? '#2f56c4' : '#8a939c'}">${esc(p.sub)}</text>`;
  });
  const side = opt.top || opt.bottom
    ? `<div class="rc-side">위로 높을수록 <b>${esc(opt.top || '')}</b> · 낮을수록 <b>${esc(opt.bottom || '')}</b></div>` : '';
  return `<figure class="rchart rc-line">${opt.title ? `<figcaption>${esc(opt.title)}</figcaption>` : ''}` +
    `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.title || '흐름 그래프')}">${g}</svg>${side}</figure>`;
}

// 점수 고리 — 궁합 점수(0~100)
export function ringSvg(score: number, color: string, size = 92): string {
  const r = 38, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, score));
  return `<svg class="rc-ring" viewBox="0 0 92 92" width="${size}" height="${size}" role="img" aria-label="${v}점">` +
    `<circle cx="46" cy="46" r="${r}" fill="none" stroke="#eef0f2" stroke-width="8"/>` +
    `<circle cx="46" cy="46" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${f1((c * v) / 100)} ${f1(c)}" transform="rotate(-90 46 46)"/>` +
    `<text x="46" y="53" text-anchor="middle" font-size="26" font-weight="800" fill="${color}">${v}</text></svg>`;
}
