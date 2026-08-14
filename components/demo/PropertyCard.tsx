"use client";

import { Property } from "@/lib/types";

interface PropertyCardProps {
  property: Property;
  footer?: React.ReactNode;
  compact?: boolean;
}

export default function PropertyCard({ property, footer, compact }: PropertyCardProps) {
  return (
    <div className="bg-bg rounded-xl border border-surface overflow-hidden">
      <div
        className="w-full h-32 relative bg-cover bg-center"
        style={
          property.thumbnailUrl
            ? { backgroundImage: `url(${property.thumbnailUrl})` }
            : { backgroundColor: property.imageColor }
        }
        aria-hidden="true"
      >
        <span className="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full bg-bg/85 text-ink">
          £{property.price.toLocaleString()}/mo
        </span>
        {property.propertyType && (
          <span className="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-bg/85 text-muted capitalize">
            {property.propertyType.replace(/_/g, " ")}
          </span>
        )}
      </div>
      <div className={compact ? "p-3" : "p-4"}>
        <h4 className="font-medium text-ink">{property.title}</h4>
        <p className="text-sm text-muted mt-0.5">{property.address}</p>
        <p className="text-sm text-ink mt-2">
          {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} bed`} · {property.bathrooms} bath
          {property.agentName ? ` · ${property.agentName}` : ""}
        </p>
        {property.listingUrl && (
          <a
            href={property.listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm font-medium text-primary hover:text-primary-hover"
          >
            View on Rightmove →
          </a>
        )}
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </div>
  );
}
