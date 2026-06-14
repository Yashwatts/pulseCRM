import express from 'express';
import { chat } from '../controllers/assistantController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/chat', protect, chat);

export default router;
