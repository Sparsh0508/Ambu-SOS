import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { HospitalModel } from '../models/hospital.js';
import { HospitalProfileModel } from '../models/hospital-profile.js';
import { asyncHandler } from '../utils/async-handler.js';
import { clearHospitalCache } from '../utils/hospital-cache.js';
import { HttpError } from '../utils/http-error.js';
import { buildLocation, isFiniteCoordinate } from '../utils/location.js';
import { hydrateTrip } from '../utils/presenters.js';
import { TripModel } from '../models/trip.js';
import { normalizeDocument } from '../utils/normalize.js';
export const hospitalsRouter = Router();
hospitalsRouter.use(requireAuth);
async function getHospitalAdminProfile(userId) {
    const adminProfile = await HospitalProfileModel.findOne({ userId });
    if (!adminProfile) {
        throw new HttpError(404, 'Admin profile not found');
    }
    return adminProfile;
}
hospitalsRouter.get('/dashboard', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const adminProfile = await getHospitalAdminProfile(userId);
    const trips = await TripModel.find({
        hospitalId: adminProfile.hospitalId,
        status: { $in: ['ARRIVED', 'ON_BOARD'] },
    }).sort({ requestedAt: -1 });
    const dashboardTrips = await Promise.all(trips.map((trip) => hydrateTrip(trip)));
    res.json(dashboardTrips);
}));
hospitalsRouter.get('/profile', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const adminProfile = await getHospitalAdminProfile(userId);
    const hospital = await HospitalModel.findById(adminProfile.hospitalId);
    if (!hospital) {
        throw new HttpError(404, 'Hospital not found');
    }
    const normalizedHospital = normalizeDocument(hospital);
    res.json({
        ...normalizedHospital,
        location: buildLocation(normalizedHospital.latitude, normalizedHospital.longitude, {
            address: normalizedHospital.address,
        }),
    });
}));
hospitalsRouter.put('/profile', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const adminProfile = await getHospitalAdminProfile(userId);
    const updates = {};

    if (typeof req.body.name === 'string') {
        updates.name = req.body.name.trim();
    }
    if (typeof req.body.address === 'string') {
        updates.address = req.body.address.trim();
    }
    if (typeof req.body.phone === 'string') {
        updates.phone = req.body.phone.trim();
    }
    if (typeof req.body.availableBeds === 'number') {
        updates.availableBeds = req.body.availableBeds;
    }
    if (typeof req.body.icuAvailable === 'number') {
        updates.icuAvailable = req.body.icuAvailable;
    }
    if (typeof req.body.ventilators === 'number') {
        updates.ventilators = req.body.ventilators;
    }

    const hasLatitude = req.body.latitude !== undefined;
    const hasLongitude = req.body.longitude !== undefined;
    if (hasLatitude || hasLongitude) {
        if (!isFiniteCoordinate(req.body.latitude) || !isFiniteCoordinate(req.body.longitude)) {
            throw new HttpError(400, 'Valid latitude and longitude are required together');
        }

        updates.latitude = req.body.latitude;
        updates.longitude = req.body.longitude;
    }

    const updatedHospital = await HospitalModel.findByIdAndUpdate(adminProfile.hospitalId, updates, {
        new: true,
        runValidators: true,
    });

    if (hasLatitude || hasLongitude || updates.address || updates.name) {
        clearHospitalCache();
    }

    const normalizedHospital = normalizeDocument(updatedHospital);
    res.json({
        ...normalizedHospital,
        location: buildLocation(normalizedHospital.latitude, normalizedHospital.longitude, {
            address: normalizedHospital.address,
        }),
    });
}));
hospitalsRouter.get('/trip/:tripId', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const adminProfile = await getHospitalAdminProfile(userId);
    const trip = await TripModel.findOne({
        _id: req.params.tripId,
        hospitalId: adminProfile.hospitalId,
    });
    if (!trip) {
        throw new HttpError(404, 'Trip not found or not assigned to this hospital');
    }
    res.json(await hydrateTrip(trip));
}));
