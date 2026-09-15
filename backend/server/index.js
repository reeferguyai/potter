import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { guruRouter } from '../api/guru.js';
import { knowledgeRouter } from '../api/knowledge.js';
import { knowledgeSearchRouter } from '../api/knowledge-search.js';
import { commerceRouter } from '../api/commerce.js';
import { marketRouter } from '../api/market.js';

const app = express();
const port = Number(process.env.PORT || 8787);

app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'potgrowhub-api', version: '1.1.0', databaseConfigured: Boolean(process.env.DATABASE_URL) }));
app.get('/api', (_req, res) => res.json({ name: 'PotGrowHub API', capabilities: ['guru','knowledge','commerce','market'] }));
app.use('/api/guru', guruRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/knowledge', knowledgeSearchRouter);
app.use('/api/commerce', commerceRouter);
app.use('/api/market', marketRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_server_error' });
});

app.listen(port, () => console.log(`PotGrowHub API listening on :${port}`));
