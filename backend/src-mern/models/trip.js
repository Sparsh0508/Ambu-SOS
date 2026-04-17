import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
import { tripStatuses } from '../types.js';
const tripSchema = new Schema({
    _id: { type: String, default: () => randomUUID() },
    status: { type: String, enum: tripStatuses, default: 'SEARCHING' },
    pickupAddress: { type: String, required: true },
    pickupLat: { type: Number, required: true },
    pickupLng: { type: Number, required: true },
    destAddress: { type: String, default: null },
    destLat: { type: Number, default: null },
    destLng: { type: Number, default: null },
    passengerId: { type: String, ref: 'User', required: true },
    driverId: { type: String, ref: 'DriverProfile', default: null },
    hospitalId: { type: String, ref: 'Hospital', default: null },
    responderIds: { type: [String], default: [] },
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    pickedUpAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    routePolyline: { type: String, default: null },
    distanceKm: { type: Number, default: null },
    earningsAmount: { type: Number, default: null },
}, {
    versionKey: false,
});
export const TripModel = models.Trip || model('Trip', tripSchema);
