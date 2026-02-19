"use client";

import { useEffect, useState } from "react";
import Shell from "../../components/Shell";
import PropertyCard from "../../components/PropertyCard";
import { Card } from "../../components/ui";
import { Property } from "../../types";



export default function ListingsPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/properties");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load properties");
      setProperties(json.properties || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Shell>
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Listings</h2>
        <p className="mt-1 text-sm text-gray-600">Approved business travel stays in Gauteng.</p>
      </div>

      <div className="mt-6 grid gap-4">
        {loading ? <Card>Loading...</Card> : null}
        {error ? <Card>⚠️ {error}</Card> : null}
        {!loading && !error && properties.length === 0 ? (
          <Card>No approved properties yet. Submit one via “List Property”.</Card>
        ) : null}

        {properties.map((p) => (
          <PropertyCard key={p.id} p={p} />
        ))}
      </div>
    </Shell>
  );
}
