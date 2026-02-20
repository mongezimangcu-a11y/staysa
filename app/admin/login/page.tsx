"use client";

import { useState } from "react";
import Shell from "../../../components/Shell";
import { Button, Card, Input } from "../../../components/ui";

export default function AdminLoginPage() {
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function login() {
    if (!pin.trim()) {
      setMsg("⚠️ Enter PIN");
      return;
    }
    localStorage.setItem("Tripconnecta_admin_pin", pin.trim());
    window.location.href = "/admin";
  }

  return (
    <Shell>
      <div className="max-w-md">
        <h2 className="text-2xl font-extrabold tracking-tight">Admin Login</h2>
        <p className="mt-1 text-sm text-gray-600">Enter your admin PIN.</p>

        <div className="mt-6 grid gap-4">
          {msg ? <Card>{msg}</Card> : null}

          <Card>
            <div className="grid gap-3">
              <Input
                label="Admin PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g. 1234"
              />
              <Button type="button" onClick={login}>Continue</Button>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
