"use client";

import { useState } from "react";
import { Card, Input } from "../ui";
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
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // ✅ Uses same PIN you store at login
  async function patchProperty(id: string, payload: any) {
    const pin = localStorage.getItem("Tripconnecta_admin_pin") || "";

    const res = await fetch(`/api/admin/properties/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": pin,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "Update failed");
    }
  }

  async function saveEdit() {
    if (!editId) return;
    setSaving(true);

    try {
      await patchProperty(editId, {
        title: editData.title,
        description: editData.description || null,
        suburb: editData.suburb,
        city: editData.city,
        nightly_rate: Number(editData.nightly_rate),
        max_guests: Number(editData.max_guests),
      });

      window.location.reload();
    } catch (e: any) {
      alert(e?.message || "Save failed");
      setSaving(false);
    }
  }

  async function archiveProperty(id: string) {
    const ok = confirm("Archive this property? It will be removed from listings.");
    if (!ok) return;

    try {
      await patchProperty(id, { status: "archived" });
      window.location.reload();
    } catch (e: any) {
      alert(e?.message || "Archive failed");
    }
  }

  async function restoreProperty(id: string) {
    const ok = confirm("Restore this property? It will be visible on listings again.");
    if (!ok) return;

    try {
      await patchProperty(id, { status: "approved" });
      window.location.reload();
    } catch (e: any) {
      alert(e?.message || "Restore failed");
    }
  }

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
    <div className="grid gap-4">
      {properties.map((p) => {
        const isBusy = busyId === p.id;
        const status = (p as any).status as string;
        const isArchived = status === "archived";

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
                  {status}
                </div>
              </div>

              <Input
                label="Admin note (optional)"
                value={notes[p.id] || ""}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                placeholder="e.g. Approved - business ready"
              />

              {/* ✅ ACTION BUTTONS */}
              <div className="flex flex-wrap gap-2">
                <Btn
                  disabled={isBusy || saving}
                  onClick={() => onApprove(p.id, notes[p.id] || "")}
                  variant="primary"
                >
                  {isBusy ? "Working..." : "Approve"}
                </Btn>

                <Btn
                  disabled={isBusy || saving}
                  onClick={() => onReject(p.id, notes[p.id] || "")}
                  variant="outline"
                >
                  {isBusy ? "Working..." : "Reject"}
                </Btn>

                <Btn
                  disabled={isBusy || saving}
                  onClick={() => {
                    setEditId(p.id);
                    setEditData(p);
                  }}
                  variant="outline"
                >
                  Edit
                </Btn>

                {/* ✅ Archive / Restore toggle */}
                {!isArchived ? (
                  <Btn
                    disabled={isBusy || saving}
                    onClick={() => archiveProperty(p.id)}
                    variant="outline"
                  >
                    Archive
                  </Btn>
                ) : (
                  <Btn
                    disabled={isBusy || saving}
                    onClick={() => restoreProperty(p.id)}
                    variant="outline"
                  >
                    Restore
                  </Btn>
                )}
              </div>

              {/* ✅ EDIT PANEL */}
              {editId === p.id && (
                <div className="border rounded p-3 bg-gray-50 mt-2 grid gap-2">
                  <div className="font-bold">Edit Property</div>

                  <Input
                    label="Title"
                    value={editData.title || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                  />

                  <Input
                    label="Description"
                    value={editData.description || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    placeholder="Short description"
                  />

                  <Input
                    label="Suburb"
                    value={editData.suburb || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, suburb: e.target.value })
                    }
                  />

                  <Input
                    label="City"
                    value={editData.city || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, city: e.target.value })
                    }
                  />

                  <Input
                    label="Nightly Rate"
                    value={editData.nightly_rate || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, nightly_rate: e.target.value })
                    }
                  />

                  <Input
                    label="Max Guests"
                    value={editData.max_guests || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, max_guests: e.target.value })
                    }
                  />

                  <div className="flex gap-2 mt-2">
                    <Btn disabled={saving || isBusy} onClick={saveEdit} variant="primary">
                      {saving ? "Saving..." : "Save"}
                    </Btn>
                    <Btn
                      disabled={saving || isBusy}
                      onClick={() => {
                        setEditId(null);
                        setEditData({});
                        setSaving(false);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}