"use client";

import { Property, Outreach } from "@/lib/types";

interface DashboardProps {
  preferences: Record<string, string | number | string[]>;
  properties: Property[];
  outreach: Outreach[];
}

function StatusBadge({ status }: { status: Outreach["status"] }) {
  const styles = {
    pending: "bg-warning/10 text-warning",
    sent: "bg-primary-subtle text-primary",
    confirmed: "bg-success/10 text-success",
    failed: "bg-error/10 text-error",
  };

  const labels = {
    pending: "Pending",
    sent: "Sent",
    confirmed: "Confirmed",
    failed: "Failed",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "confirmed" ? "bg-success" : status === "failed" ? "bg-error" : status === "sent" ? "bg-primary" : "bg-warning"}`} />
      {labels[status]}
    </span>
  );
}

export default function Dashboard({ preferences, properties, outreach }: DashboardProps) {
  const confirmedViewings = outreach.filter((o) => o.status === "confirmed").length;
  const pendingOutreach = outreach.filter((o) => o.status === "pending" || o.status === "sent").length;

  return (
    <div className="flex flex-col h-full bg-surface">
      <header className="px-6 py-4 border-b border-bg bg-bg">
        <h2 className="text-lg font-semibold text-ink">Dashboard</h2>
        <p className="text-sm text-muted">Live view of your search and bookings.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-bg rounded-xl p-4 border border-surface">
            <p className="text-xs text-muted uppercase tracking-wide">Matches</p>
            <p className="text-2xl font-semibold text-ink mt-1">{properties.length}</p>
          </div>
          <div className="bg-bg rounded-xl p-4 border border-surface">
            <p className="text-xs text-muted uppercase tracking-wide">Outreach</p>
            <p className="text-2xl font-semibold text-ink mt-1">{outreach.length}</p>
          </div>
          <div className="bg-bg rounded-xl p-4 border border-surface">
            <p className="text-xs text-muted uppercase tracking-wide">Viewings</p>
            <p className="text-2xl font-semibold text-success mt-1">{confirmedViewings}</p>
          </div>
        </div>

        {/* Preferences */}
        {Object.keys(preferences).length > 0 && (
          <section className="bg-bg rounded-xl p-5 border border-surface">
            <h3 className="text-sm font-semibold text-ink mb-3">Your preferences</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {Object.entries(preferences).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-muted capitalize">{key.replace(/([A-Z])/g, " $1")}</dt>
                  <dd className="font-medium text-ink">{Array.isArray(value) ? value.join(", ") : value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Properties */}
        {properties.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-ink mb-3">Top matches</h3>
            <div className="space-y-3">
              {properties.map((property) => (
                <div key={property.id} className="bg-bg rounded-xl p-4 border border-surface flex gap-4">
                  <div
                    className="w-20 h-20 rounded-lg shrink-0"
                    style={{ backgroundColor: property.imageColor }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-ink truncate">{property.title}</h4>
                    <p className="text-sm text-muted truncate">{property.address}</p>
                    <p className="text-sm text-ink mt-1 font-medium">
                      ${property.price.toLocaleString()} · {property.bedrooms} bed · {property.bathrooms} bath
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Available {new Date(property.availableFrom).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Outreach timeline */}
        {outreach.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-ink mb-3">Outreach timeline</h3>
            <div className="space-y-3">
              {outreach.map((item) => (
                <div key={item.id} className="bg-bg rounded-xl p-4 border border-surface flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.propertyTitle}</p>
                    <p className="text-xs text-muted capitalize mt-0.5">
                      {item.channel} outreach · {item.scheduledAt ? `Viewing ${new Date(item.scheduledAt).toLocaleString()}` : "Awaiting landlord response"}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </section>
        )}

        {properties.length === 0 && outreach.length === 0 && Object.keys(preferences).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted text-sm">Start a conversation in the chat to see your matches here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
