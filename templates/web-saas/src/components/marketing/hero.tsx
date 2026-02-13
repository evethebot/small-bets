"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-950/20" />
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-400/10 blur-3xl dark:bg-brand-600/10" />
      </div>

      <div className="container-wide py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <Badge className="gap-1.5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              {t("badge")}
            </Badge>
          </div>

          {/* Heading */}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="gap-2 text-base">
                {t("cta")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#features">
              <Button variant="outline" size="lg" className="text-base">
                {t("ctaSecondary")}
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
            {t("socialProof", { count: "1,000" })}
          </p>
        </div>
      </div>
    </section>
  );
}
