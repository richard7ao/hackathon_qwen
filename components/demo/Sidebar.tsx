"use client";

import Link from "next/link";

export type DemoView = "chat" | "overview" | "search" | "viewed" | "booked";

interface SidebarProps {
  active: DemoView;
  onSelect: (view: DemoView) => void;
  counts: {
    matches: number;
    viewed: number;
    booked: number;
  };
}

const items: { id: DemoView; label: string; icon: JSX.Element }[] = [
  {
    id: "chat",
    label: "Chat bot",
    icon: (
      <path d="M4 4h16v12H8l-4 4V4z" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
    ),
  },
  {
    id: "overview",
    label: "Overview",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.6" fill="none" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.6" fill="none" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.6" fill="none" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.6" fill="none" />
      </>
    ),
  },
  {
    id: "search",
    label: "Manual search",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" strokeWidth="1.6" fill="none" />
        <path d="M20 20l-3.5-3.5" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "viewed",
    label: "Viewed properties",
    icon: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeWidth="1.6" fill="none" />
        <circle cx="12" cy="12" r="3" strokeWidth="1.6" fill="none" />
      </>
    ),
  },
  {
    id: "booked",
    label: "Booked viewings",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" strokeWidth="1.6" fill="none" />
        <path d="M3 9h18M8 2v4M16 2v4" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
];

export default function Sidebar({ active, onSelect, counts }: SidebarProps) {
  const badge = (id: DemoView) => {
    if (id === "viewed" && counts.matches > 0) return counts.matches;
    if (id === "booked" && counts.booked > 0) return counts.booked;
    return null;
  };

  return (
    <aside className="w-full md:w-64 shrink-0 bg-surface border-r border-bg flex flex-col">
      <div className="px-5 h-16 flex items-center border-b border-bg">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
            R
          </span>
          <span className="font-semibold tracking-tight">RentalFinder AI</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const isActive = active === item.id;
          const count = badge(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-out-quart ${
                isActive
                  ? "bg-primary text-white"
                  : "text-ink hover:bg-primary-subtle"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                stroke={isActive ? "white" : "currentColor"}
                fill="none"
                className="shrink-0"
              >
                {item.icon}
              </svg>
              <span className="flex-1 text-left">{item.label}</span>
              {count !== null && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-bg">
        <div className="rounded-lg bg-primary-subtle p-3">
          <p className="text-xs font-semibold text-primary">Powered by</p>
          <p className="text-xs text-muted mt-1">
            Superlinked SIE routing · Qwen3 voice · Alibaba Cloud
          </p>
        </div>
      </div>
    </aside>
  );
}
