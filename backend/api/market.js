import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
export const marketRouter = Router();
const root = path.resolve(process.cwd(), '..');
marketRouter.get('/catalog', async (_req, res, next) => {
  try {
    const file = path.join(root, 'data', 'market-index.json');
    const products = JSON.parse(await fs.readFile(file, 'utf8'));
    res.json({ model: 'Marketplace', inventory: 'no-inventory-first', products });
  } catch (error) { next(error); }
});
