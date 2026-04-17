import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { DriverProfileModel } from '../models/driver-profile.js';
import { HospitalModel } from '../models/hospital.js';
import { MedicalReportModel } from '../models/medical-report.js';
import { TripModel } from '../models/trip.js';
import { asyncHandler } from '../utils/async-handler.js';
import { getDistanceFromLatLonInKm } from '../utils/distance.js';
import { getHospitalsWithCache } from '../utils/hospital-cache.js';
import { HttpError } from '../utils/http-error.js';
import { hydrateTrip } from '../utils/presenters.js';
import { normalizeDocument } from '../utils/normalize.js';
import { calculateTripEarnings } from '../utils/trip-metrics.js';
export const tripsRouter = Router();
tripsRouter.get('/driver/history', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const driverProfile = await DriverProfileModel.findOne({ userId });
    if (!driverProfile) {
        throw new HttpError(404, 'Driver profile not found for this user.');
    }
    const trips = await TripModel.find({ driverId: driverProfile.id }).sort({ requestedAt: -1 });
    const history = await Promise.all(trips.map(async (tripDoc) => {
        const hydrated = (await hydrateTrip(tripDoc));
        return {
            id: hydrated?.id,
            requestedAt: hydrated?.requestedAt,
            pickupAddress: hydrated?.pickupAddress,
            destAddress: hydrated?.destAddress,
            status: hydrated?.status,
            hospital: hydrated?.hospital ? { name: hydrated.hospital.name } : null,
            passenger: hydrated?.passenger
                ? {
                    fullName: hydrated.passenger.fullName,
                    phone: hydrated.passenger.phone,
                }
                : null,
        };
    }));
    res.json(history);
}));
tripsRouter.post('/:tripId/arrive-to-patient', asyncHandler(async (req, res) => {
    const trip = await TripModel.findById(req.params.tripId);
    if (!trip) {
        throw new HttpError(404, 'Trip not found');
    }
    const hospitals = (await getHospitalsWithCache());
    if (hospitals.length === 0) {
        throw new HttpError(500, 'No hospitals seeded');
    }
    let closestHospital = null;
    let minDistance = Infinity;
    for (const hospital of hospitals) {
        const distance = getDistanceFromLatLonInKm(trip.pickupLat, trip.pickupLng, hospital.latitude, hospital.longitude);
        if (distance < minDistance) {
            minDistance = distance;
            closestHospital = hospital;
        }
    }
    if (!closestHospital) {
        throw new HttpError(500, 'Could not determine closest hospital');
    }
    const updatedTrip = await TripModel.findByIdAndUpdate(req.params.tripId, {
        status: 'ARRIVED',
        pickedUpAt: new Date(),
        hospitalId: closestHospital._id,
        destAddress: closestHospital.address,
        destLat: closestHospital.latitude,
        destLng: closestHospital.longitude,
        distanceKm: Number(minDistance.toFixed(2)),
    }, { new: true });
    const hospital = await HospitalModel.findById(closestHospital._id);
    res.json({
        success: true,
        updatedTrip: {
            ...normalizeDocument(updatedTrip),
            hospital: normalizeDocument(hospital),
        },
    });
}));
tripsRouter.post('/:tripId/arrive-at-hospital', asyncHandler(async (req, res) => {
    const updatedTrip = await TripModel.findByIdAndUpdate(req.params.tripId, { status: 'ON_BOARD' }, { new: true });
    res.json({
        success: true,
        updatedTrip: normalizeDocument(updatedTrip),
    });
}));
tripsRouter.post('/:tripId/complete', asyncHandler(async (req, res) => {
    const trip = await TripModel.findById(req.params.tripId);
    if (!trip) {
        throw new HttpError(404, `Trip with ID ${req.params.tripId} not found`);
    }
    const earningsAmount = calculateTripEarnings(trip.distanceKm);
    await TripModel.findByIdAndUpdate(req.params.tripId, {
        status: 'COMPLETED',
        completedAt: new Date(),
        earningsAmount,
    });
    if (trip.driverId) {
        await DriverProfileModel.findByIdAndUpdate(trip.driverId, {
            status: 'AVAILABLE',
        });
    }
    await MedicalReportModel.findOneAndUpdate({ tripId: req.params.tripId }, {
        tripId: req.params.tripId,
        severity: req.body.severity || 'MODERATE',
        suspectedCondition: req.body.suspectedCondition,
        vitalsCheck: req.body.vitalsCheck,
        paramedicNotes: req.body.paramedicNotes,
    }, { upsert: true, new: true });
    res.json({
        success: true,
        earningsAmount,
        message: 'Handover complete. Trip ended, driver available, and medical report saved.',
    });
}));
tripsRouter.get('/driver/trip/:tripId', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const driverProfile = await DriverProfileModel.findOne({ userId });
    if (!driverProfile) {
        throw new HttpError(404, 'Driver profile not found.');
    }
    const trip = await TripModel.findOne({
        _id: req.params.tripId,
        driverId: driverProfile.id,
    });
    if (!trip) {
        throw new HttpError(404, 'Trip not found or unauthorized');
    }
    res.json(await hydrateTrip(trip));
}));
tripsRouter.post('/:tripId/cancel', asyncHandler(async (req, res) => {
    const trip = await TripModel.findById(req.params.tripId);
    if (!trip) {
        throw new HttpError(404, 'Trip not found');
    }
    const updatedTrip = await TripModel.findByIdAndUpdate(req.params.tripId, { status: 'CANCELLED' }, { new: true });
    if (trip.driverId) {
        await DriverProfileModel.findByIdAndUpdate(trip.driverId, {
            status: 'AVAILABLE',
        });
    }
    res.json({
        success: true,
        message: 'Trip cancelled successfully.',
        updatedTrip: normalizeDocument(updatedTrip),
    });
}));
