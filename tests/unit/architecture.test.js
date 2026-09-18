import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

const requiredPaths = [
  'apps/web/src/app/router.tsx',
  'apps/admin/src/App.tsx',
  'server/index.ts',
  'workers/ai',
  'shared/contracts',
  'db/migrations',
  'docs/architecture',
  'infrastructure/docker',
];

test('repository architecture boundaries exist', () => {
  for (const path of requiredPaths) assert.ok(existsSync(path), `missing ${path}`);
});

test('root workspace manifest is valid JSON', () => {
  const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.deepEqual(manifest.workspaces, ['apps/*', 'packages/*']);
});
