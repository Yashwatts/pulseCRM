import express from 'express';
import { getOrders, createOrder } from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getOrders).post(protect, createOrder);

export default router;
