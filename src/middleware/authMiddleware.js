import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // 1. Get the header (try both uppercase and lowercase)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    // Log it to your terminal so you can see exactly what Postman is sending
    console.log('Auth Header received:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    // 2. Extract the token
    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or Expired Token' });
    }
};