import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';

import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import segmentRoutes from './routes/segmentRoutes';
import campaignRoutes from './routes/campaignRoutes';
import webhookRoutes from './routes/webhookRoutes';
import orderRoutes from './routes/orderRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import assistantRoutes from './routes/assistantRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assistant', assistantRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'crm-backend' });
});

app.listen(PORT, async () => {
  console.log(`CRM Backend running on port ${PORT}`);
  await connectDB();
});
