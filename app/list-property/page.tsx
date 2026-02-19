"use client";

import { useState } from "react";
import Shell from "../../components/Shell";
import { Button, Card, Input, Textarea } from "../../components/ui";

export default function ListPropertyPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    host_name: "",
    host_email: "",
    host_phone: "",
    title: "",
    description: "",
    suburb: "Sandton",
    city: "Johannesburg",
    province: "Gauteng",
    nightly_rate: "",
    max_guests: "1",
    amenities: "Wi-Fi, Workspace, Secure parking",
    images: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function submit() {
    setLoading(true);
    setMessage(null);

    const payload = {
      ...form,
      nightly_rate: Number(form.nightly_rate),
      max_guests: Number(form.max_guests),
      amenities: form.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      images: form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch("/api/host-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Submission failed");

      setMessage("✅ Submitted! We’ll review and approve your listing soon.");
      setForm((p) => ({ ...p, title: "", description: "", nightly_rate: "", images: "" }));
    } catch (e: any) {
      setMessage("⚠️ " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-extrabold tracking-tight">List Your Property</h2>
        <p className="mt-1 text-sm text-gray-600">
          Gauteng business-ready stays only. Your submission goes to admin review.
        </p>

        <div className="mt-6 grid gap-4">
          {message ? <Card>{message}</Card> : null}

          <Card>
            <div className="grid gap-3">
              <Input label="Host Name" value={form.host_name} onChange={(e) => set("host_name", e.target.value)} />
              <Input label="Host Email *" value={form.host_email} onChange={(e) => set("host_email", e.target.value)} />
              <Input label="Host Phone" value={form.host_phone} onChange={(e) => set("host_phone", e.target.value)} />

              <hr className="my-2" />

              <Input label="Listing Title *" value={form.title} onChange={(e) => set("title", e.target.value)} />
              <Textarea label="Description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Input label="Suburb *" value={form.suburb} onChange={(e) => set("suburb", e.target.value)} />
                <Input label="City *" value={form.city} onChange={(e) => set("city", e.target.value)} />
                <Input label="Province *" value={form.province} onChange={(e) => set("province", e.target.value)} />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input label="Nightly Rate (ZAR) *" value={form.nightly_rate} onChange={(e) => set("nightly_rate", e.target.value)} />
                <Input label="Max Guests" value={form.max_guests} onChange={(e) => set("max_guests", e.target.value)} />
              </div>

              <Textarea
                label="Amenities (comma separated)"
                rows={2}
                value={form.amenities}
                onChange={(e) => set("amenities", e.target.value)}
              />

              <Textarea
                label="Image URLs (comma separated for now)"
                rows={2}
                placeholder="https://...jpg, https://...jpg, https://...jpg"
                value={form.images}
                onChange={(e) => set("images", e.target.value)}
              />

              <Button type="button" disabled={loading} onClick={submit}>
                {loading ? "Submitting..." : "Submit for Approval"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
