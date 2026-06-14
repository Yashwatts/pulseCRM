import express from 'express';
import { getAnalytics, getAllAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getAllAnalytics);
router.get('/:campaignId', protect, getAnalytics);

export default router;
