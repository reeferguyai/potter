import { Router } from 'express';
import { askGuru } from '../services/guru.js';

export const guruRouter = Router();

guruRouter.post('/chat', async (req, res, next) => {
  try {
    const { message, previousResponseId } = req.body || {};
    if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message_required' });
    const result = await askGuru(message.slice(0, 12000), previousResponseId);
    res.json(result);
  } catch (error) { next(error); }
});
