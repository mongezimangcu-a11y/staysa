"use client";

import { useState } from "react";
import { Card, Input } from "../ui";

export default function BookingsTable({
  bookings,
  onApprove,
  onDecline,
  onMarkPaid,
  busyId,
}: {
  bookings: any[];
  onApprove: (id: string, note?: string) => void;
  onDecline: (id: string, note?: string) => void;
  onMarkPaid: (id: string, note?: string) => void;
  busyId: string | null;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="grid gap-3">
      {bookings.map((b) => {
        const isBusy = busyId === b.id;

        return (
          <Card key={b.id}>
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-bold">{b.company_name || "Company (missing)"}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {(b.traveler_name || "Name")} • {(b.traveler_email || "Email")} • {(b.traveler_phone || "Phone")}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Dates: {b.check_in} → {b.check_out} • Guests: {b.guests}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Booking: <b>{b.booking_status}</b> • Payment: <b>{b.payment_status}</b> • Est: R{b.total_estimate}
                  </div>
                </div>

                <div className="text-xs rounded-full border px-2 py-1 bg-gray-50 text-gray-700">
                  {b.booking_status}/{b.payment_status}
                </div>
              </div>

              <Input
                label="Admin note (optional)"
                value={notes[b.id] || ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onApprove(b.id, notes[b.id] || "")}
                  className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                  {isBusy ? "Working..." : "Approve"}
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onDecline(b.id, notes[b.id] || "")}
                  className="rounded-xl border px-4 py-2 disabled:opacity-50"
                >
                  {isBusy ? "Working..." : "Decline"}
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onMarkPaid(b.id, notes[b.id] || "")}
                  className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                  {isBusy ? "Working..." : "Mark Paid"}
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
