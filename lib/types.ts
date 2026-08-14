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

export interface Outreach {
  id: string;
  propertyId: string;
  propertyTitle: string;
  channel: "voice" | "email" | "whatsapp";
  status: "pending" | "sent" | "confirmed" | "failed";
  scheduledAt?: string;
}

export interface Preferences {
  budget?: number;
  location?: string;
  bedrooms?: number;
  moveInDate?: string;
  mustHaves?: string[];
}
