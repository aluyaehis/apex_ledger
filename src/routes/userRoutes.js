import express from 'express';
import { registerUser, loginUser} from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
const router = express.Router();

// register user

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken, (req, res) => {
    res.json({
        message: "welcome to your private profile",
        user: req.user
    });
});

export default router;