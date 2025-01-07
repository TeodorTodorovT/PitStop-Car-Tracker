import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(json());

// MongoDB Connection
connect(process.env.MONGO_URI, {})
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', userRoutes);

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
