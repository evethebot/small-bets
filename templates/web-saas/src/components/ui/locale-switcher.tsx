"use client";

import { useTransition } from "react";
import { LOCALES, type Locale, setUserLocale } from "@/lib/i18n/locale";
import { useLocale } from "next-intl";

const localeNames: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function handleChange(newLocale: Locale) {
    startTransition(async () => {
      await setUserLocale(newLocale);
      // Reload to apply new locale
      window.location.reload();
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          disabled={isPending || locale === l}
          className={`rounded px-2 py-1 transition-colors cursor-pointer ${
            locale === l
              ? "bg-brand-100 text-brand-700 font-medium dark:bg-brand-900/30 dark:text-brand-300"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          } disabled:opacity-50`}
        >
          {localeNames[l]}
        </button>
      ))}
    </div>
  );
}
