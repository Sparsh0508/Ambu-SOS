const isFiniteCoordinate = (value) =>
  typeof value === "number" && Number.isFinite(value);

export const toLatLngTuple = (lat, lng) => {
  if (!isFiniteCoordinate(lat) || !isFiniteCoordinate(lng)) {
    return null;
  }

  return [lat, lng];
};

export const getDriverLatLng = (driver) =>
  toLatLngTuple(
    driver?.location?.lat ?? driver?.currentLat,
    driver?.location?.lng ?? driver?.currentLng
  );

export const getHospitalLatLng = (hospital) =>
  toLatLngTuple(
    hospital?.location?.lat ?? hospital?.latitude,
    hospital?.location?.lng ?? hospital?.longitude
  );

export const getTripDestinationLatLng = (trip) =>
  toLatLngTuple(
    trip?.destination?.lat ?? trip?.destLat,
    trip?.destination?.lng ?? trip?.destLng
  );
