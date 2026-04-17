import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
const hospitalSchema = new Schema({
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    phone: { type: String, required: true, trim: true },
    availableBeds: { type: Number, default: 0 },
    icuAvailable: { type: Number, default: 0 },
    ventilators: { type: Number, default: 0 },
    specialties: { type: [String], default: [] },
}, {
    versionKey: false,
});
export const HospitalModel = models.Hospital || model('Hospital', hospitalSchema);
