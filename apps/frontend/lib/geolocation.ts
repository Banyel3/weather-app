/**
 * Geolocation utilities
 */

/**
 * Get user's current position using browser geolocation API
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        let message = "Unable to access your location. ";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += "Please enable location permissions in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            message += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message += "Location request timed out.";
            break;
          default:
            message += "An unknown error occurred.";
        }
        
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat: number, lon: number): string => {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
};

/**
 * Check if geolocation is supported
 */
export const isGeolocationSupported = (): boolean => {
  return "geolocation" in navigator;
};

/**
 * Request geolocation permission status (if available)
 */
export const checkGeolocationPermission = async (): Promise<PermissionState | null> => {
  if (!("permissions" in navigator)) {
    return null;
  }

  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state;
  } catch (error) {
    console.error("Error checking geolocation permission:", error);
    return null;
  }
};
