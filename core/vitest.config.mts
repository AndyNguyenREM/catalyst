/* eslint-disable import/no-unresolved -- `vitest/config` is provided by Vitest; resolver does not always see it */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const coreDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^~\//, replacement: `${coreDir}/` },
      { find: /^@\/vibes\//, replacement: `${path.join(coreDir, 'vibes')}/` },
    ],
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/tests/ui/**'],
  },
});
