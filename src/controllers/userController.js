import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

export const registerUser = async (req, res) => {
    const { full_name, email, password } = req.body;
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

        const [result] = await pool.query('INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)', [full_name, email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully", userId: result.insertId });
    }catch(err){
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};