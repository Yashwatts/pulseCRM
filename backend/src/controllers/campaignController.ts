import { Request, Response } from 'express';
import axios from 'axios';
import Campaign from '../models/Campaign';
import Segment from '../models/Segment';
import Customer from '../models/Customer';
import Communication from '../models/Communication';
import Analytics from '../models/Analytics';
import { generateCampaignMessage } from '../services/aiService';
import { buildMongoQueryFromFilters } from './segmentController';

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001/dispatch';

export const generateMessage = async (req: Request, res: Response) => {
  try {
    const { segmentId, goal, offer, tone, channel } = req.body;
    if (!segmentId || !goal || !offer || !tone || !channel) {
      res.status(400).json({ error: 'All fields (segmentId, goal, offer, tone, channel) are required' });
      return;
    }
    const segment = await Segment.findById(segmentId);
    if (!segment) {
      res.status(404).json({ error: 'Segment not found' });
      return;
    }
    const criteria = buildMongoQueryFromFilters(segment.rules);
    const aiResponse = await generateCampaignMessage(goal, offer, tone, channel, criteria);
    res.json(aiResponse); // returns { subject, message, cta, emojis }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const { name, segmentId, channel, subject, messageTemplate } = req.body;
    
    if (!name || !segmentId || !channel || !messageTemplate) {
      res.status(400).json({ error: 'Required fields are missing' });
      return;
    }

    const campaign = await Campaign.create({
      name,
      segmentId,
      channel,
      subject,
      messageTemplate,
      status: 'Draft',
    });

    // Initialize Analytics
    await Analytics.create({ campaignId: campaign._id });

    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find().populate('segmentId').sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const launchCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    if (campaign.status !== 'Draft') {
      res.status(400).json({ error: 'Only Draft campaigns can be launched' });
      return;
    }

    const segment = await Segment.findById(campaign.segmentId);
    if (!segment) {
      res.status(404).json({ error: 'Segment not found' });
      return;
    }

    // 1. Get all customers matching segment criteria
    const criteria = buildMongoQueryFromFilters(segment.rules);
    const customers = await Customer.find(criteria);
    
    if (customers.length === 0) {
      res.status(400).json({ error: 'Segment has no customers' });
      return;
    }

    // 2. Create Pending Communications
    const communications = await Promise.all(
      customers.map(customer => 
        Communication.create({
          campaignId: campaign._id,
          customerId: customer._id,
          status: 'Pending',
        })
      )
    );

    // 3. Update Campaign status
    campaign.status = 'Running';
    await campaign.save();

    // 4. Update Analytics totalSent
    await Analytics.findOneAndUpdate(
      { campaignId: campaign._id },
      { $set: { totalSent: communications.length } }
    );

    // 5. Dispatch to Channel Service
    try {
      await axios.post(CHANNEL_SERVICE_URL, {
        campaignId: campaign._id,
        communications: communications.map(c => ({
          _id: c._id,
          customerId: c.customerId,
          message: campaign.messageTemplate
        }))
      });
    } catch (err: any) {
      console.error('Failed to dispatch to Channel Service:', err.message);
      // Even if dispatch fails, we return 200 to client. 
      // In prod we would have a retry worker picking up Pending communications.
    }

    res.json({ message: 'Campaign launched successfully', count: communications.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
