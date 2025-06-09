import express from 'express';
import { register, login, getUserData } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getUserData);

export default router; 