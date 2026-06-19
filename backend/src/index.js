import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import userRoutes from './routes/users.js';
import resumeRoutes from './routes/resumes.js';
import interviewRoutes from './routes/interviews.js';
import dashboardRoutes from './routes/dashboard.js';
import trainingRoutes from './routes/training.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import { standardLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Global rate limiting on API endpoints
app.use('/api', standardLimiter);

// Mount the routes
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CareerCraft AI Backend is running' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
