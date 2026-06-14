import { Request, Response } from 'express';
import Communication from '../models/Communication';
import Analytics from '../models/Analytics';
import Campaign from '../models/Campaign';

export const deliveryWebhook = async (req: Request, res: Response) => {
  try {
    const { communicationId, campaignId, status, timestamp } = req.body;

    if (!communicationId || !campaignId || !status) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // 1. Find communication
    const communication = await Communication.findById(communicationId);
    if (!communication) {
      res.status(404).json({ error: 'Communication not found' });
      return;
    }

    // Idempotency check: if already processed with THIS status, return 200 immediately
    if (communication.status === status) {
      res.status(200).json({ message: 'Already processed' });
      return;
    }

    // 2. Update Communication Status
    communication.status = status;
    communication.resolvedAt = new Date(timestamp || Date.now());
    await communication.save();

    // 3. Update Analytics Aggregates atomically
    let incrementField = '';
    switch (status) {
      case 'Delivered':
      case 'Sent':
        incrementField = 'successfulDeliveries';
        break;
      case 'Failed':
        incrementField = 'failedDeliveries';
        break;
      case 'Opened':
      case 'Read':
        incrementField = 'opened';
        break;
      case 'Clicked':
        incrementField = 'clicked';
        break;
      case 'Converted':
        incrementField = 'converted';
        break;
      default:
        incrementField = 'successfulDeliveries'; // fallback
    }
    
    await Analytics.findOneAndUpdate(
      { campaignId },
      { $inc: { [incrementField]: 1 } }
    );

    // 4. Check if campaign is completed
    const pendingCount = await Communication.countDocuments({ campaignId, status: 'Pending' });
    if (pendingCount === 0) {
      await Campaign.findByIdAndUpdate(campaignId, { status: 'Completed' });
      // Here we could trigger another AI generation to summarize the final analytics.
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
};
