import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const empty = fileURLToPath(new URL('./test-stubs/empty.ts', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // 서버/클라 전용 가드는 테스트(node)에서 무력화 — RSC 밖 import 시 throw 방지
      'server-only': empty,
      'client-only': empty,
    },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts', 'middleware.ts'],
      exclude: ['lib/**/*.test.ts', 'lib/supabase/**', 'test-stubs/**'],
      reporter: ['text', 'text-summary'],
      // 회귀 방지 게이트 — 현재 라인/함수 ~92%, 분기 ~75%. 여유를 둔 보수적 하한.
      // 남은 미커버는 대부분 Supabase 라이브 DB 분기(자격증명 필요).
      thresholds: {
        statements: 88,
        lines: 88,
        functions: 88,
        branches: 70,
      },
    },
  },
});
