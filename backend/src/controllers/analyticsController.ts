import { Request, Response } from 'express';
import Analytics from '../models/Analytics';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = await Analytics.findOne({ campaignId: req.params.campaignId });
    if (!analytics) {
      res.status(404).json({ error: 'Analytics not found' });
      return;
    }
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = await Analytics.find().populate('campaignId');
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
