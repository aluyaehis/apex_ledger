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

export const depositMoney = async (req, res) => {
    const { amount } = req.body;
    //validate amoutn

    if(!amount || amount <= 0){
        return res.status(400).json({ message: "Invalid amount, It must be greater than 0." });
    }
    try{
        const [result] = await pool.query('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [amount, req.user.id]);

        if(result.affectedRows === 0){
            return res.status(404).json({ message: "Wallet not found" })
        }

        const [updatedWallet] = await pool.query('SELECT balance FROM wallets WHERE user_id = ?', [req.user.id]);

        res.json({ message: "Deposit successful", new_balance: updatedWallet[0].balance });
    }catch(err){
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};