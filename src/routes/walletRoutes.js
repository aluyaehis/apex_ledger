import express from 'express';
import { getBalance, depositMoney, getTransactionHistory, transferMoney } from '../controllers/walletController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only logged in users can check balance
router.get('/balance', verifyToken, getBalance);
router.post('/deposit', verifyToken, depositMoney);
router.get('/history', verifyToken, getTransactionHistory);
router.post('/transfer', verifyToken, transferMoney);

export default router;