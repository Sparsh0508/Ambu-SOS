import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
const cfrProfileSchema = new Schema({
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, ref: 'User', required: true, unique: true },
    certificationId: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: false },
}, {
    versionKey: false,
});
export const CfrProfileModel = models.CfrProfile || model('CfrProfile', cfrProfileSchema);
