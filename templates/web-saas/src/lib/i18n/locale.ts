"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "locale";
const DEFAULT_LOCALE = "en";
export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(COOKIE_NAME)?.value;
  if (locale && LOCALES.includes(locale as Locale)) {
    return locale as Locale;
  }
  return DEFAULT_LOCALE;
}

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
