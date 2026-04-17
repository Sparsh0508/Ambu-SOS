import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { CfrProfileModel } from '../models/cfr-profile.js';
import { TripModel } from '../models/trip.js';
import { asyncHandler } from '../utils/async-handler.js';
import { getDistanceFromLatLonInKm } from '../utils/distance.js';
import { HttpError } from '../utils/http-error.js';
import { hydrateTrip } from '../utils/presenters.js';
export const cfrRouter = Router();
cfrRouter.use(requireAuth);
cfrRouter.get('/nearby', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const cfrProfile = await CfrProfileModel.findOne({ userId });
    if (!cfrProfile) {
        throw new HttpError(404, 'CFR profile not found');
    }
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new HttpError(400, 'lat and lng query params are required');
    }
    const activeTrips = await TripModel.find({
        status: { $in: ['SEARCHING', 'ASSIGNED', 'EN_ROUTE'] },
    }).sort({ requestedAt: -1 });
    const nearbyTrips = [];
    for (const trip of activeTrips) {
        const distance = getDistanceFromLatLonInKm(lat, lng, trip.pickupLat, trip.pickupLng);
        if (distance <= 2.0) {
            const hydrated = await hydrateTrip(trip);
            nearbyTrips.push({
                ...hydrated,
                distanceKm: distance,
            });
        }
    }
    nearbyTrips.sort((left, right) => left.distanceKm - right.distanceKm);
    res.json(nearbyTrips);
}));
cfrRouter.post('/respond/:tripId', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const cfrProfile = await CfrProfileModel.findOne({ userId });
    if (!cfrProfile) {
        throw new HttpError(404, 'CFR profile not found');
    }
    const currentEmergency = await TripModel.findOne({
        status: { $in: ['SEARCHING', 'ASSIGNED', 'EN_ROUTE'] },
        responderIds: cfrProfile.id,
    });
    if (currentEmergency) {
        throw new HttpError(400, 'You are already responding to an active emergency. Please complete it first.');
    }
    const trip = await TripModel.findById(req.params.tripId);
    if (!trip || ['COMPLETED', 'CANCELLED'].includes(trip.status)) {
        throw new HttpError(404, 'This emergency has already been resolved or cancelled.');
    }
    await TripModel.findByIdAndUpdate(req.params.tripId, {
        $addToSet: { responderIds: cfrProfile.id },
    });
    const user = req.user;
    res.json({
        success: true,
        cfrName: user?.fullName,
        message: 'You are now linked to this emergency.',
    });
}));
