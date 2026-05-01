import express from 'express';
import { getBalance } from '../controllers/walletController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only logged in users can check balance
router.get('/balance', verifyToken, getBalance);

export default router;