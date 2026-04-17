import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
import { roles } from '../types.js';
const userSchema = new Schema({
    _id: { type: String, default: () => randomUUID() },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: roles, default: 'USER' },
    bloodType: { type: String, default: null },
    allergies: { type: String, default: null },
    emergencyContact: { type: String, default: null },
    fcmToken: { type: String, default: null },
}, {
    timestamps: true,
    versionKey: false,
});
export const UserModel = models.User || model('User', userSchema);
