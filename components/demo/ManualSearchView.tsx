"use client";

import { useState } from "react";
import { Property } from "@/lib/types";
import PropertyCard from "./PropertyCard";

interface ManualSearchViewProps {
  onAddMatch: (property: Property) => void;
  matchedIds: Set<string>;
}

export default function ManualSearchView({ onAddMatch, matchedIds }: ManualSearchViewProps) {
  const [query, setQuery] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          maxBudget: maxBudget ? Number.parseInt(maxBudget.replace(/\D/g, ""), 10) : undefined,
          minBedrooms: minBedrooms ? Number.parseInt(minBedrooms.replace(/\D/g, ""), 10) : undefined,
        }),
      });
      const data = await response.json();
      setResults(data.properties || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Manual search</h2>
        <p className="text-muted mt-1">
          Search listings directly. Ranked by Superlinked SIE semantic matching.
        </p>
      </div>

      <form onSubmit={runSearch} className="bg-bg rounded-xl border border-surface p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">What are you looking for?</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. quiet 1-bed with natural light near a park"
            className="w-full px-4 py-2.5 rounded-xl border border-muted bg-bg text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Max budget</label>
            <input
              type="text"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="£2,000"
              className="w-full px-4 py-2.5 rounded-xl border border-muted bg-bg text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Min bedrooms</label>
            <input
              type="text"
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-2.5 rounded-xl border border-muted bg-bg text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {searched && !loading && results.length === 0 && (
        <p className="text-center text-muted py-8">No listings match those filters.</p>
      )}

      {results.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {results.map((property) => {
            const added = matchedIds.has(property.id);
            return (
              <PropertyCard
                key={property.id}
                property={property}
                footer={
                  <button
                    onClick={() => onAddMatch(property)}
                    disabled={added}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      added
                        ? "bg-success/10 text-success cursor-default"
                        : "bg-primary text-white hover:bg-primary-hover"
                    }`}
                  >
                    {added ? "Added to matches" : "Add to matches"}
                  </button>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
