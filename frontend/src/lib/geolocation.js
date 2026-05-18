export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not available on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 15000,
      ...options,
    });
  });
}

export async function getCurrentCoordinates(options = {}) {
  const position = await getCurrentPosition(options);

  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
}

export function getDriverLatLng(driver) {
  const lat = driver?.location?.lat ?? driver?.currentLat;
  const lng = driver?.location?.lng ?? driver?.currentLng;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  return [lat, lng];
}
