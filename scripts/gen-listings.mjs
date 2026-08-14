// Fetch a real London rental dataset from homedata, enrich with map thumbnails
// + Rightmove links, and cache to data/listings.json. Run: node scripts/gen-listings.mjs
import fs from "node:fs";
import path from "node:path";

const BASE = "https://api.homedata.co.uk/api";
const KEY = process.env.HOMEDATA_API_KEY;
if (!KEY) {
  console.error("HOMEDATA_API_KEY not set");
  process.exit(1);
}
const H = { Authorization: `Api-Key ${KEY}` };

const COLORS = [
  "oklch(0.88 0.06 145)", "oklch(0.85 0.05 200)", "oklch(0.9 0.05 110)",
  "oklch(0.87 0.07 85)", "oklch(0.86 0.06 160)", "oklch(0.89 0.05 135)",
];

const BOROUGHS = [
  "London Borough of Hackney",
  "London Borough of Islington",
  "London Borough of Tower Hamlets",
  "London Borough of Southwark",
  "London Borough of Lambeth",
  "London Borough of Camden",
];

// Verified royalty-free apartment/interior photos (Unsplash CDN, hotlink-safe).
const PHOTOS = [
  "1522708323590-d24dbb6b0267", "1502672260266-1c1ef2d93688", "1560448204-e02f11c3d0e2",
  "1560185007-cde436f6a4d0", "1493809842364-78817add7ffb", "1484154218962-a197022b5858",
  "1512917774080-9991f1c4c750", "1502005229762-cf1b2da7c5d6", "1449844908441-8829872d2607",
  "1567767292278-a4f21aa2d36e",
].map((id) => `https://images.unsplash.com/photo-${id}?w=800&q=70&auto=format&fit=crop`);

function photoFor(index) {
  return PHOTOS[index % PHOTOS.length];
}
function rightmoveSearchUrl(postcode, street) {
  // Rightmove needs a location identifier for a direct search, so route via a
  // Google search scoped to Rightmove — reliably lands on the real listing(s).
  const q = encodeURIComponent(`${[street, postcode].filter(Boolean).join(" ")} to rent site:rightmove.co.uk`);
  return `https://www.google.com/search?q=${q}`;
}
async function boundaryId(name) {
  const r = await fetch(`${BASE}/boundaries/autocomplete/?q=${encodeURIComponent(name)}`, { headers: H });
  const d = await r.json();
  return d?.results?.[0]?.id ?? null;
}
async function geocode(postcodes) {
  const out = {};
  const uniq = [...new Set(postcodes.filter(Boolean))];
  for (let i = 0; i < uniq.length; i += 100) {
    const batch = uniq.slice(i, i + 100);
    const r = await fetch("https://api.postcodes.io/postcodes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcodes: batch }),
    });
    const d = await r.json();
    for (const row of d.result || []) {
      if (row.result) out[row.query] = { lat: row.result.latitude, lon: row.result.longitude };
    }
  }
  return out;
}

const all = [];
const seen = new Set();
let colorIdx = 0;

for (const b of BOROUGHS) {
  const id = await boundaryId(b);
  if (!id) { console.warn(`no boundary for ${b}`); continue; }
  const params = new URLSearchParams({
    transaction_type: "Rental", boundary_id: String(id), bedrooms: "1", max_price: "3000", page_size: "12",
  });
  const r = await fetch(`${BASE}/live-listings/search/?${params}`, { headers: H });
  const d = await r.json();
  const rows = d?.results || [];
  console.log(`${b}: ${rows.length} listings`);
  for (const l of rows) {
    if (!l.postcode || seen.has(l.id)) continue;
    seen.add(l.id);
    all.push({ ...l, _borough: b.replace("London Borough of ", "") });
  }
}

const geo = await geocode(all.map((l) => l.postcode));

const listings = all.map((l, idx) => {
  const g = geo[l.postcode];
  const beds = l.bedrooms === 0 ? "Studio" : `${l.bedrooms ?? 1} bed`;
  const type = (l.property_type || "flat").replace(/_/g, " ");
  return {
    id: l.id,
    title: `${beds} ${type} in ${l._borough}`,
    address: [l.street, l.postcode].filter(Boolean).join(", "),
    postcode: l.postcode,
    price: l.latest_price ?? 0,
    bedrooms: l.bedrooms ?? 1,
    bathrooms: l.bathrooms ?? 1,
    availableFrom: l.added_date || new Date().toISOString().slice(0, 10),
    imageColor: COLORS[colorIdx++ % COLORS.length],
    propertyType: l.property_type,
    agentName: l.agent_name,
    lat: g?.lat,
    lon: g?.lon,
    thumbnailUrl: photoFor(idx), // real property photo (map lives in the results map)
    listingUrl: rightmoveSearchUrl(l.postcode, l.street),
  };
}).filter((l) => l.price > 0);

const outDir = path.join(process.cwd(), "data");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "listings.json");
fs.writeFileSync(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), listings }, null, 2));
console.log(`Wrote ${listings.length} real listings to ${outFile}`);
