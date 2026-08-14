import raw from "@/data/listings.json";
import { Property } from "./types";

interface Snapshot {
  generatedAt: string;
  listings: Property[];
}

/** Real London rental listings fetched from homedata (cached snapshot). */
export const properties: Property[] = (raw as Snapshot).listings;
export const generatedAt: string = (raw as Snapshot).generatedAt;
