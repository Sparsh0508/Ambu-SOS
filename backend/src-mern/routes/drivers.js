import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { DriverProfileModel } from '../models/driver-profile.js';
import { TripModel } from '../models/trip.js';
import { asyncHandler } from '../utils/async-handler.js';
import { getDistanceFromLatLonInKm } from '../utils/distance.js';
import { HttpError } from '../utils/http-error.js';
import { buildLocation, isFiniteCoordinate } from '../utils/location.js';
import { normalizeDocument } from '../utils/normalize.js';
import { getTripEarnings } from '../utils/trip-metrics.js';
export const driversRouter = Router();
driversRouter.use(requireAuth);
driversRouter.get('/dashboard-summary', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const driverProfile = await DriverProfileModel.findOne({ userId });
    if (!driverProfile) {
        throw new HttpError(404, 'Driver profile not found for this user.');
    }

    const completedTrips = await TripModel.find({
        driverId: driverProfile.id,
        status: 'COMPLETED',
    }).select('completedAt earningsAmount distanceKm');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEarnings = completedTrips.reduce((sum, trip) => {
        if (!trip.completedAt || trip.completedAt < todayStart) {
            return sum;
        }

        return sum + getTripEarnings(trip);
    }, 0);

    res.json({
        driver: {
            ...normalizeDocument(driverProfile),
            location: buildLocation(driverProfile.currentLat, driverProfile.currentLng, {
                updatedAt: driverProfile.lastLocationUpdate,
            }),
        },
        stats: {
            todayEarnings,
            completedTrips: completedTrips.length,
            completedTripsToday: completedTrips.filter((trip) => trip.completedAt && trip.completedAt >= todayStart).length,
        },
    });
}));
driversRouter.put('/status', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const driverProfile = await DriverProfileModel.findOne({ userId });
    if (!driverProfile) {
        throw new HttpError(404, 'Driver profile not found for this user.');
    }
    const updatedDriver = await DriverProfileModel.findByIdAndUpdate(driverProfile.id, {
        status: req.body.isOnline ? 'AVAILABLE' : 'OFFLINE',
    }, { new: true });
    res.json({ status: updatedDriver?.status });
}));
driversRouter.put('/location', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { lat, lng } = req.body;
    if (!isFiniteCoordinate(lat) || !isFiniteCoordinate(lng)) {
        throw new HttpError(400, 'lat and lng are required');
    }

    const driverProfile = await DriverProfileModel.findOne({ userId });
    if (!driverProfile) {
        throw new HttpError(404, 'Driver profile not found for this user.');
    }

    const updatedDriver = await DriverProfileModel.findByIdAndUpdate(driverProfile.id, {
        currentLat: lat,
        currentLng: lng,
        lastLocationUpdate: new Date(),
    }, { new: true });

    res.json({
        location: buildLocation(updatedDriver?.currentLat, updatedDriver?.currentLng, {
            updatedAt: updatedDriver?.lastLocationUpdate,
        }),
    });
}));
driversRouter.get('/pending-requests', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const currentDriver = await DriverProfileModel.findOne({ userId });
    if (!currentDriver || currentDriver.status !== 'AVAILABLE') {
        res.json([]);
        return;
    }
    const [pendingTrips, availableDrivers] = await Promise.all([
        TripModel.find({ status: 'SEARCHING' }),
        DriverProfileModel.find({ status: 'AVAILABLE' }),
    ]);
    const requestsForCurrentDriver = pendingTrips.reduce((acc, tripDoc) => {
        const trip = normalizeDocument(tripDoc);
        let nearestDriverId = null;
        let minDistance = Infinity;
        for (const driver of availableDrivers) {
            if (typeof driver.currentLat !== 'number' || typeof driver.currentLng !== 'number') {
                continue;
            }
            const distance = getDistanceFromLatLonInKm(trip.pickupLat, trip.pickupLng, driver.currentLat, driver.currentLng);
            if (distance < minDistance) {
                minDistance = distance;
                nearestDriverId = driver.id;
            }
        }
        if (nearestDriverId === currentDriver.id) {
            acc.push({
                ...trip,
                distanceKm: minDistance,
            });
        }
        return acc;
    }, []);
    res.json(requestsForCurrentDriver);
}));
driversRouter.get('/active-trip', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const driverProfile = await DriverProfileModel.findOne({ userId });
    if (!driverProfile) {
        res.json(null);
        return;
    }
    const trip = await TripModel.findOne({
        driverId: driverProfile.id,
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
    });
    res.json(trip ? normalizeDocument(trip) : null);
}));
