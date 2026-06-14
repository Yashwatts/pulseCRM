import { Request, Response } from 'express';
import { chatWithAssistant } from '../services/aiService';
import Customer from '../models/Customer';
import Campaign from '../models/Campaign';

export const chat = async (req: Request, res: Response) => {
  try {
    const { history } = req.body;

    if (!history || !Array.isArray(history)) {
      res.status(400).json({ error: 'Valid chat history array is required' });
      return;
    }

    // Build the Context Snapshot
    // 1. Total Customers
    const totalCustomers = await Customer.countDocuments();
    
    // 2. Total Revenue (sum of totalSpent across all customers)
    const revenueResult = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSpent' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // 3. Active Campaigns
    const activeCampaigns = await Campaign.countDocuments({ status: 'Running' });

    const context = {
      totalCustomers,
      totalRevenue,
      activeCampaigns
    };

    // Forward to AI Service
    const aiResponse = await chatWithAssistant(history, context);

    res.json({ response: aiResponse });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
