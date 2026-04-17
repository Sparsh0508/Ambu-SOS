import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
const chatMessageSchema = new Schema({
    _id: { type: String, default: () => randomUUID() },
    tripId: { type: String, ref: 'Trip', required: true },
    senderId: { type: String, ref: 'User', required: true },
    senderName: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, {
    versionKey: false,
});
export const ChatMessageModel = models.ChatMessage || model('ChatMessage', chatMessageSchema);
