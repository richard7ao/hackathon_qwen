"use client";

import { Property, Viewing } from "@/lib/types";
import PropertyMap from "./PropertyMap";

interface ViewingDetailsModalProps {
  viewing: Viewing;
  onClose: () => void;
  onCall: (viewing: Viewing) => void;
}

export default function ViewingDetailsModal({ viewing, onClose, onCall }: ViewingDetailsModalProps) {
  const mapProps: Property[] =
    typeof viewing.lat === "number" && typeof viewing.lon === "number"
      ? [
          {
            id: viewing.propertyId,
            title: viewing.propertyTitle,
            address: viewing.address,
            price: viewing.price ?? 0,
            bedrooms: viewing.bedrooms ?? 1,
            bathrooms: viewing.bathrooms ?? 1,
            availableFrom: viewing.date,
            imageColor: "oklch(0.88 0.06 145)",
            lat: viewing.lat,
            lon: viewing.lon,
            listingUrl: viewing.listingUrl,
          },
        ]
      : [];

  const dateLabel = new Date(viewing.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="bg-bg rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-surface flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Booked viewing</p>
            <h3 className="font-semibold text-ink">{viewing.propertyTitle}</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* When */}
          <div className="bg-primary-subtle rounded-xl p-4">
            <p className="text-xs text-primary font-semibold uppercase tracking-wide">Appointment</p>
            <p className="text-lg font-semibold text-ink mt-1">{dateLabel}</p>
            <p className="text-ink">{viewing.time}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Confirmed by AI voice agent
            </span>
          </div>

          {/* Map */}
          {mapProps.length > 0 && <PropertyMap properties={mapProps} height={200} selectedId={viewing.propertyId} />}

          {/* Details */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-muted">Address</dt>
              <dd className="text-ink">{viewing.address}</dd>
            </div>
            {viewing.price ? (
              <div>
                <dt className="text-muted">Rent</dt>
                <dd className="text-ink">£{viewing.price.toLocaleString()}/mo</dd>
              </div>
            ) : null}
            {viewing.bedrooms !== undefined && (
              <div>
                <dt className="text-muted">Layout</dt>
                <dd className="text-ink">
                  {viewing.bedrooms === 0 ? "Studio" : `${viewing.bedrooms} bed`}
                  {viewing.bathrooms ? ` · ${viewing.bathrooms} bath` : ""}
                </dd>
              </div>
            )}
            {viewing.agentName && (
              <div>
                <dt className="text-muted">Agent</dt>
                <dd className="text-ink">{viewing.agentName}</dd>
              </div>
            )}
          </dl>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => onCall(viewing)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              📞 Replay AI call
            </button>
            {viewing.listingUrl && (
              <a
                href={viewing.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-xl border border-muted text-ink text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              >
                View on Rightmove →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
