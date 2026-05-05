import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try{
        
        //verifying if user already exists

        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if(existingUser.length > 0){
            return res.status(400).json({ message: "User already exists" });
        }

        //hashing the password
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //inserting in the db

        const [result] = await pool.query('INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        const userId = result.insertId;

        await pool.query('INSERT INTO wallets (user_id, balance, currency) VALUES (?, ?, ?)', [userId, 0.00, 'NGN']);

        res.status(201).json({ message: "User and wallet created successfully", userId: result.insertId });
    } catch (err) {
    // 1. THIS IS THE MOST IMPORTANT LINE:
    console.error("CRITICAL REGISTRATION ERROR:", err); 
    
    // 2. Return the exact error to the frontend so we can see it in Inspect -> Network
    res.status(500).json({ 
        message: "Server Error", 
        error: err.message,
        detail: err.code // This will give us codes like 'ER_NO_SUCH_TABLE'
    });
};
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try{
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if(!user){
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: "Login Successful",
            token,
            user: { id: user.id, name: user.full_name, email: user.email }
        })
    }catch(err){
        res.status(500).json({ message: "Server Error", error: err.message })
    }
};

export const setTransactionPin = async (req, res) => {
    const { pin } = req.body;
    const userId = req.user.id;

    // Validate PIN is 4 digits
    if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({ message: "PIN must be exactly 4 digits" });
    }

    try {
        // Hash the PIN before saving
        const hashedPin = await bcrypt.hash(pin, 10);
        
        await pool.query(
            'UPDATE users SET transaction_pin = ? WHERE id = ?', 
            [hashedPin, userId]
        );

        res.json({ message: "Transaction PIN set successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error setting PIN", error: err.message });
    }
};