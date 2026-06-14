import { Request, Response, NextFunction } from 'express';

export const validateCustomerCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email } = req.body;
  
  if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
    res.status(400).json({ error: 'Valid first name is required' });
    return;
  }
  if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
    res.status(400).json({ error: 'Valid last name is required' });
    return;
  }
  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }
  
  next();
};
