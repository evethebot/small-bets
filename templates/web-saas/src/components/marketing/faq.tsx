"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQ() {
  const t = useTranslations("faq");
  const items = t.raw("items") as Array<{ question: string; answer: string }>;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-gray-200/60 py-24 dark:border-gray-800/60">
      <div className="container-narrow">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-12 divide-y divide-gray-200 dark:divide-gray-800">
          {items.map((item, i) => (
            <div key={i} className="py-4">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 text-left cursor-pointer"
              >
                <span className="text-base font-medium text-gray-900 dark:text-white">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  openIndex === i
                    ? "grid-rows-[1fr] opacity-100 mt-3"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
