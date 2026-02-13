"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PlanInterval } from "@/lib/stripe";

export function CheckoutButton({
  plan,
  label,
}: {
  plan: PlanInterval;
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleCheckout} loading={loading} variant="outline">
      {label}
    </Button>
  );
}

export function PortalButton() {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handlePortal} loading={loading} variant="ghost" size="sm">
      Manage Subscription
    </Button>
  );
}
