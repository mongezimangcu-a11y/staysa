"use client";

import { useState } from "react";
import { Card, Input } from "../ui";

function getBookingRef(b: any) {
  // Use stored booking_reference if present, else generate from id
  const id = String(b?.id || "");
  return b?.booking_reference || (id ? `TC-${id.slice(-6).toUpperCase()}` : "TC-UNKNOWN");
}

function buildEftText(bookingRef: string) {
  const template =
    process.env.NEXT_PUBLIC_EFT_INSTRUCTIONS ||
    "EFT PAYMENT INSTRUCTIONS\nReference: {BOOKING_REF}\n\n(Replace this with your bank details in NEXT_PUBLIC_EFT_INSTRUCTIONS)";
  return template.replaceAll("{BOOKING_REF}", bookingRef);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied ✅");
  } catch {
    alert("Could not copy. Please copy manually.");
  }
}

export default function BookingsTable({
  bookings,
  onApprove,
  onDecline,
  onMarkPaid,
  onArchive,
  busyId,
}: {
  bookings: any[];
  onApprove: (id: string, note?: string) => void;
  onDecline: (id: string, note?: string) => void;
  onMarkPaid: (id: string, note?: string) => void;
  onArchive: (id: string, note?: string) => void;
  busyId: string | null;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  function Btn({
    children,
    onClick,
    disabled,
    variant = "primary",
  }: {
    children: any;
    onClick: () => void;
    disabled?: boolean;
    variant?: "primary" | "outline";
  }) {
    const base = "px-4 py-2 rounded-lg text-sm font-medium transition border";
    const primary = "bg-black text-white border-black hover:opacity-90";
    const outline = "bg-white text-black border-gray-300 hover:bg-gray-50";

    return (
      <button
        type="button"
        className={`${base} ${variant === "primary" ? primary : outline} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="grid gap-3">
      {bookings.map((b) => {
        const isBusy = busyId === b.id;
        const isArchived = b.archived === true;
        const bookingRef = getBookingRef(b);

        return (
          <Card key={b.id}>
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-bold">{b.company_name || "Booking"}</div>
                  <div className="mt-1 text-sm text-gray-700">
                    {b.traveler_name} • {b.traveler_email} • {b.traveler_phone}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    Dates: {b.check_in} → {b.check_out} • Guests: {b.guests}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    Booking: {b.booking_status} • Payment: {b.payment_status} • Est: R{b.total_estimate}
                  </div>

                  <div className="mt-2 text-xs font-semibold text-gray-800">
                    Booking Ref: {bookingRef}
                  </div>

                  {isArchived ? (
                    <div className="mt-2 text-xs font-semibold text-gray-600">Archived</div>
                  ) : null}
                </div>

                <div className="text-xs rounded-full border px-2 py-1 bg-gray-50 text-gray-700">
                  {b.booking_status}/{b.payment_status}
                </div>
              </div>

              <Input
                label="Admin note (optional)"
                value={notes[b.id] || ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                placeholder="e.g. Paid via EFT, confirmed checkout"
              />

              <div className="flex flex-wrap gap-2">
                <Btn
                  disabled={isBusy || isArchived}
                  onClick={() => onApprove(b.id, notes[b.id] || "")}
                  variant="primary"
                >
                  {isBusy ? "Working..." : "Approve"}
                </Btn>

                <Btn
                  disabled={isBusy || isArchived}
                  onClick={() => onDecline(b.id, notes[b.id] || "")}
                  variant="outline"
                >
                  Decline
                </Btn>

                <Btn
                  disabled={isBusy || isArchived}
                  onClick={() => onMarkPaid(b.id, notes[b.id] || "")}
                  variant="primary"
                >
                  Mark Paid
                </Btn>

                <Btn
                  disabled={isBusy}
                  onClick={() => copyToClipboard(buildEftText(bookingRef))}
                  variant="outline"
                >
                  Copy EFT Instructions
                </Btn>

                <Btn
                  disabled={isBusy || isArchived}
                  onClick={() => {
                    const ok = confirm("Archive this booking? This cannot be undone.");
                    if (!ok) return;
                    onArchive(b.id, notes[b.id] || "");
                  }}
                  variant="outline"
                >
                  Archive
                </Btn>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}