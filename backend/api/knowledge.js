import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';

export const knowledgeRouter = Router();
const root = path.resolve(process.cwd(), '..');

knowledgeRouter.get('/', async (_req, res, next) => {
  try {
    const file = path.join(root, 'knowledge', 'knowledge-index.json');
    const data = JSON.parse(await fs.readFile(file, 'utf8'));
    res.json(data);
  } catch (error) { next(error); }
});
