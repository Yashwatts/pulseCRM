import { Request, Response } from 'express';
import Customer from '../models/Customer';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
