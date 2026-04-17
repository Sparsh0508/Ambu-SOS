import mongoose from 'mongoose';
import { config } from './config.js';
export async function connectDatabase() {
    await mongoose.connect(config.mongoUri, {
        dbName: process.env.MONGODB_DB || undefined,
    });
    console.log(`Connected to MongoDB at ${config.mongoUri}`);
}
