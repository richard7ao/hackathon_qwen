"use client";

import { Preferences, Property, Viewing } from "@/lib/types";
import { DemoView } from "./Sidebar";

interface OverviewViewProps {
  preferences: Preferences;
  matches: Property[];
  decidedCount: number;
  viewings: Viewing[];
  onNavigate: (view: DemoView) => void;
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="bg-bg rounded-xl p-5 border border-surface">
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${accent ? "text-success" : "text-ink"}`}>{value}</p>
    </div>
  );
}

export default function OverviewView({
  preferences,
  matches,
  decidedCount,
  viewings,
  onNavigate,
}: OverviewViewProps) {
  const hasPrefs = Object.keys(preferences).length > 0;

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-ink">Overview</h2>
        <p className="text-muted mt-1">Your rental search at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Matches" value={matches.length} />
        <Stat label="Reviewed" value={decidedCount} />
        <Stat label="Booked" value={viewings.length} accent />
        <Stat
          label="Budget"
          value={preferences.budget ? `£${preferences.budget.toLocaleString()}` : "—"}
        />
      </div>

      <section className="bg-bg rounded-xl p-6 border border-surface">
        <h3 className="font-semibold text-ink mb-4">Your preferences</h3>
        {hasPrefs ? (
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {preferences.location && (
              <Row label="Location" value={preferences.location} />
            )}
            {preferences.budget && (
              <Row label="Budget" value={`£${preferences.budget.toLocaleString()} / month`} />
            )}
            {preferences.bedrooms !== undefined && (
              <Row label="Bedrooms" value={preferences.bedrooms === 0 ? "Studio" : String(preferences.bedrooms)} />
            )}
            {preferences.moveInDate && <Row label="Move-in" value={preferences.moveInDate} />}
            {preferences.mustHaves && preferences.mustHaves.length > 0 && (
              <Row label="Must-haves" value={preferences.mustHaves.join(", ")} />
            )}
          </dl>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted text-sm mb-4">
              No preferences yet. Start with the chat bot to tell us what you need.
            </p>
            <button
              onClick={() => onNavigate("chat")}
              className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Start the chat
            </button>
          </div>
        )}
      </section>

      {matches.length > 0 && (
        <section className="bg-primary-subtle rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-ink">
              {matches.length} matches ready to review
            </h3>
            <p className="text-sm text-muted mt-1">Swipe through them in Viewed properties.</p>
          </div>
          <button
            onClick={() => onNavigate("viewed")}
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shrink-0"
          >
            Review now
          </button>
        </section>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-surface pb-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
