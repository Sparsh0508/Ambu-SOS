import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ChatMessageModel } from '../models/chat-message.js';
import { TripModel } from '../models/trip.js';
import { UserModel } from '../models/user.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { normalizeDocument } from '../utils/normalize.js';
import { hydrateTrip } from '../utils/presenters.js';
export const usersRouter = Router();
usersRouter.get('/profile', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const user = await UserModel.findById(userId).select('email phone fullName bloodType allergies emergencyContact role');
    if (!user) {
        throw new HttpError(404, 'User profile not found');
    }
    res.json(normalizeDocument(user));
}));
usersRouter.put('/profile', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const updatedUser = await UserModel.findByIdAndUpdate(userId, {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        bloodType: req.body.bloodType,
        allergies: req.body.allergies,
        emergencyContact: req.body.emergencyContact,
    }, {
        new: true,
        runValidators: true,
    }).select('email phone fullName bloodType allergies emergencyContact');
    if (!updatedUser) {
        throw new HttpError(404, 'User profile not found');
    }
    res.json(normalizeDocument(updatedUser));
}));
usersRouter.post('/book-trip', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new HttpError(400, 'lat and lng are required');
    }
    const trip = await TripModel.create({
        passengerId: userId,
        pickupLat: lat,
        pickupLng: lng,
        pickupAddress: "User's Live Location",
    });
    res.json(normalizeDocument(trip));
}));
usersRouter.get('/active-trip', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const trip = await TripModel.findOne({
        passengerId: userId,
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
    });
    res.json(trip ? normalizeDocument(trip) : null);
}));
usersRouter.get('/trip/:id/chat', requireAuth, asyncHandler(async (req, res) => {
    const messages = await ChatMessageModel.find({ tripId: req.params.id }).sort({ timestamp: 1 });
    res.json(normalizeDocument(messages));
}));
usersRouter.get('/trips/history', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const trips = await TripModel.find({ passengerId: userId }).sort({ requestedAt: -1 });
    const history = await Promise.all(trips.map(async (tripDoc) => {
        const trip = normalizeDocument(tripDoc);
        const hydrated = await hydrateTrip(tripDoc);
        return {
            id: trip.id,
            requestedAt: trip.requestedAt,
            pickupAddress: trip.pickupAddress,
            destAddress: trip.destAddress,
            status: trip.status,
            hospital: hydrated?.hospital ? { name: hydrated.hospital.name } : null,
        };
    }));
    res.json(history);
}));
usersRouter.get('/trip/:id', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const trip = await TripModel.findOne({
        _id: req.params.id,
        passengerId: userId,
    });
    if (!trip) {
        throw new HttpError(404, 'Trip not found or unauthorized');
    }
    res.json(await hydrateTrip(trip));
}));
