"use client";

import { useTranslations } from "next-intl";
import {
  Zap,
  Shield,
  Puzzle,
  BarChart3,
  Users,
  HeadphonesIcon,
} from "lucide-react";

const icons = [Zap, Shield, Puzzle, BarChart3, Users, HeadphonesIcon];

export function Features() {
  const t = useTranslations("features");

  const features = Array.from({ length: 6 }, (_, i) => ({
    icon: icons[i],
    title: t(`feature${i + 1}.title`),
    description: t(`feature${i + 1}.description`),
  }));

  return (
    <section id="features" className="border-t border-gray-200/60 py-24 dark:border-gray-800/60">
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

        {/* Feature grid */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group relative rounded-2xl border border-gray-200/60 bg-white p-6 transition-all hover:border-brand-200 hover:shadow-lg dark:border-gray-800/60 dark:bg-gray-900 dark:hover:border-brand-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
