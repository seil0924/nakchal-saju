// 계정 격리(namespacing) 자동 테스트 — lib/scope·people·vault 를 tsc로 컴파일 후 실제 로드해 검증
import { execSync } from 'child_process';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const dir = mkdtempSync(join(tmpdir(), 'nkscope-'));
execSync(`node_modules/.bin/tsc lib/scope.ts lib/people.ts lib/vault.ts --outDir ${dir} --module commonjs --target es2020 --skipLibCheck --removeComments`, { stdio: 'inherit' });

const store = new Map();
global.window = {};
global.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
};
const P = f => join(dir, f);
function fresh(scope) {
  for (const f of ['scope.js', 'people.js', 'vault.js']) delete require.cache[require.resolve(P(f))];
  global.window.__NK_SCOPE__ = scope;
  return { people: require(P('people.js')), vault: require(P('vault.js')) };
}
let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n); } };

console.log('\n[1] 레거시(전역) 이관 + 전역키 제거');
store.set('nakchal_people_v1', JSON.stringify([{ id: 'p1', kind: 'self', name: '오세일', date: '1993-09-24' }]));
{ const { people } = fresh('userA'); const l = people.loadPeople(); ok('userA 레거시 승계', l.length === 1 && l[0].name === '오세일'); }
ok('전역 키 제거(타계정 노출 방지)', store.get('nakchal_people_v1') == null);
ok('userA 네임스페이스 저장', store.get('nakchal_people_v1::userA') != null);

console.log('\n[2] 계정 격리 — B는 A 못 봄');
{ const { people } = fresh('userB'); ok('userB 비어있음', people.loadPeople().length === 0); people.savePerson({ kind: 'self', name: '김대표', date: '1980-01-01' }); ok('userB 자기 저장', people.loadPeople().some(p => p.name === '김대표')); }
{ const { people } = fresh('userA'); const l = people.loadPeople(); ok('userA 오세일만', l.length === 1 && l[0].name === '오세일'); }

console.log('\n[3] 게스트 격리');
{ const { people } = fresh(undefined); ok('게스트 A/B 안 보임', people.loadPeople().length === 0); people.savePerson({ kind: 'client', name: '조달청', date: '2000-01-01' }); }
ok('guest 네임스페이스', store.get('nakchal_people_v1::guest') != null);

console.log('\n[4] 보관함 격리');
{ const { vault } = fresh('userA'); vault.recordReport({ id: 'r1', label: 'A리포트', when: Date.now(), unlocked: false }); }
{ const { vault } = fresh('userB'); ok('userB 보관함 A리포트 없음', vault.listVault().length === 0); }
{ const { vault } = fresh('userA'); ok('userA 보관함 A리포트 있음', vault.listVault().some(v => v.id === 'r1')); }

console.log('\n[5] 재로그인 복원');
{ const { people } = fresh('userA'); ok('A 재로그인 시 오세일 유지', people.loadPeople().some(p => p.name === '오세일')); }

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);
