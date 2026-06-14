import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || 'http://localhost:5000/api/webhooks/delivery';

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'channel-service' });
});

// Endpoint called by CRM to dispatch communications
app.post('/dispatch', (req, res) => {
  const { campaignId, communications } = req.body;
  
  if (!communications || !Array.isArray(communications)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // Acknowledge receipt immediately to unblock CRM
  res.status(202).json({ status: 'accepted', count: communications.length });

  // Process asynchronously
  processBatch(campaignId, communications);
});

const generateSimulatedStatus = (): string => {
  const rand = Math.random() * 100;
  // Funnel Simulation:
  // 10% Failed
  // 20% Delivered (did not open)
  // 30% Opened / Read
  // 25% Clicked
  // 15% Converted
  if (rand < 10) return 'Failed';
  if (rand < 30) return 'Delivered';
  if (rand < 60) return 'Opened';
  if (rand < 85) return 'Clicked';
  return 'Converted';
};

const sendWebhookWithRetry = async (payload: any, maxRetries = 3, currentAttempt = 1) => {
  try {
    await axios.post(CRM_WEBHOOK_URL, payload, { timeout: 5000 });
    console.log(`[Webhook SUCCESS] Comm ID: ${payload.communicationId} | Status: ${payload.status}`);
  } catch (error: any) {
    if (currentAttempt <= maxRetries) {
      const backoffMs = Math.pow(2, currentAttempt) * 1000;
      console.warn(`[Webhook FAILED] Comm ID: ${payload.communicationId} | Attempt ${currentAttempt}/${maxRetries} failed. Retrying in ${backoffMs}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      await sendWebhookWithRetry(payload, maxRetries, currentAttempt + 1);
    } else {
      console.error(`[Webhook FATAL] Comm ID: ${payload.communicationId} | Gave up after ${maxRetries} retries.`);
    }
  }
};

async function processBatch(campaignId: string, communications: any[]) {
  console.log(`\n--- Starting Dispatch for Campaign: ${campaignId} (${communications.length} messages) ---`);

  // We process them all concurrently, but each has its own independent random delay
  const promises = communications.map(async (comm) => {
    // 1. Simulate network latency/processing delay (2s to 5s)
    const delay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 2. Simulate delivery outcome
    const status = generateSimulatedStatus();

    // 3. Callback to CRM via webhook with Exponential Backoff
    const payload = {
      communicationId: comm._id,
      campaignId,
      status,
      timestamp: new Date().toISOString()
    };

    await sendWebhookWithRetry(payload);
  });

  await Promise.all(promises);
  console.log(`--- Finished Dispatch for Campaign: ${campaignId} ---\n`);
}

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`📡 Channel Service Simulator Running`);
  console.log(`========================================`);
  console.log(`Port: ${PORT}`);
  console.log(`Target CRM Webhook: ${CRM_WEBHOOK_URL}`);
  console.log(`Status: Waiting for dispatch payloads...`);
});
