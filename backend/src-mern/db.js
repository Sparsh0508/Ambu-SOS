import mongoose from 'mongoose';
import { config, isProduction } from './config.js';
export async function connectDatabase() {
    try {
        await mongoose.connect(config.mongoUri, {
            dbName: process.env.MONGODB_DB || undefined,
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 10000,
        });
        if (!isProduction) console.log(`✅ Connected to MongoDB`);
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        if (!isProduction) console.error('Connection String:', config.mongoUri.replace(/:[^:]*@/, ':****@'));
        throw error;
    }
}
