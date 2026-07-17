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
    },
  },
});
