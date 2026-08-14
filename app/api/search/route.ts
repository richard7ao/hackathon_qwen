import { NextRequest, NextResponse } from "next/server";
import { mockProperties } from "@/lib/mock-data";
import { encode, cosineSimilarity } from "@/lib/sie";

export async function POST(req: NextRequest) {
  try {
    const { query, maxBudget, minBedrooms }: { query?: string; maxBudget?: number; minBedrooms?: number } =
      await req.json();

    let results = mockProperties.slice();

    // Hard filters.
    if (typeof maxBudget === "number" && maxBudget > 0) {
      results = results.filter((p) => p.price <= maxBudget * 1.15);
    }
    if (typeof minBedrooms === "number" && minBedrooms >= 0) {
      results = results.filter((p) => p.bedrooms >= minBedrooms);
    }

    // Semantic ranking via SIE embeddings when a query is present.
    if (query && query.trim() && results.length > 0) {
      try {
        const propertyTexts = results.map(
          (p) =>
            `${p.title}. ${p.address}. $${p.price} per month. ${p.bedrooms} bed, ${p.bathrooms} bath. Available ${p.availableFrom}.`,
        );
        const embeddings = await encode([query, ...propertyTexts]);
        const queryVector = embeddings[0];
        const propertyVectors = embeddings.slice(1);

        results = results
          .map((property, index) => ({
            property,
            score: cosineSimilarity(queryVector, propertyVectors[index]),
          }))
          .sort((a, b) => b.score - a.score)
          .map(({ property }) => property);
      } catch {
        // Fall back to price sort if embeddings fail.
        results.sort((a, b) => a.price - b.price);
      }
    } else {
      results.sort((a, b) => a.price - b.price);
    }

    return NextResponse.json({ properties: results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ properties: [] }, { status: 500 });
  }
}
