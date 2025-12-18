interface GeoLocationData {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  regionCode: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
  timezone: string | null;
  isp: string | null;
  isProxy: boolean;
}

const geoCache = new Map<string, { data: GeoLocationData; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function getGeoLocation(ipAddress: string): Promise<GeoLocationData> {
  if (!ipAddress || ipAddress === 'unknown' || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
    return {
      country: null,
      countryCode: null,
      region: null,
      regionCode: null,
      city: null,
      latitude: null,
      longitude: null,
      timezone: null,
      isp: null,
      isProxy: false,
    };
  }

  const cached = geoCache.get(ipAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`https://freeipapi.com/api/json/${ipAddress}`, {
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      console.warn(`Geolocation API returned ${response.status} for ${ipAddress}`);
      return getDefaultGeoData();
    }

    const data = await response.json();

    const geoData: GeoLocationData = {
      country: data.countryName || null,
      countryCode: data.countryCode || null,
      region: data.regionName || null,
      regionCode: data.regionCode || null,
      city: data.cityName || null,
      latitude: data.latitude?.toString() || null,
      longitude: data.longitude?.toString() || null,
      timezone: data.timeZone || null,
      isp: data.isp || null,
      isProxy: data.isProxy === true,
    };

    geoCache.set(ipAddress, { data: geoData, timestamp: Date.now() });

    if (geoCache.size > 10000) {
      const oldest = Array.from(geoCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 1000);
      oldest.forEach(([key]) => geoCache.delete(key));
    }

    return geoData;
  } catch (error) {
    console.warn(`Geolocation lookup failed for ${ipAddress}:`, error);
    return getDefaultGeoData();
  }
}

function getDefaultGeoData(): GeoLocationData {
  return {
    country: null,
    countryCode: null,
    region: null,
    regionCode: null,
    city: null,
    latitude: null,
    longitude: null,
    timezone: null,
    isp: null,
    isProxy: false,
  };
}

export function getGeoStats(visitors: Array<{ country?: string | null; region?: string | null; city?: string | null }>) {
  const countryStats: Record<string, number> = {};
  const regionStats: Record<string, number> = {};
  const cityStats: Record<string, number> = {};

  visitors.forEach((v) => {
    if (v.country) {
      countryStats[v.country] = (countryStats[v.country] || 0) + 1;
    }
    if (v.region) {
      regionStats[v.region] = (regionStats[v.region] || 0) + 1;
    }
    if (v.city) {
      cityStats[v.city] = (cityStats[v.city] || 0) + 1;
    }
  });

  return {
    topCountries: Object.entries(countryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count })),
    topRegions: Object.entries(regionStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count })),
    topCities: Object.entries(cityStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count })),
  };
}
