"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input } from "../ui";

export default function BookingForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();

  const [form, setForm] = useState({
    traveler_name: "",
    traveler_email: "",
    traveler_phone: "",
    company_name: "",
    check_in: "",
    check_out: "",
    guests: 1,
    notes: "",
    website: "", // ✅ Honeypot (hidden field)
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          traveler_name: form.traveler_name.trim(),
          traveler_email: form.traveler_email.trim(),
          traveler_phone: form.traveler_phone.trim(),
          company_name: form.company_name.trim(),
          check_in: form.check_in,
          check_out: form.check_out,
          guests: Number(form.guests),
          notes: form.notes?.trim() || null,
          website: form.website, // ✅ Honeypot
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `Booking failed (${res.status})`);
      }

      // Redirect to confirmation page
      router.push(`/booking/confirmation/${json.booking.id}`);
    } catch (e: any) {
      setError(e?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={submit} className="grid gap-3">
        <div className="text-lg font-bold">Request a Booking</div>

        {/* ✅ Honeypot field (hidden) */}
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {error ? (
          <div className="text-sm rounded border border-red-200 bg-red-50 p-2 text-red-700">
            {error}
          </div>
        ) : null}

        <Input
          label="Full name"
          value={form.traveler_name}
          onChange={(e) => setForm((prev) => ({ ...prev, traveler_name: e.target.value }))}
          placeholder="e.g. Mongezi Mangcu"
          required
        />

        <Input
          label="Email"
          type="email"
          value={form.traveler_email}
          onChange={(e) => setForm((prev) => ({ ...prev, traveler_email: e.target.value }))}
          placeholder="e.g. mongezi@email.com"
          required
        />

        <Input
          label="Phone"
          value={form.traveler_phone}
          onChange={(e) => setForm((prev) => ({ ...prev, traveler_phone: e.target.value }))}
          placeholder="e.g. 072 123 4567"
          required
        />

        <Input
          label="Company name"
          value={form.company_name}
          onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))}
          placeholder="e.g. ABC Logistics"
          required
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Check-in"
            type="date"
            value={form.check_in}
            onChange={(e) => setForm((prev) => ({ ...prev, check_in: e.target.value }))}
            required
          />

          <Input
            label="Check-out"
            type="date"
            value={form.check_out}
            onChange={(e) => setForm((prev) => ({ ...prev, check_out: e.target.value }))}
            required
          />
        </div>

        <Input
          label="Guests"
          type="number"
          value={String(form.guests)}
          onChange={(e) => setForm((prev) => ({ ...prev, guests: Number(e.target.value || 1) }))}
          min={1}
          required
        />

        <Input
          label="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Anything we should know?"
        />

        <div className="mt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Booking Request"}
          </Button>
        </div>
      </form>
    </Card>
  );
}