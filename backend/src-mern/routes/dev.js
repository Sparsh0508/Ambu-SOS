import argon2 from 'argon2';
import { Router } from 'express';
import { AmbulanceModel } from '../models/ambulance.js';
import { CfrProfileModel } from '../models/cfr-profile.js';
import { ChatMessageModel } from '../models/chat-message.js';
import { DriverProfileModel } from '../models/driver-profile.js';
import { HospitalModel } from '../models/hospital.js';
import { HospitalProfileModel } from '../models/hospital-profile.js';
import { MedicalReportModel } from '../models/medical-report.js';
import { ProximityAlertModel } from '../models/proximity-alert.js';
import { TripModel } from '../models/trip.js';
import { UserModel } from '../models/user.js';
import { asyncHandler } from '../utils/async-handler.js';
import { clearHospitalCache } from '../utils/hospital-cache.js';
export const devRouter = Router();
async function wipeAllData() {
    await Promise.all([
        ChatMessageModel.deleteMany({}),
        ProximityAlertModel.deleteMany({}),
        MedicalReportModel.deleteMany({}),
        TripModel.deleteMany({}),
        HospitalProfileModel.deleteMany({}),
        CfrProfileModel.deleteMany({}),
        DriverProfileModel.deleteMany({}),
        AmbulanceModel.deleteMany({}),
        HospitalModel.deleteMany({}),
        UserModel.deleteMany({}),
    ]);
    clearHospitalCache();
}
async function seedSystemData() {
    const dummyPassword = await argon2.hash('password123');
    const hospitalA = await HospitalModel.create({
        name: 'Jupiter Hospital Thane',
        address: 'Eastern Express Hwy, Thane',
        latitude: 19.2064,
        longitude: 72.9744,
        phone: '02221725555',
        availableBeds: 10,
        icuAvailable: 2,
        ventilators: 3,
        specialties: ['Trauma', 'Cardiac'],
    });
    const hospitalB = await HospitalModel.create({
        name: 'Bethany Hospital',
        address: 'Pokhran Rd 2, Thane',
        latitude: 19.2155,
        longitude: 72.9654,
        phone: '02221726666',
        availableBeds: 5,
        icuAvailable: 0,
        ventilators: 1,
        specialties: ['General'],
    });
    const jupiterAdmin = await UserModel.create({
        email: 'admin@jupiter.com',
        phone: '1111100000',
        fullName: 'Jupiter Admin',
        passwordHash: dummyPassword,
        role: 'HOSPITAL_ADMIN',
    });
    await HospitalProfileModel.create({
        userId: jupiterAdmin.id,
        hospitalId: hospitalA.id,
    });
    const bethanyAdmin = await UserModel.create({
        email: 'admin@bethany.com',
        phone: '2222200000',
        fullName: 'Bethany Admin',
        passwordHash: dummyPassword,
        role: 'HOSPITAL_ADMIN',
    });
    await HospitalProfileModel.create({
        userId: bethanyAdmin.id,
        hospitalId: hospitalB.id,
    });
    const driverOneUser = await UserModel.create({
        email: 'rajesh@snapbulance.com',
        phone: '9999911111',
        fullName: 'Rajesh Kumar',
        passwordHash: dummyPassword,
        role: 'DRIVER',
    });
    const driverOneAmbulance = await AmbulanceModel.create({
        plateNumber: 'MH-04-AB-1111',
        type: 'ALS',
        model: 'Force Traveller',
        equipmentList: ['Defibrillator', 'Oxygen', 'Ventilator'],
    });
    await DriverProfileModel.create({
        userId: driverOneUser.id,
        licenseNumber: 'MH04-DL-1111',
        yearsExperience: 5,
        status: 'AVAILABLE',
        currentLat: 19.1973,
        currentLng: 72.9644,
        ambulanceId: driverOneAmbulance.id,
    });
    const driverTwoUser = await UserModel.create({
        email: 'suresh@snapbulance.com',
        phone: '9999922222',
        fullName: 'Suresh Patil',
        passwordHash: dummyPassword,
        role: 'DRIVER',
    });
    const driverTwoAmbulance = await AmbulanceModel.create({
        plateNumber: 'MH-04-AB-2222',
        type: 'BLS',
        model: 'Maruti Omni',
        equipmentList: ['Oxygen', 'First Aid'],
    });
    await DriverProfileModel.create({
        userId: driverTwoUser.id,
        licenseNumber: 'MH04-DL-2222',
        yearsExperience: 8,
        status: 'AVAILABLE',
        currentLat: 18.5204,
        currentLng: 73.8567,
        ambulanceId: driverTwoAmbulance.id,
    });
    const cfrUser = await UserModel.create({
        email: 'mohit@snapbulance.com',
        phone: '3333300000',
        fullName: 'Mohit Kumar',
        passwordHash: dummyPassword,
        role: 'CFR',
    });
    await CfrProfileModel.create({
        userId: cfrUser.id,
        certificationId: 'CPR-999888',
        isVerified: true,
    });
    clearHospitalCache();
    return {
        message: 'System seeded successfully!',
        hospitals: 2,
        drivers: 2,
    };
}
devRouter.post('/seed-system', asyncHandler(async (_req, res) => {
    res.json(await seedSystemData());
}));
devRouter.delete('/reset-system', asyncHandler(async (_req, res) => {
    await wipeAllData();
    await seedSystemData();
    res.json({ message: 'System completely reset and re-seeded.' });
}));
devRouter.delete('/wipe-all', asyncHandler(async (_req, res) => {
    await wipeAllData();
    res.json({
        message: 'Database completely wiped. All records destroyed.',
        timestamp: new Date().toISOString(),
    });
}));
