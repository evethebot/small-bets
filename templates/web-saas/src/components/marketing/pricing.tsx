"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BillingInterval = "monthly" | "yearly";

export function Pricing() {
  const t = useTranslations("pricing");
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const plans = [
    {
      id: "free",
      name: t("free.name"),
      price: t("free.price"),
      description: t("free.description"),
      features: t.raw("free.features") as string[],
      cta: t("subscribe"),
      popular: false,
    },
    {
      id: "pro",
      name: t("pro.name"),
      price: interval === "monthly" ? t("pro.priceMonthly") : t("pro.priceYearly"),
      priceLabel: interval === "monthly" ? t("perMonth") : t("perMonth"),
      description: t("pro.description"),
      features: t.raw("pro.features") as string[],
      cta: t("subscribe"),
      popular: true,
    },
    {
      id: "lifetime",
      name: t("lifetime.name"),
      price: t("lifetime.price"),
      priceLabel: t("oneTime"),
      description: t("lifetime.description"),
      features: t.raw("lifetime.features") as string[],
      cta: t("subscribe"),
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="border-t border-gray-200/60 py-24 dark:border-gray-800/60">
      <div className="container-wide">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Interval toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => setInterval("monthly")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              interval === "monthly"
                ? "bg-brand-600 text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            )}
          >
            {t("monthly")}
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              interval === "yearly"
                ? "bg-brand-600 text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            )}
          >
            {t("yearly")}
            <Badge variant="success" className="ml-2">
              {t("yearlyDiscount")}
            </Badge>
          </button>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8",
                plan.popular
                  ? "border-brand-500 bg-white shadow-xl dark:border-brand-400 dark:bg-gray-900"
                  : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {t("popular")}
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                {plan.priceLabel && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.priceLabel}
                  </span>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "primary" : "outline"}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
