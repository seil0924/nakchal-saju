import { describe, it, expect } from 'vitest';
import { compute } from '../engine';
import { bizVerdict, bizCheck } from '../biz-check';
import { TYCOONS, isKorean } from '../tycoon';
import fs from 'node:fs';
import path from 'node:path';

describe('bizVerdict', () => {
  it('근거 숫자는 십성 개수 그대로다', () => {
    for (const t of TYCOONS.slice(0, 30)) {
      const [y, m, d] = t.born.split('-').map(Number);
      const v = bizVerdict(compute(y, m, d, null));
      expect(['big', 'heavy', 'maker', 'office', 'solo', 'even']).toContain(v.key);
      expect(v.title).toBeTruthy();
      // 시주를 빼면 다섯 글자(일간 제외)를 센다
      expect(v.jae + v.sik + v.gwan + v.power).toBeLessThanOrEqual(6);
    }
  });
  it('재성이 둘 이상이고 버티는 힘도 둘 이상이면 big, 버티는 힘이 모자라면 heavy', () => {
    const all = TYCOONS.map(t => { const [y, m, d] = t.born.split('-').map(Number); return bizVerdict(compute(y, m, d, null)); });
    for (const v of all) {
      if (v.jae >= 2) expect(v.key).toBe(v.power >= 2 ? 'big' : 'heavy');
    }
  });
});

describe('bizCheck', () => {
  it('6대 축 합계가 30점 안이고, 위 두 축과 나머지 수가 맞다', () => {
    const r = bizCheck(compute(1971, 7, 16, null));
    expect(r.total).toBeGreaterThanOrEqual(0);
    expect(r.total).toBeLessThanOrEqual(30);
    expect(r.top.length).toBe(2);
    expect(r.top[0].score).toBeGreaterThanOrEqual(r.top[1].score);
    expect(r.hidden).toBe(4);
  });
});

describe('국내 창업주', () => {
  it('11명이고 모두 맨 뒤에 붙어 있다(앞에 넣으면 기존 리포트의 닮은 거장이 바뀐다)', () => {
    const kr = TYCOONS.filter(isKorean);
    expect(kr.length).toBe(11);
    expect(TYCOONS.slice(-11).every(isKorean)).toBe(true);
  });
  it('천문연구원 만세력과 일진이 맞다', () => {
    const KASI: Record<string, string> = { 정주영: '경신', 이병철: '무신', 이건희: '임술', 구인회: '무신', 구자경: '무인', 구본무: '경술', 조중훈: '정해', 정세영: '무인', 최종건: '무술', 최종현: '경오', 유일한: '임술' };
    const G = '갑을병정무기경신임계', Z = '자축인묘진사오미신유술해';
    for (const t of TYCOONS.filter(isKorean)) {
      const [y, m, d] = t.born.split('-').map(Number);
      const c = compute(y, m, d, null);
      expect(G[c.dGan] + Z[c.dZhi], t.name).toBe(KASI[t.name]);
    }
  });
});

// 화면 문구에 박힌 'N인'이 실제 거장 수와 어긋나지 않게 한다.
describe('거장 수 문구', () => {
  it('app·lib 안의 "거장 N인"이 모두 TYCOONS.length 와 같다', () => {
    const root = path.resolve(__dirname, '../..');
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) { if (f.name !== '__tests__' && f.name !== 'node_modules') walk(p); }
        else if (/\.(ts|tsx)$/.test(f.name)) {
          for (const m of fs.readFileSync(p, 'utf8').matchAll(/거장 (\d+)인/g)) if (Number(m[1]) !== TYCOONS.length) hits.push(`${path.relative(root, p)}: ${m[0]}`);
        }
      }
    };
    walk(path.join(root, 'app')); walk(path.join(root, 'lib'));
    expect(hits).toEqual([]);
  });
});
