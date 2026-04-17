import http from 'http';
import { Server } from 'socket.io';
import { config, getAllowedOrigins } from './config.js';
import { connectDatabase } from './db.js';
import { createApp } from './app.js';
import { registerSocketHandlers } from './sockets/register-socket-handlers.js';
async function bootstrap() {
    await connectDatabase();
    const app = createApp();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: getAllowedOrigins(),
            credentials: true,
        },
    });
    registerSocketHandlers(io);
    httpServer.listen(config.port, () => {
        console.log(`SnapBulance MERN backend listening on port ${config.port}`);
    });
}
bootstrap().catch((error) => {
    console.error('Failed to start backend', error);
    process.exit(1);
});
