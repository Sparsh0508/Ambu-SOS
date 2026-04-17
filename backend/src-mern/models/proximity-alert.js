import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
const proximityAlertSchema = new Schema({
    _id: { type: String, default: () => randomUUID() },
    sentAt: { type: Date, default: Date.now },
    userId: { type: String, ref: 'User', required: true },
    triggerTripId: { type: String, ref: 'Trip', required: true },
    userLocationLat: { type: Number, required: true },
    userLocationLng: { type: Number, required: true },
}, {
    versionKey: false,
});
export const ProximityAlertModel = models.ProximityAlert || model('ProximityAlert', proximityAlertSchema);
