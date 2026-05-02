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
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
    }


    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
            [amount, req.user.id]
        );

        await connection.query(
            'INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
            [req.user.id, amount, 'deposit', description || 'Wallet Deposit']
        );

        const [updatedWallet] = await connection.query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [req.user.id]
        );

        await connection.commit(); // save
        
        res.json({
            message: "Deposit successful",
            new_balance: updatedWallet[0].balance
        });

    } catch (error) {
        await connection.rollback(); // if there is an error, rollback
        res.status(500).json({ message: "Transaction failed", error: error.message });
    } finally {
        connection.release(); //release
    }
};

export const getTransactionHistory = async (req, res) => {
    try{
        const [rows] = await pool.query('SELECT * from transactions WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    }catch(err){
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};