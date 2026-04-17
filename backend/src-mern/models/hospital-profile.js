import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
const hospitalProfileSchema = new Schema({
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, ref: 'User', required: true, unique: true },
    hospitalId: { type: String, ref: 'Hospital', required: true },
}, {
    versionKey: false,
});
export const HospitalProfileModel = models.HospitalProfile || model('HospitalProfile', hospitalProfileSchema);
