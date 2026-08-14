"use client";

import { Property, PropertyDecision } from "@/lib/types";
import { DemoView } from "./Sidebar";

interface ViewedPropertiesViewProps {
  matches: Property[];
  decisions: Record<string, PropertyDecision>;
  onDecide: (property: Property, decision: PropertyDecision) => void;
  onNavigate: (view: DemoView) => void;
}

export default function ViewedPropertiesView({
  matches,
  decisions,
  onDecide,
  onNavigate,
}: ViewedPropertiesViewProps) {
  const pending = matches.filter((p) => !decisions[p.id]);
  const current = pending[0];
  const liked = matches.filter((p) => decisions[p.id] === "yes");
  const passed = matches.filter((p) => decisions[p.id] === "no");

  if (matches.length === 0) {
    return (
      <div className="max-w-3xl mx-auto w-full px-6 py-8">
        <h2 className="text-2xl font-bold text-ink">Viewed properties</h2>
        <div className="text-center py-16">
          <p className="text-muted mb-4">No matches to review yet.</p>
          <button
            onClick={() => onNavigate("chat")}
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Find matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-ink">Viewed properties</h2>
        <p className="text-muted mt-1">
          Yes books a viewing (the voice agent calls the landlord). No skips it.
        </p>
      </div>

      {current ? (
        <div className="bg-bg rounded-2xl border border-surface overflow-hidden shadow-sm">
          <div className="h-56 relative" style={{ backgroundColor: current.imageColor }} aria-hidden="true">
            <span className="absolute top-4 left-4 text-sm font-semibold px-3 py-1.5 rounded-full bg-bg/85 text-ink">
              ${current.price.toLocaleString()}/mo
            </span>
            <span className="absolute top-4 right-4 text-xs font-medium px-2.5 py-1 rounded-full bg-bg/85 text-muted">
              {pending.length} left
            </span>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-ink">{current.title}</h3>
            <p className="text-muted mt-1">{current.address}</p>
            <div className="flex gap-4 mt-3 text-sm text-ink">
              <span>{current.bedrooms === 0 ? "Studio" : `${current.bedrooms} bed`}</span>
              <span>{current.bathrooms} bath</span>
              <span>Available {new Date(current.availableFrom).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => onDecide(current, "no")}
                className="flex-1 py-3 rounded-xl border border-muted text-ink font-medium hover:border-error hover:text-error transition-colors"
              >
                ✕ No thanks
              </button>
              <button
                onClick={() => onDecide(current, "yes")}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
              >
                ✓ Yes, book a viewing
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-primary-subtle rounded-2xl p-8 text-center">
          <p className="font-semibold text-ink">All caught up!</p>
          <p className="text-sm text-muted mt-1">
            You reviewed every match. {liked.length} booked, {passed.length} skipped.
          </p>
          <button
            onClick={() => onNavigate("booked")}
            className="mt-4 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            See booked viewings
          </button>
        </div>
      )}

      {(liked.length > 0 || passed.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-success mb-2">Liked ({liked.length})</h4>
            <ul className="space-y-1.5">
              {liked.map((p) => (
                <li key={p.id} className="text-sm text-ink bg-success/5 rounded-lg px-3 py-2">
                  {p.title}
                </li>
              ))}
              {liked.length === 0 && <li className="text-sm text-muted">None yet</li>}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-muted mb-2">Passed ({passed.length})</h4>
            <ul className="space-y-1.5">
              {passed.map((p) => (
                <li key={p.id} className="text-sm text-muted bg-surface rounded-lg px-3 py-2">
                  {p.title}
                </li>
              ))}
              {passed.length === 0 && <li className="text-sm text-muted">None yet</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
