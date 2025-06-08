import express from 'express';
import { googleSignIn, validateToken, login, register } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
const router = express.Router();
// Google OAuth routes
router.post('/google', googleSignIn);
// Email/Password routes
router.post('/register', register);
router.post('/login', login);
// Token validation
router.get('/validate', authenticateToken, validateToken);
export default router;
