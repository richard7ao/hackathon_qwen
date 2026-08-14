// Free geocoding (postcodes.io) + no-key OSM map tile thumbnails + portal links.

export interface LatLon {
  lat: number;
  lon: number;
}

/** Bulk-geocode UK postcodes via postcodes.io (free, no key). */
export async function geocodePostcodes(postcodes: string[]): Promise<Record<string, LatLon>> {
  const out: Record<string, LatLon> = {};
  const unique = Array.from(new Set(postcodes.filter(Boolean)));
  // postcodes.io bulk endpoint accepts up to 100 per request.
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100);
    try {
      const res = await fetch("https://api.postcodes.io/postcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcodes: batch }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const row of data.result || []) {
        const r = row.result;
        if (r && r.latitude && r.longitude) {
          out[row.query] = { lat: r.latitude, lon: r.longitude };
        }
      }
    } catch {
      // Skip failed batch.
    }
  }
  return out;
}

/** OSM slippy-map tile URL for a coordinate (no key needed). */
export function osmTileUrl(lat: number, lon: number, zoom = 15): string {
  const n = 2 ** zoom;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n);
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

/** Link that reliably reaches the real Rightmove listing(s) for an address. */
export function rightmoveSearchUrl(postcode: string, street?: string): string {
  const q = encodeURIComponent(`${[street, postcode].filter(Boolean).join(" ")} to rent site:rightmove.co.uk`);
  return `https://www.google.com/search?q=${q}`;
}
