"use client";

import React from "react";
import Shell from "../../../../components/Shell";
import { Button, Card } from "../../../../components/ui";

export default function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = (params as any)?.then
    ? React.use(params as Promise<{ id: string }>)
    : (params as { id: string });

  return (
    <Shell>
      <div className="max-w-xl">
        <h2 className="text-2xl font-extrabold tracking-tight">Booking Request Sent</h2>

        <div className="mt-6">
          <Card>
            ✅ Your booking request has been submitted.<br />
            Reference: <span className="font-mono">{resolvedParams.id}</span>
            <div className="mt-4 text-sm text-gray-600">
              We will confirm availability and send payment instructions (EFT) once approved.
            </div>

            <div className="mt-5 flex gap-3">
              <Button href="/listings">Back to Listings</Button>
              <Button href="/">Home</Button>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
