import express from 'express';
import { createSegment, getSegments, previewSegment } from '../controllers/segmentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getSegments).post(protect, createSegment);
router.post('/preview', protect, previewSegment);

export default router;
