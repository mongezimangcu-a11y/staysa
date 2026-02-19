"use client";

import React, { useEffect, useState } from "react";
import Shell from "../../../components/Shell";
import { Button, Card, Input, Textarea, Badge } from "../../../components/ui";

export default function BookingPage({
  params,
}: {
  params: Promise<{ propertyId: string }> | { propertyId: string };
}) {
  const resolvedParams = (params as any)?.then
    ? React.use(params as Promise<{ propertyId: string }>)
    : (params as { propertyId: string });

  const propertyId = resolvedParams.propertyId;

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    traveler_name: "",
    traveler_email: "",
    traveler_phone: "",
    company_name: "",
    check_in: "",
    check_out: "",
    guests: "1",
    notes: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  useEffect(() => {
    async function loadProperty() {
      try {
        const res = await fetch(`/api/properties/${propertyId}`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Failed to load property");
        setProperty(json.property);
      } catch (e: any) {
        setMsg("⚠️ " + e.message);
      }
    }
    loadProperty();
  }, [propertyId]);

  async function submit() {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          ...form,
          guests: Number(form.guests),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Booking failed");

      window.location.href = `/booking/confirmation/${json.booking.id}`;
    } catch (e: any) {
      setMsg("⚠️ " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-extrabold tracking-tight">Request Booking</h2>

        {msg ? <div className="mt-4"><Card>{msg}</Card></div> : null}

        {property ? (
          <div className="mt-4">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold">{property.title}</div>
                  <div className="text-sm text-gray-600">
                    {property.suburb}, {property.city}
                  </div>
                </div>
                <Badge>R{property.nightly_rate}/night</Badge>
              </div>
            </Card>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <Card>
            <div className="grid gap-3">
              <Input label="Your Name" value={form.traveler_name} onChange={(e) => set("traveler_name", e.target.value)} />
              <Input label="Email" value={form.traveler_email} onChange={(e) => set("traveler_email", e.target.value)} />
              <Input label="Phone" value={form.traveler_phone} onChange={(e) => set("traveler_phone", e.target.value)} />
              <Input label="Company Name" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input label="Check-in" type="date" value={form.check_in} onChange={(e) => set("check_in", e.target.value)} />
                <Input label="Check-out" type="date" value={form.check_out} onChange={(e) => set("check_out", e.target.value)} />
              </div>

              <Input label="Guests" value={form.guests} onChange={(e) => set("guests", e.target.value)} />

              <Textarea label="Notes (optional)" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />

              <Button type="button" disabled={loading} onClick={submit}>
                {loading ? "Submitting..." : "Submit Booking Request"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
