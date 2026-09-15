import { Router } from 'express';

export const commerceRouter = Router();

commerceRouter.get('/status', (_req, res) => res.json({
  model: 'Ghost Commerce',
  pipeline: ['supplier-validation','catalog-ingestion','normalization','catalog','cart','checkout','payment','order','fulfillment','delivery','tracking'],
  inventory: 'no-inventory-first'
}));
