import { Router } from 'express';
export const healthRouter = Router();
healthRouter.get('/', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'AmbuSOS-backend',
        timestamp: new Date().toISOString(),
    });
});
