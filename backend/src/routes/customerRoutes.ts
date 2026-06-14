import express from 'express';
import { getCustomers, getCustomerById, createCustomer } from '../controllers/customerController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getCustomers).post(protect, createCustomer);
router.route('/:id').get(protect, getCustomerById);

export default router;
