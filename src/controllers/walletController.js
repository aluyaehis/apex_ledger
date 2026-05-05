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

export const transferMoney = async (req, res) => {
    // 1. This line extracts BOTH possibilities. 
    // If one is missing, it takes the other.
    const { recipientEmail, recipient_email, amount, description } = req.body;
    
    // 2. Assign whichever one was provided to a single variable
    const targetEmail = recipientEmail || recipient_email;
    
    const sender_id = req.user.id;

    if(!amount || amount <= 0){
        return res.status(400).json({ message: "Invalid amount" });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 3. Use 'targetEmail' for your database query
        const [recipientRows] = await connection.query(
            'SELECT id FROM users WHERE email = ?', 
            [targetEmail]
        );
        
        if(recipientRows.length === 0){ 
            await connection.rollback();
            return res.status(404).json({ message: `Recipient (${targetEmail}) not found` });
        }

        const recipient_id = recipientRows[0].id;

        if(sender_id === recipient_id){
            await connection.rollback();
            return res.status(400).json({ message: "You cannot transfer money to yourself." });
        }

        const [senderWallet] = await connection.query(
            'SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE', 
            [sender_id]
        );
        
        if(senderWallet[0].balance < amount){
            await connection.rollback();
            return res.status(400).json({ message: "Insufficient funds" });
        }

        await connection.query('UPDATE wallets SET balance = balance - ? WHERE user_id = ?', [amount, sender_id]);
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [amount, recipient_id]);

        // 4. Use 'targetEmail' in the transaction log
        await connection.query(
            'INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)', 
            [sender_id, -amount, 'transfer', `Transfer to ${targetEmail}: ${description || ''}`]
        );

        await connection.commit();
        res.status(200).json({ message: "Transfer successful", amount_sent: amount});
    } catch(err) {
        await connection.rollback();
        console.error("Transfer Error:", err.message);
        res.status(500).json({ message: "Transfer failed", error: err.message });
    } finally {
        connection.release();
    }
};