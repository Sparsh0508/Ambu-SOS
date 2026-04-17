export function calculateTripEarnings(distanceKm) {
    if (typeof distanceKm === 'number' && Number.isFinite(distanceKm)) {
        return Math.round(distanceKm * 50 + 100);
    }

    return 450;
}

export function getTripEarnings(trip) {
    if (typeof trip?.earningsAmount === 'number' && Number.isFinite(trip.earningsAmount)) {
        return trip.earningsAmount;
    }

    return calculateTripEarnings(trip?.distanceKm);
}
