"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const sections = [
    {
      title: t("product"),
      links: [
        { label: t("features"), href: "/#features" },
        { label: t("pricing"), href: "/pricing" },
        { label: t("changelog"), href: "/blog" },
      ],
    },
    {
      title: t("company"),
      links: [
        { label: t("about"), href: "/about" },
        { label: t("blog"), href: "/blog" },
        { label: t("careers"), href: "/careers" },
      ],
    },
    {
      title: t("legal"),
      links: [
        { label: t("privacy"), href: "/privacy" },
        { label: t("terms"), href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-gray-200/60 bg-gray-50 dark:border-gray-800/60 dark:bg-gray-950">
      <div className="container-wide py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">
                S
              </div>
              {t("description").slice(0, 20)}...
            </Link>
            <p className="mt-4 max-w-xs text-sm text-gray-500 dark:text-gray-400">
              {t("description")}
            </p>
          </div>

          {/* Link columns */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
