// lib/seal.ts — 사주 인장(印章) 생성기 (클라이언트·서버 공용, 순수 함수)
// 오행 분포 + 일간(천간)으로 낙관 문양 SVG를 만든다. 얼굴을 쓰지 않아 초상권 문제 없음.
const SEAL_EL_HEX = ['#2e8b57', '#b5402f', '#b58a2f', '#6b7280', '#2e5aa8']; // 木火土金水
const GAN_COLOR: Record<string, string> = {
  '甲': '#2e8b57', '乙': '#2e8b57', '丙': '#b5402f', '丁': '#b5402f', '戊': '#b58a2f',
  '己': '#b58a2f', '庚': '#6b7280', '辛': '#6b7280', '壬': '#2e5aa8', '癸': '#2e5aa8',
};
const GAN_EL_KO: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

// dist: [木,火,土,金,水] · centerChar: 일간 천간(甲乙…) 또는 오행자(木火…) · size: px
export function sealSvg(dist: number[], centerChar: string, size = 150): string {
  const S = size, c = S / 2, R = S * 0.34, W = S * 0.093, C = 2 * Math.PI * R;
  const tot = (dist || []).reduce((a, b) => a + b, 0) || 1;
  const gap = C * 0.018;
  let off = 0, ring = '';
  for (let i = 0; i < 5; i++) {
    if (!dist || dist[i] <= 0) continue;
    const seg = Math.max(0, (dist[i] / tot) * C - gap);
    ring += `<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="${SEAL_EL_HEX[i]}" stroke-width="${W}" stroke-dasharray="${seg} ${C - seg}" stroke-dashoffset="${-off}" transform="rotate(-90 ${c} ${c})"/>`;
    off += (dist[i] / tot) * C;
  }
  const gc = GAN_COLOR[centerChar] || '#c9a24a';
  return `<svg class="seal" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">`
    + `<circle cx="${c}" cy="${c}" r="${S * 0.47}" fill="#f7edd6"/>`
    + `<circle cx="${c}" cy="${c}" r="${S * 0.455}" fill="none" stroke="#b23a2b" stroke-width="${S * 0.028}" opacity=".92"/>`
    + `<circle cx="${c}" cy="${c}" r="${S * 0.412}" fill="none" stroke="#b23a2b" stroke-width="${S * 0.008}" opacity=".55"/>`
    + ring
    + `<circle cx="${c}" cy="${c}" r="${R - W * 0.62}" fill="#241a12"/>`
    + `<circle cx="${c}" cy="${c}" r="${R - W * 0.62}" fill="none" stroke="${gc}" stroke-width="1.2" opacity=".6"/>`
    + `<text x="${c}" y="${c}" text-anchor="middle" dominant-baseline="central" font-family="'Noto Serif KR',serif" font-weight="900" font-size="${S * 0.30}" fill="${gc}">${centerChar}</text>`
    + `</svg>`;
}
export const ganEl = (g: string) => GAN_EL_KO[g] || '';
