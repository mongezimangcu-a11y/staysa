"use client";

import React, { useEffect, useState } from "react";
import Shell from "../../../components/Shell";
import { Button, Card, Badge } from "../../../components/ui";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = (params as any)?.then
    ? React.use(params as Promise<{ id: string }>)
    : (params as { id: string });

  const id = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMessage(null);

      try {
        const res = await fetch(`/api/properties/${id}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load property");
        }

        setProperty(json.property);
      } catch (e: any) {
        setMessage(e?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <Shell>
      <div className="max-w-3xl">
        {loading ? <Card>Loading...</Card> : null}

        {!loading && message ? (
          <Card>⚠️ {message}</Card>
        ) : null}

        {!loading && property ? (
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">{property.title}</h2>
                <div className="mt-1 text-sm text-gray-600">
                  {property.suburb}, {property.city}, {property.province}
                </div>
              </div>
              <Badge>R{property.nightly_rate}/night</Badge>
            </div>

            {property.description ? (
              <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                {property.description}
              </div>
            ) : null}

            {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
              <div className="mt-4">
                <div className="text-sm font-bold">Amenities</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                  {property.amenities.map((a: string, idx: number) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {Array.isArray(property.images) && property.images.length > 0 ? (
              <div className="mt-4">
                <div className="text-sm font-bold">Photos</div>
                <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {property.images.slice(0, 6).map((url: string, idx: number) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={idx}
                      src={url}
                      alt={`Property photo ${idx + 1}`}
                      className="h-40 w-full rounded-xl object-cover border"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex gap-3">
              <Button href={`/booking/${property.id}`}>Request Booking</Button>
              <Button href="/listings">Back to Listings</Button>
            </div>
          </Card>
        ) : null}
      </div>
    </Shell>
  );
}
