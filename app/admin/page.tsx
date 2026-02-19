"use client";

import { useEffect, useState } from "react";
import Shell from "../../components/Shell";
import { Card, Button } from "../../components/ui";
import type { Property } from "../../types";
import PropertiesTable from "../../components/admin/PropertiesTable";
import BookingsTable from "../../components/admin/BookingsTable";

export default function AdminPage() {
  const [pin, setPin] = useState<string | null>(null);

  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("staysa_admin_pin");
    setPin(stored);
  }, []);

  async function loadProperties() {
    setLoadingProps(true);
    try {
      const res = await fetch("/api/admin/properties?status=pending_review", {
        headers: { "x-admin-pin": pin || "" },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load pending properties");
      setProperties(json.properties || []);
    } catch (e: any) {
      setMessage("⚠️ " + (e.message || "Failed to load properties"));
    } finally {
      setLoadingProps(false);
    }
  }

  async function loadBookings() {
    setLoadingBookings(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        headers: { "x-admin-pin": pin || "" },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load bookings");
      setBookings(json.bookings || []);
    } catch (e: any) {
      setMessage("⚠️ " + (e.message || "Failed to load bookings"));
    } finally {
      setLoadingBookings(false);
    }
  }

  async function refreshAll() {
    setMessage(null);
    await Promise.all([loadProperties(), loadBookings()]);
  }

  async function updatePropertyStatus(id: string, status: "approved" | "rejected", note?: string) {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin || "",
        },
        body: JSON.stringify({ status, admin_note: note || null }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || `Failed to update property (${res.status})`);

      setProperties((prev) => prev.filter((p) => p.id !== id));
      setMessage(status === "approved" ? "✅ Property approved" : "✅ Property rejected");
    } catch (e: any) {
      setMessage("⚠️ " + (e.message || "Property update failed"));
    } finally {
      setBusyId(null);
    }
  }

  async function updateBooking(id: string, update: any) {
    setBusyId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin || "",
        },
        body: JSON.stringify(update),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        // if API returns HTML or empty response, show it
        throw new Error(`API returned non-JSON (${res.status}): ${text.slice(0, 120)}`);
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Booking update failed (${res.status})`);
      }

      setBookings((prev) => prev.map((b) => (b.id === id ? json.booking : b)));
      setMessage("✅ Booking updated");
    } catch (e: any) {
      setMessage("⚠️ " + (e.message || "Booking update failed"));
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    if (pin) refreshAll();
  }, [pin]);

  if (!pin) {
    return (
      <Shell>
        <Card>
          <div className="font-bold">Admin PIN required</div>
          <div className="mt-1 text-sm text-gray-600">Go to Admin Login first.</div>
          <div className="mt-4">
            <Button href="/admin/login">Go to Login</Button>
          </div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Admin Panel</h2>
          <p className="mt-1 text-sm text-gray-600">Approve properties + manage bookings.</p>
        </div>
        <Button type="button" onClick={refreshAll} disabled={loadingProps || loadingBookings}>
          {loadingProps || loadingBookings ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {message ? <Card>{message}</Card> : null}

        <Card>
          <div className="text-lg font-bold">Pending Properties</div>
          <div className="mt-1 text-sm text-gray-600">Host submissions awaiting review.</div>

          <div className="mt-4">
            {loadingProps ? <div>Loading...</div> : null}
            {!loadingProps && properties.length === 0 ? <div>No pending properties.</div> : null}
            {!loadingProps && properties.length > 0 ? (
              <PropertiesTable
                properties={properties}
                busyId={busyId}
                onApprove={(id, note) => updatePropertyStatus(id, "approved", note)}
                onReject={(id, note) => updatePropertyStatus(id, "rejected", note)}
              />
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="text-lg font-bold">Bookings</div>
          <div className="mt-1 text-sm text-gray-600">Track approvals + payment status.</div>

          <div className="mt-4">
            {loadingBookings ? <div>Loading...</div> : null}
            {!loadingBookings && bookings.length === 0 ? <div>No bookings yet.</div> : null}
            {!loadingBookings && bookings.length > 0 ? (
              <BookingsTable
                bookings={bookings}
                busyId={busyId}
                onApprove={(id, note) =>
                  updateBooking(id, {
                    booking_status: "approved",
                    payment_status: "awaiting_payment",
                    admin_note: note || null,
                  })
                }
                onDecline={(id, note) =>
                  updateBooking(id, {
                    booking_status: "declined",
                    payment_status: "declined",
                    admin_note: note || null,
                  })
                }
                onMarkPaid={(id, note) =>
                  updateBooking(id, { payment_status: "paid", admin_note: note || null })
                }
              />
            ) : null}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
