import pool from "../config/db.js";

export const getBalance = async (req, res) => {
    try{
        const [wallets] = await pool.query('SELECT balance, currency FROM wallets WHERE user_id = ?', [req.user.id]);
        if(wallets.length === 0){
            return res.status(404).json({ message: "Wallet not found" });
        }
        res.json(wallets[0]);
    }catch(err){
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};