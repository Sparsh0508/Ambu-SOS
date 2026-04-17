export function isFiniteCoordinate(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

export function buildLocation(lat, lng, extras = {}) {
    if (!isFiniteCoordinate(lat) || !isFiniteCoordinate(lng)) {
        return null;
    }

    return {
        lat,
        lng,
        ...extras,
    };
}
