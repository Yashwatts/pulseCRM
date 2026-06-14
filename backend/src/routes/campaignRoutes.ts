import express from 'express';
import { createCampaign, getCampaigns, launchCampaign, generateMessage } from '../controllers/campaignController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getCampaigns).post(protect, createCampaign);
router.post('/generate-message', protect, generateMessage);
router.post('/:id/launch', protect, launchCampaign);

export default router;
