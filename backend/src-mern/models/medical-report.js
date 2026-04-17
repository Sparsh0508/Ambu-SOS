import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
import { severityLevels } from '../types.js';
const medicalReportSchema = new Schema({
    _id: { type: String, default: () => randomUUID() },
    tripId: { type: String, ref: 'Trip', required: true, unique: true },
    paramedicNotes: { type: String, default: null },
    aiSummary: { type: String, default: null },
    suspectedCondition: { type: String, default: null },
    severity: { type: String, enum: severityLevels, default: 'MODERATE' },
    vitalsCheck: { type: Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now },
}, {
    versionKey: false,
});
export const MedicalReportModel = models.MedicalReport || model('MedicalReport', medicalReportSchema);
