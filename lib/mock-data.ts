import { Property, Outreach } from "./types";

export const mockProperties: Property[] = [
  {
    id: "p1",
    title: "Sunny 1BR in Mission District",
    address: "2458 Mission St, San Francisco, CA",
    price: 2850,
    bedrooms: 1,
    bathrooms: 1,
    availableFrom: "2026-09-01",
    imageColor: "oklch(0.85 0.08 85)",
  },
  {
    id: "p2",
    title: "Modern Loft Near SoMa",
    address: "188 King St, San Francisco, CA",
    price: 3200,
    bedrooms: 1,
    bathrooms: 1,
    availableFrom: "2026-08-20",
    imageColor: "oklch(0.82 0.06 220)",
  },
  {
    id: "p3",
    title: "Quiet 2BR in Noe Valley",
    address: "4121 24th St, San Francisco, CA",
    price: 3900,
    bedrooms: 2,
    bathrooms: 1,
    availableFrom: "2026-09-10",
    imageColor: "oklch(0.88 0.05 145)",
  },
];

export const initialOutreach: Outreach[] = [];
