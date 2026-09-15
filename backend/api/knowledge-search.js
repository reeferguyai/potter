import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';

export const knowledgeSearchRouter = Router();
const root = path.resolve(process.cwd(), '..');

knowledgeSearchRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    const index = JSON.parse(await fs.readFile(path.join(root, 'knowledge', 'knowledge-index.json'), 'utf8'));
    if (!q) return res.json({ query: '', results: index });
    const source = JSON.stringify(index).toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const matched = terms.every(term => source.includes(term));
    res.json({ query: q, results: matched ? index : [], retrieval: 'index-keyword' });
  } catch (error) { next(error); }
});
