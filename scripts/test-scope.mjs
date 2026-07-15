// 계정 격리(namespacing) 자동 테스트 — 실제 lib/scope·people·vault 모듈을 로드해 검증
import { build } from 'esbuild';
import { pathToFileURL } from 'url';
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const dir = mkdtempSync(join(tmpdir(), 'nk-'));
async function bundle(entry) {
  const out = join(dir, entry.replace(/[\/.]/g, '_') + '.mjs');
  await build({ entryPoints: [entry], bundle: true, format: 'esm', outfile: out, platform: 'neutral', logLevel: 'silent' });
  return out;
}

// 공유 localStorage 목(브라우저 1대 = 여러 계정 로그인 시나리오)
const store = new Map();
globalThis.window = {};
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
};

const peopleBundle = await bundle('lib/people.ts');
const vaultBundle = await bundle('lib/vault.ts');

// 계정 전환 = 전체 새로고침 → 모듈 새 인스턴스(캐시버스트), window.__NK_SCOPE__ 교체
async function asAccount(scope, fn) {
  globalThis.window.__NK_SCOPE__ = scope;
  const people = await import(pathToFileURL(peopleBundle).href + '?s=' + scope + '_' + Math.random());
  const vault = await import(pathToFileURL(vaultBundle).href + '?s=' + scope + '_' + Math.random());
  return fn({ people, vault });
}

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('  ✅', name); } else { fail++; console.log('  ❌', name); } };

console.log('\n[1] 레거시(전역) 데이터 이관 — 기존 유저 데이터 보존 + 전역 제거');
store.set('nakchal_people_v1', JSON.stringify([{ id: 'p1', kind: 'self', name: '오세일', date: '1993-09-24' }]));
await asAccount('userA', ({ people }) => {
  const list = people.loadPeople();
  ok('userA가 레거시 오세일을 넘겨받음', list.length === 1 && list[0].name === '오세일');
});
ok('전역 nakchal_people_v1 키 제거됨(다른 계정 노출 방지)', store.get('nakchal_people_v1') == null);
ok('userA 네임스페이스에 저장됨', store.get('nakchal_people_v1::userA') != null);
ok('이관 1회 플래그 설정됨', store.get('nakchal_scope_init') === '1');

console.log('\n[2] 계정 격리 — B는 A의 데이터를 보면 안 됨');
await asAccount('userB', ({ people }) => {
  ok('userB는 사람 목록이 비어있음', people.loadPeople().length === 0);
  people.savePerson({ kind: 'self', name: '김대표', date: '1980-01-01' });
  ok('userB가 자기 사람 저장', people.loadPeople().some(p => p.name === '김대표'));
});
await asAccount('userA', ({ people }) => {
  const list = people.loadPeople();
  ok('userA는 여전히 오세일만(김대표 안 보임)', list.length === 1 && list[0].name === '오세일');
});

console.log('\n[3] 게스트 격리 — 비로그인은 guest 버킷');
await asAccount(undefined, ({ people }) => {
  ok('게스트는 A/B 데이터 안 보임', people.loadPeople().length === 0);
  people.savePerson({ kind: 'client', name: '조달청', date: '2000-01-01' });
});
ok('guest 네임스페이스 키 생성', store.get('nakchal_people_v1::guest') != null);

console.log('\n[4] 보관함(vault)도 계정별 격리');
await asAccount('userA', ({ vault }) => { vault.recordReport({ id: 'r1', label: 'A리포트', when: Date.now(), unlocked: false }); });
await asAccount('userB', ({ vault }) => { ok('userB 보관함에 A리포트 없음', vault.listVault().length === 0); });
await asAccount('userA', ({ vault }) => { ok('userA 보관함에 A리포트 있음', vault.listVault().some(v => v.id === 'r1')); });

console.log('\n[5] 삭제도 계정 스코프 안에서만');
await asAccount('userB', ({ people }) => {
  const before = people.loadPeople().length;
  people.removePerson('nonexistent-of-A');
  ok('B가 존재않는 id 삭제해도 A영향 없음', people.loadPeople().length === before);
});

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);
