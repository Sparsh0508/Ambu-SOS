import { AmbulanceModel } from '../models/ambulance.js';
import { DriverProfileModel } from '../models/driver-profile.js';
import { HospitalModel } from '../models/hospital.js';
import { MedicalReportModel } from '../models/medical-report.js';
import { UserModel } from '../models/user.js';
import { buildLocation } from './location.js';
import { normalizeDocument } from './normalize.js';
export function toSafeUser(user) {
    if (!user) {
        return null;
    }
    const normalized = normalizeDocument(user);
    const { passwordHash, ...safeUser } = normalized;
    void passwordHash;
    return safeUser;
}
export async function hydrateTrip(tripInput) {
    if (!tripInput) {
        return null;
    }
    const trip = normalizeDocument(tripInput);
    const [passenger, driverProfile, hospital, medicalReport] = await Promise.all([
        trip.passengerId ? UserModel.findById(trip.passengerId) : null,
        trip.driverId ? DriverProfileModel.findById(trip.driverId) : null,
        trip.hospitalId ? HospitalModel.findById(trip.hospitalId) : null,
        MedicalReportModel.findOne({ tripId: trip.id }),
    ]);
    let driver = null;
    if (driverProfile) {
        const normalizedDriver = normalizeDocument(driverProfile);
        const [driverUser, ambulance] = await Promise.all([
            normalizedDriver.userId ? UserModel.findById(normalizedDriver.userId) : null,
            normalizedDriver.ambulanceId ? AmbulanceModel.findById(normalizedDriver.ambulanceId) : null,
        ]);
        driver = {
            ...normalizedDriver,
            location: buildLocation(normalizedDriver.currentLat, normalizedDriver.currentLng, {
                updatedAt: normalizedDriver.lastLocationUpdate,
            }),
            user: toSafeUser(driverUser),
            ambulance: ambulance ? normalizeDocument(ambulance) : null,
        };
    }

    const normalizedHospital = hospital ? normalizeDocument(hospital) : null;

    return {
        ...trip,
        destination: buildLocation(trip.destLat, trip.destLng, {
            address: trip.destAddress,
            hospitalId: trip.hospitalId,
        }),
        passenger: toSafeUser(passenger),
        driver,
        hospital: normalizedHospital
            ? {
                ...normalizedHospital,
                location: buildLocation(normalizedHospital.latitude, normalizedHospital.longitude, {
                    address: normalizedHospital.address,
                }),
            }
            : null,
        medicalReport: medicalReport ? normalizeDocument(medicalReport) : null,
    };
}
