import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoute from './routes/auth.js';
import problemsRoute from './routes/problems.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/problems', problemsRoute);

const PORT = process.env.PORT || 5000;

// Database Connection & Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    // ONLY start server if DB connects
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB', err);
  });
