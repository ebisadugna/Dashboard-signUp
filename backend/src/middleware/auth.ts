import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided or invalid token format');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('Authentication token missing');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    console.log('Decoded token:', decoded);

    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error('User not found');
    }

    // Add user and token to request
    req.user = user;
    req.token = token;

    console.log('Authentication successful for user:', user._id);
    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Please authenticate' });
  }
}; 