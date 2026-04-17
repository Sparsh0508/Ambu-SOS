export function normalizeDocument(value) {
    if (Array.isArray(value)) {
        return value.map((entry) => normalizeDocument(entry));
    }
    if (value instanceof Date || value === null || value === undefined) {
        return value;
    }
    if (typeof value === 'object') {
        const plain = value && typeof value === 'object' && 'toObject' in value
            ? value.toObject()
            : value;
        const normalized = {};
        for (const [key, entry] of Object.entries(plain)) {
            if (key === '__v') {
                continue;
            }
            normalized[key === '_id' ? 'id' : key] = normalizeDocument(entry);
        }
        return normalized;
    }
    return value;
}
