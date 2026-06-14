import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, password } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'Valid name is required' });
    return;
  }
  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long' });
    return;
  }
  
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  
  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }
  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Password is required' });
    return;
  }
  
  next();
};
