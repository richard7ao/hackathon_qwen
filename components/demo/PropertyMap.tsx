"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Property } from "@/lib/types";

interface PropertyMapProps {
  properties: Property[];
  height?: number;
  selectedId?: string;
}

function ensureLeafletCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

export default function PropertyMap({ properties, height = 260, selectedId }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    ensureLeafletCss();
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const pts = properties.filter((p) => typeof p.lat === "number" && typeof p.lon === "number");

      // (Re)create the map.
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const map = L.map(containerRef.current, { scrollWheelZoom: false, attributionControl: false });
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

      const green = "oklch(0.52 0.17 145)";
      const latlngs: [number, number][] = [];
      pts.forEach((p) => {
        const isSel = p.id === selectedId;
        const marker = L.circleMarker([p.lat as number, p.lon as number], {
          radius: isSel ? 11 : 8,
          color: "#ffffff",
          weight: 2,
          fillColor: green,
          fillOpacity: isSel ? 1 : 0.85,
        }).addTo(map);
        marker.bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px">
             <strong>${p.title}</strong><br/>${p.address}<br/>
             <span style="color:${green};font-weight:600">£${p.price.toLocaleString()}/mo</span>
             ${p.listingUrl ? `<br/><a href="${p.listingUrl}" target="_blank" rel="noreferrer">View on Rightmove →</a>` : ""}
           </div>`,
        );
        if (isSel) marker.openPopup();
        latlngs.push([p.lat as number, p.lon as number]);
      });

      if (latlngs.length === 1) {
        map.setView(latlngs[0], 14);
      } else if (latlngs.length > 1) {
        map.fitBounds(latlngs, { padding: [30, 30] });
      } else {
        map.setView([51.5074, -0.1278], 11); // London fallback
      }
      // Fix sizing inside flex/animated containers.
      setTimeout(() => map.invalidateSize(), 150);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [properties, selectedId]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-xl overflow-hidden border border-surface z-0"
      role="img"
      aria-label="Map of matching properties"
    />
  );
}
