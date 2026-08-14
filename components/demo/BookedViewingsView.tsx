"use client";

import { useState } from "react";
import { Viewing } from "@/lib/types";
import { DemoView } from "./Sidebar";
import ViewingDetailsModal from "./ViewingDetailsModal";

interface BookedViewingsViewProps {
  viewings: Viewing[];
  onNavigate: (view: DemoView) => void;
  onCall: (viewing: Viewing) => void;
}

function startOfMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function BookedViewingsView({
  viewings,
  onNavigate,
  onCall,
}: BookedViewingsViewProps) {
  const [selected, setSelected] = useState<Viewing | null>(null);

  // Anchor calendar on the month of the first viewing, else current month.
  const anchor = viewings.length > 0 ? new Date(viewings[0].date) : new Date();
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const cells = startOfMonthGrid(year, month);
  const monthLabel = anchor.toLocaleString("default", { month: "long", year: "numeric" });

  const viewingsByDay = new Map<number, Viewing[]>();
  for (const v of viewings) {
    const d = new Date(v.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      viewingsByDay.set(day, [...(viewingsByDay.get(day) || []), v]);
    }
  }

  if (viewings.length === 0) {
    return (
      <div className="max-w-3xl mx-auto w-full px-6 py-8">
        <h2 className="text-2xl font-bold text-ink">Booked viewings</h2>
        <div className="text-center py-16">
          <p className="text-muted mb-4">No viewings booked yet.</p>
          <button
            onClick={() => onNavigate("viewed")}
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Review matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-ink">Booked viewings</h2>
        <p className="text-muted mt-1">Your confirmed viewings, booked by the AI voice agent.</p>
      </div>

      {/* Calendar */}
      <div className="bg-bg rounded-2xl border border-surface p-5">
        <h3 className="font-semibold text-ink mb-4">{monthLabel}</h3>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-xs font-medium text-muted py-2">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            const dayViewings = day ? viewingsByDay.get(day) : null;
            const hasViewing = dayViewings && dayViewings.length > 0;
            if (hasViewing) {
              return (
                <button
                  key={i}
                  onClick={() => setSelected(dayViewings![0])}
                  className="aspect-square rounded-lg text-sm flex flex-col items-center justify-center relative border border-primary bg-primary text-white font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
                  title={dayViewings![0].propertyTitle}
                >
                  <span>{day}</span>
                  <span className="text-[9px] leading-tight mt-0.5 px-1 text-center">
                    {dayViewings![0].time}
                  </span>
                </button>
              );
            }
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg text-sm flex items-center justify-center ${
                  day ? "border border-surface text-ink" : ""
                }`}
              >
                {day && <span>{day}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Viewing list */}
      <div className="space-y-3">
        <p className="text-xs text-muted">Tap a viewing for full details.</p>
        {viewings.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelected(v)}
            className="w-full text-left bg-bg rounded-xl border border-surface p-4 flex items-center justify-between gap-4 hover:border-primary transition-colors"
          >
            <div className="min-w-0">
              <p className="font-medium text-ink truncate">{v.propertyTitle}</p>
              <p className="text-sm text-muted truncate">{v.address}</p>
              <p className="text-sm text-ink mt-1">
                {new Date(v.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                at {v.time}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success" /> Confirmed
              </span>
              <span className="text-xs font-medium text-primary">View details →</span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <ViewingDetailsModal
          viewing={selected}
          onClose={() => setSelected(null)}
          onCall={(v) => {
            setSelected(null);
            onCall(v);
          }}
        />
      )}
    </div>
  );
}
