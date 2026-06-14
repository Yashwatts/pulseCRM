import express from 'express';
import { deliveryWebhook } from '../controllers/webhookController';

const router = express.Router();

router.post('/delivery', deliveryWebhook);

export default router;
