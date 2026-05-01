import express from 'express';
import dotenv from 'dotenv';
import pool from './src/config/db.js';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(express.json())

app.use(express.json());

app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Apex Ledger API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});