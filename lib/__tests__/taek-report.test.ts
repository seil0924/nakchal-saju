import { describe, it, expect } from 'vitest';
import { hourFor, taekSection } from '@/lib/taek-report';

const DAY = new Date(2026, 7, 24);   // 2026-08-24

describe('시진', () => {
  it('일지와 육합을 이루는 시진을 고른다', () => {
    // 子丑 · 寅亥 · 卯戌 · 辰酉 · 巳申 · 午未
    expect(hourFor(0).name).toBe('축시');
    expect(hourFor(1).name).toBe('자시');
    expect(hourFor(2).name).toBe('해시');
    expect(hourFor(11).name).toBe('인시');
    expect(hourFor(6).name).toBe('미시');
    expect(hourFor(7).name).toBe('오시');
  });

  it('짝은 서로를 가리킨다', () => {
    for (let i = 0; i < 12; i++) expect(hourFor(hourFor(i).idx).idx).toBe(i);
  });

  it('밤 시진이면 표시해 둔다', () => {
    expect(hourFor(0).night).toBe(true);      // 축시 01~03
    expect(hourFor(6).night).toBe(false);     // 미시 13~15
    expect(hourFor(7).night).toBe(false);     // 오시 11~13
  });

  it('열두 지지 모두 시각 범위가 붙는다', () => {
    for (let i = 0; i < 12; i++) {
      const h = hourFor(i);
      expect(h.span).toMatch(/^\d{2}:\d{2}~\d{2}:\d{2}$/);
      expect(h.idx).toBeGreaterThanOrEqual(0);
      expect(h.idx).toBeLessThan(12);
    }
  });

  it('범위를 벗어난 지지도 한 바퀴 돌려 받는다', () => {
    expect(hourFor(12).idx).toBe(hourFor(0).idx);
    expect(hourFor(-1).idx).toBe(hourFor(11).idx);
  });
});

describe('자리 사주 본문', () => {
  it('입력이 하나도 없어도 본문을 낸다', () => {
    const s = taekSection({}, 0, 0, 2026, DAY);
    expect(s.t).toContain('자리 사주');
    expect(s.html.length).toBeGreaterThan(400);
    expect(s.teaser.length).toBeGreaterThan(10);
    expect(s.html).toContain('주소를 아직 넣지 않으셨습니다');
  });

  it('문과 자리를 넣으면 팔택 판정이 들어간다', () => {
    const s = taekSection({ door: 0, desk: 6 }, 0, 0, 2026, DAY);
    expect(s.html).toContain('사택');
    expect(s.teaser).toContain('사택');
  });

  it('문과 자리가 일직선이면 그 사실을 짚는다', () => {
    const s = taekSection({ door: 0, desk: 4 }, 0, 0, 2026, DAY);
    expect(s.html).toContain('일직선');
  });

  it('배치가 무난하면 그대로 두라고 말한다', () => {
    const s = taekSection({ door: 0, desk: 2 }, 0, 0, 2026, DAY);
    expect(s.html).toContain('지금 자리를 지키는 편');
  });

  it('흉방으로 가면 풀리는 해까지 알려준다', () => {
    // 2026년 삼살방은 북(0도)
    const s = taekSection({ deg: 0, km: 130 }, 0, 0, 2026, DAY);
    expect(s.html).toContain('삼살방');
    expect(s.html).toContain('2027년');
    expect(s.html).toContain('못 간다는 뜻이 아니라');
  });

  it('체질에 맞는 방면이면 결이 맞는다고 쓴다', () => {
    // 木이 얇으면 동쪽(90도)이 길방. 2026년 대장군방은 동이라 서로 부딪히니
    // 그때는 흉방 문구가 이긴다 — 여기서는 火(1)가 얇은 경우로 남쪽을 본다.
    const s = taekSection({ deg: 180, km: 50 }, 1, 0, 2026, DAY);
    expect(s.html).toContain('결이 맞는 이전');
  });

  it('길방도 흉방도 아니면 미룰 이유가 없다고 쓴다', () => {
    const s = taekSection({ deg: 225, km: 20 }, 1, 0, 2026, DAY);
    expect(s.html).toContain('미룰 이유는 없는 자리');
  });

  it('택일이 여러 날 들어가고 성·정·만·개만 나온다', () => {
    const s = taekSection({ deg: 90 }, 0, 0, 2026, DAY);
    const rows = s.html.match(/ssrow/g) || [];
    expect(rows.length).toBeGreaterThan(10);
    for (const k of ['滿', '定', '成', '開']) expect(s.html).toContain(k);
  });

  it('시진을 함께 짚는다', () => {
    const s = taekSection({}, 0, 6, 2026, DAY);
    expect(s.html).toContain('미시');
  });

  it('밤 시진이면 낮에 마치라고 덧붙인다', () => {
    const s = taekSection({}, 0, 0, 2026, DAY);
    expect(s.html).toContain('오후 세 시 전');
  });

  it('대표님이 적은 주소를 그대로 HTML 에 넣지 않는다', () => {
    const s = taekSection({ deg: 90, km: 10, from: '<script>x</script>', to: '대전' }, 0, 0, 2026, DAY);
    expect(s.html).not.toContain('<script>');
    expect(s.html).toContain('&lt;script&gt;');
  });

  it('오행 번호가 범위를 벗어나도 버티고 낸다', () => {
    for (const e of [-3, 5, 9]) {
      const s = taekSection({ deg: 45 }, e, 3, 2026, DAY);
      expect(s.html.length).toBeGreaterThan(400);
    }
  });

  it('올해 조심하라 본 방면을 끝에 정리해 준다', () => {
    const s = taekSection({ deg: 90 }, 0, 0, 2026, DAY);
    expect(s.html).toContain('대장군방');
    expect(s.html).toContain('삼살방');
  });

  it('본문에 닫히지 않은 태그가 남지 않는다', () => {
    const s = taekSection({ deg: 90, km: 5, door: 1, desk: 5 }, 2, 4, 2026, DAY);
    const open = (s.html.match(/<p[ >]/g) || []).length;
    const close = (s.html.match(/<\/p>/g) || []).length;
    expect(open).toBe(close);
    const dOpen = (s.html.match(/<div /g) || []).length;
    const dClose = (s.html.match(/<\/div>/g) || []).length;
    expect(dOpen).toBe(dClose);
  });
});
