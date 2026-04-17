import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
import { ambulanceTypes } from '../types.js';
const ambulanceSchema = new Schema({
    _id: { type: String, default: () => randomUUID() },
    plateNumber: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ambulanceTypes, required: true },
    model: { type: String, required: true, trim: true },
    equipmentList: { type: [String], default: [] },
}, {
    versionKey: false,
});
export const AmbulanceModel = models.Ambulance || model('Ambulance', ambulanceSchema);
