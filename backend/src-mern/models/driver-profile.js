import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
import { driverStatuses } from '../types.js';
const driverProfileSchema = new Schema({
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, ref: 'User', required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    yearsExperience: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    status: { type: String, enum: driverStatuses, default: 'OFFLINE' },
    currentLat: { type: Number, default: null },
    currentLng: { type: Number, default: null },
    lastLocationUpdate: { type: Date, default: null },
    ambulanceId: { type: String, ref: 'Ambulance', unique: true, sparse: true, default: null },
}, {
    versionKey: false,
});
export const DriverProfileModel = models.DriverProfile || model('DriverProfile', driverProfileSchema);
