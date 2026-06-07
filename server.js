import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoute from './routes/authRoutes.js';
import problemsRoute from './routes/problemsRoutes.js';
import tagRoute from './routes/tagsRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import notesRoute from './routes/notesRoutes.js';
import adminUserRoutes from './routes/admin/userRoutes.js';
import adminFileRoutes from './routes/admin/fileRoutes.js';
import adminNoteRoutes from './routes/admin/noteRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/problems', problemsRoute);
app.use('/api/tag',tagRoute)
app.use('/api/category',categoryRoutes)
app.use('/api/upload', uploadRoutes);
app.use('/api/notes', notesRoute);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/files', adminFileRoutes);
app.use('/api/admin/notes', adminNoteRoutes);
app.use('/api/ai', aiRoutes);
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
