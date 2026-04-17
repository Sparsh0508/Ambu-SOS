import { HospitalModel } from '../models/hospital.js';
let cachedHospitals = null;
let cacheExpiresAt = 0;
export async function getHospitalsWithCache() {
    const now = Date.now();
    if (cachedHospitals && now < cacheExpiresAt) {
        return cachedHospitals;
    }
    cachedHospitals = await HospitalModel.find().lean();
    cacheExpiresAt = now + 5 * 60 * 1000;
    return cachedHospitals;
}
export function clearHospitalCache() {
    cachedHospitals = null;
    cacheExpiresAt = 0;
}
