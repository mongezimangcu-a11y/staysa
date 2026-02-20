"use client";

import { useEffect, useMemo, useState } from "react";
import Shell from "../../components/Shell";
import { Card, Button, Input } from "../../components/ui";
import type { Property } from "../../types";

import PropertiesTable from "../../components/admin/PropertiesTable";
import BookingsTable from "../../components/admin/BookingsTable";

export default function AdminPage() {
  const [pin, setPin] = useState<string | null>(null);

  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const [allFilter, setAllFilter] = useState<string>("all");
  const [showArchivedBookings, setShowArchivedBookings] = useState(false);

  // ✅ NEW: booking filters
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");

  useEffect(() => {
    const stored = localStorage.getItem("Tripconnecta_admin_pin");
    setPin(stored);
  }, []);

  async function loadPendingProperties() {
    setLoadingProps(true);
    try {
      const res = await fetch("/api/admin/properties?status=pending_review", {
        headers: { "x-admin-pin": pin || "" },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setPendingProperties(json.properties || []);
    } catch (e: any) {
      setMessage("⚠️ " + (e.message || "Failed to load pending properties"));
    } finally {
      setLoadingProps(false);
    }
  }

  async function loadAllProperties(filterStatus: string) {
    try {
      const headers = { "x-admin-pin": pin || "" };

      if (filterStatus === "all") {
        const statuses = ["approved", "pending_review", "rejected", "archived"];
        const results = await Promise.all(
          statuses.map(async (s) => {
            const r = await fetch(`/api/admin/properties?status=${s}`, { headers });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error);
            return j.properties || [];
          })
        );
        const merged = results.flat();
        merged.sort((a: any, b: any) =>
          (b.created_at || "").localeCompare(a.created_at || "")
        );
        setAllProperties(merged);
        return;
      }

      const res = await fetch(`/api/admin/properties?status=${filterStatus}`, {
        headers,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setAllProperties(json.properties || []);
    } catch (e: any) {
      setMessage("⚠️ " + (e.message || "Failed to load properties"));
      setAllProperties([]);
    }
  }

  async function loadBookings() {
    setLoadingBookings(true);
    try {
      const qs = showArchivedBookings ? "?archived=true" : "";
      const res = await fetch(`/api/admin/bookings${qs}`, {
        headers: { "x-admin-pin": pin || "" },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setBookings(json.bookings || []);
    } catch (e: any) {
      setMessage("⚠️ " + (e.message || "Failed to load bookings"));
    } finally {
      setLoadingBookings(false);
    }
  }

  async function refreshAll() {
    setMessage(null);
    await Promise.all([
      loadPendingProperties(),
      loadAllProperties(allFilter),
      loadBookings(),
    ]);
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

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setPendingProperties((prev) => prev.filter((p) => p.id !== id));
      await loadAllProperties(allFilter);

      setMessage("✅ Property updated");
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

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      if (update.archived && !showArchivedBookings) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } else {
        setBookings((prev) => prev.map((b) => (b.id === id ? json.booking : b)));
      }

      setMessage("✅ Booking updated");
    } catch (e: any) {
      setMessage("⚠️ " + (e.message || "Booking update failed"));
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    if (!pin) return;
    refreshAll();
    // eslint-disable-next-line
  }, [pin]);

  useEffect(() => {
    if (!pin) return;
    loadBookings();
    // eslint-disable-next-line
  }, [showArchivedBookings]);

  useEffect(() => {
    if (!pin) return;
    loadAllProperties(allFilter);
    // eslint-disable-next-line
  }, [allFilter]);

  // ✅ NEW: filter bookings client-side
  const filteredBookings = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase();

    return (bookings || []).filter((b: any) => {
      if (bookingStatusFilter !== "all" && b.booking_status !== bookingStatusFilter) return false;
      if (paymentStatusFilter !== "all" && b.payment_status !== paymentStatusFilter) return false;

      if (!q) return true;

      const haystack = [
        b.booking_reference,
        b.company_name,
        b.traveler_name,
        b.traveler_email,
        b.traveler_phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [bookings, bookingSearch, bookingStatusFilter, paymentStatusFilter]);

  if (!pin) {
    return (
      <Shell>
        <Card>
          <div className="font-bold">Admin PIN required</div>
          <Button href="/admin/login">Go to Login</Button>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Admin Panel</h2>
          <p className="text-sm text-gray-600">Approve properties + manage bookings.</p>
        </div>
        <Button onClick={refreshAll}>Refresh</Button>
      </div>

      <div className="mt-6 grid gap-4">
        {message && <Card>{message}</Card>}

        <Card>
          <div className="font-bold text-lg">Pending Properties</div>
          {loadingProps ? (
            <div>Loading...</div>
          ) : pendingProperties.length === 0 ? (
            <div>No pending properties.</div>
          ) : (
            <PropertiesTable
              properties={pendingProperties}
              busyId={busyId}
              onApprove={(id, note) => updatePropertyStatus(id, "approved", note)}
              onReject={(id, note) => updatePropertyStatus(id, "rejected", note)}
            />
          )}
        </Card>

        <Card>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-lg">All Properties</div>
              <div className="text-sm text-gray-600">View approved/pending/rejected/archived properties.</div>
            </div>

            <select
              value={allFilter}
              onChange={(e) => setAllFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending_review">Pending review</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="mt-4">
            {allProperties.length === 0 ? (
              <div>No properties found for this filter.</div>
            ) : (
              <PropertiesTable
                properties={allProperties}
                busyId={busyId}
                onApprove={(id, note) => updatePropertyStatus(id, "approved", note)}
                onReject={(id, note) => updatePropertyStatus(id, "rejected", note)}
              />
            )}
          </div>
        </Card>

        <Card>
          <div className="font-bold text-lg">Bookings</div>
          <div className="mt-1 text-sm text-gray-600">Track approvals + payment status.</div>

          {/* ✅ NEW: filters */}
          <div className="mt-3 grid gap-2">
            <Input
              label="Search bookings"
              placeholder="Search by company, traveler, email, phone, booking ref..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
            />

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Booking</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Payment</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="awaiting_payment">Awaiting payment</option>
                  <option value="paid">Paid</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showArchivedBookings}
                  onChange={(e) => setShowArchivedBookings(e.target.checked)}
                />
                Show archived bookings
              </label>
            </div>
          </div>

          <div className="mt-4">
            {loadingBookings ? (
              <div>Loading...</div>
            ) : filteredBookings.length === 0 ? (
              <div>No bookings found.</div>
            ) : (
              <BookingsTable
                bookings={filteredBookings}
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
                  updateBooking(id, {
                    payment_status: "paid",
                    admin_note: note || null,
                  })
                }
                onArchive={(id, note) =>
                  updateBooking(id, {
                    archived: true,
                    admin_note: note || null,
                  })
                }
              />
            )}
          </div>
        </Card>
      </div>
    </Shell>
  );
}