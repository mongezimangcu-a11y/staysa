"use client";

import { useState } from "react";
import { Card, Button, OutlineButton, Input } from "../ui";
import type { Property } from "../../types";

export default function PropertiesTable({
  properties,
  onApprove,
  onReject,
  busyId,
}: {
  properties: Property[];
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, note?: string) => void;
  busyId: string | null;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="grid gap-3">
      {properties.map((p) => {
        const isBusy = busyId === p.id;
        return (
          <Card key={p.id}>
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-bold">{p.title}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {p.suburb}, {p.city} • R{p.nightly_rate}/night • Max {p.max_guests}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Host: {p.host_email}</div>
                </div>
                <div className="text-xs rounded-full border px-2 py-1 bg-gray-50 text-gray-700">
                  {p.status}
                </div>
              </div>

              <Input
                label="Admin note (optional)"
                value={notes[p.id] || ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))}
                placeholder="e.g. Approved - business ready"
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onApprove(p.id, notes[p.id] || "")}
                >
                  {isBusy ? "Working..." : "Approve"}
                </Button>

                <OutlineButton
                  type="button"
                  disabled={isBusy}
                  onClick={() => onReject(p.id, notes[p.id] || "")}
                >
                  {isBusy ? "Working..." : "Reject"}
                </OutlineButton>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
