import { Property } from "./types";
import { geocodePostcodes, osmTileUrl, rightmoveSearchUrl } from "./geo";

const BASE = "https://api.homedata.co.uk/api";
const API_KEY = process.env.HOMEDATA_API_KEY || "";

const COLORS = [
  "oklch(0.88 0.06 145)",
  "oklch(0.85 0.05 200)",
  "oklch(0.9 0.05 110)",
  "oklch(0.87 0.07 85)",
  "oklch(0.86 0.06 160)",
  "oklch(0.89 0.05 135)",
];

function authHeaders() {
  return { Authorization: `Api-Key ${API_KEY}` };
}

// Cache boundary lookups for the session (per serverless instance).
const boundaryCache = new Map<string, number | null>();

export async function resolveBoundaryId(location: string): Promise<number | null> {
  const key = location.trim().toLowerCase();
  if (boundaryCache.has(key)) return boundaryCache.get(key)!;
  try {
    const res = await fetch(
      `${BASE}/boundaries/autocomplete/?q=${encodeURIComponent(location)}`,
      { headers: authHeaders() },
    );
    if (!res.ok) {
      boundaryCache.set(key, null);
      return null;
    }
    const data = await res.json();
    const id = data?.results?.[0]?.id ?? null;
    boundaryCache.set(key, id);
    return id;
  } catch {
    boundaryCache.set(key, null);
    return null;
  }
}

interface RawListing {
  id: string;
  street?: string;
  postcode?: string;
  latest_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  agent_name?: string;
  added_date?: string;
}

function titleFor(l: RawListing): string {
  const beds = l.bedrooms === 0 ? "Studio" : `${l.bedrooms ?? 1} bed`;
  const type = (l.property_type || "flat").replace(/_/g, " ");
  const area = l.postcode ? l.postcode.split(" ")[0] : "London";
  return `${beds} ${type} in ${area}`;
}

export interface SearchArgs {
  location?: string;
  boundaryId?: number;
  bedrooms?: number;
  maxPrice?: number;
  pageSize?: number;
}

/**
 * Fetch real rental listings from homedata and enrich with map thumbnails + portal links.
 */
export async function fetchListings(args: SearchArgs): Promise<Property[]> {
  if (!API_KEY) throw new Error("HOMEDATA_API_KEY not set");

  let boundaryId = args.boundaryId;
  if (!boundaryId && args.location) {
    boundaryId = (await resolveBoundaryId(args.location)) ?? undefined;
  }

  const params = new URLSearchParams({ transaction_type: "Rental" });
  if (boundaryId) params.set("boundary_id", String(boundaryId));
  if (args.bedrooms) params.set("bedrooms", String(args.bedrooms));
  if (args.maxPrice) params.set("max_price", String(args.maxPrice));
  params.set("page_size", String(args.pageSize ?? 12));

  const res = await fetch(`${BASE}/live-listings/search/?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`homedata search failed: ${res.status}`);
  }
  const data = await res.json();
  const raw: RawListing[] = data?.results || [];

  // Geocode postcodes for map thumbnails.
  const geo = await geocodePostcodes(raw.map((r) => r.postcode || ""));

  return raw.map((l, i) => {
    const g = l.postcode ? geo[l.postcode] : undefined;
    const property: Property = {
      id: l.id,
      title: titleFor(l),
      address: [l.street, l.postcode].filter(Boolean).join(", "),
      postcode: l.postcode,
      price: l.latest_price ?? 0,
      bedrooms: l.bedrooms ?? 1,
      bathrooms: l.bathrooms ?? 1,
      availableFrom: l.added_date || new Date().toISOString().slice(0, 10),
      imageColor: COLORS[i % COLORS.length],
      propertyType: l.property_type,
      agentName: l.agent_name,
      lat: g?.lat,
      lon: g?.lon,
      thumbnailUrl: g ? osmTileUrl(g.lat, g.lon, 15) : undefined,
      listingUrl: rightmoveSearchUrl(l.postcode || "", l.street),
    };
    return property;
  });
}
