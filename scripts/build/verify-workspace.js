import { access } from 'node:fs/promises';

const required = ['apps/web/index.html', 'apps/admin/src/App.tsx', 'server/index.ts', 'workers', 'shared', 'db/README.md'];
await Promise.all(required.map((path) => access(path)));
console.log(`Workspace verified (${required.length} required paths).`);
