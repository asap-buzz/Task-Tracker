import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import questRoutes from './routes/questRoutes.js';
import { habitRoutes, userRoutes, statsRoutes } from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api', statsRoutes); // /api/dashboard, /api/activity

app.use(notFound);
app.use(errorHandler);
export default app;
