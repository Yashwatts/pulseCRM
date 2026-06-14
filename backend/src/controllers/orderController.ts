import { Request, Response } from 'express';
import Order from '../models/Order';
import Customer from '../models/Customer';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().populate('customerId').sort({ orderDate: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, amount } = req.body;
    
    if (!customerId || !amount) {
      res.status(400).json({ error: 'customerId and amount are required' });
      return;
    }

    const order = await Order.create(req.body);

    // Update customer totalSpent and lastOrderDate
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.totalSpent += amount;
      customer.lastOrderDate = order.orderDate;
      // Here we could trigger an AI tag update process if needed
      await customer.save();
    }

    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
