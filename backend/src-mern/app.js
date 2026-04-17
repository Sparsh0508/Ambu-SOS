import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { getAllowedOrigins } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import { authRouter } from './routes/auth.js';
import { cfrRouter } from './routes/cfr.js';
import { devRouter } from './routes/dev.js';
import { driversRouter } from './routes/drivers.js';
import { healthRouter } from './routes/health.js';
import { hospitalsRouter } from './routes/hospitals.js';
import { tripsRouter } from './routes/trips.js';
import { usersRouter } from './routes/users.js';
export function createApp() {
    const app = express();
    app.use(cors({
        origin: getAllowedOrigins(),
        credentials: true,
    }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(rateLimit({
        windowMs: 60 * 1000,
        limit: 100,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    app.use('/health', healthRouter);
    app.use('/auth', authRouter);
    app.use('/users', usersRouter);
    app.use('/drivers', driversRouter);
    app.use('/hospitals', hospitalsRouter);
    app.use('/trips', tripsRouter);
    app.use('/cfr', cfrRouter);
    app.use('/dev', devRouter);
    app.use(errorHandler);
    return app;
}
