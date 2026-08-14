export interface Message {
  role: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  availableFrom: string;
  imageColor: string;
}

export type OutreachChannel = "voice" | "email" | "whatsapp";
export type OutreachStatus = "pending" | "sent" | "confirmed" | "failed";

export interface Outreach {
  id: string;
  propertyId: string;
  propertyTitle: string;
  channel: OutreachChannel;
  status: OutreachStatus;
  scheduledAt?: string;
}

export interface Preferences {
  location?: string;
  budget?: number;
  bedrooms?: number;
  moveInDate?: string;
  mustHaves?: string[];
}

export type PropertyDecision = "yes" | "no";

export interface Viewing {
  id: string;
  propertyId: string;
  propertyTitle: string;
  address: string;
  date: string; // ISO date
  time: string; // e.g. "2:00 PM"
  channel: OutreachChannel;
}
