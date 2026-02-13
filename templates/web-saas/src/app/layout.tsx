import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getAnalyticsConfig } from "@/lib/analytics";
import Script from "next/script";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "{{PRODUCT_NAME}} - {{PRODUCT_TAGLINE}}",
    template: "%s | {{PRODUCT_NAME}}",
  },
  description: "{{PRODUCT_DESC}}",
  keywords: ["{{PRODUCT_KEYWORDS}}"],
  authors: [{ name: "{{AUTHOR_NAME}}" }],
  creator: "{{AUTHOR_NAME}}",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "{{PRODUCT_URL}}",
    title: "{{PRODUCT_NAME}} - {{PRODUCT_TAGLINE}}",
    description: "{{PRODUCT_DESC}}",
    siteName: "{{PRODUCT_NAME}}",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "{{PRODUCT_NAME}}",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "{{PRODUCT_NAME}} - {{PRODUCT_TAGLINE}}",
    description: "{{PRODUCT_DESC}}",
    images: ["/og-image.png"],
    creator: "@{{TWITTER_HANDLE}}",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const analytics = getAnalyticsConfig();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Dark mode: prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch {}
            `,
          }}
        />

        {/* Analytics */}
        {analytics?.type === "plausible" && (
          <Script
            defer
            data-domain={analytics.domain}
            src={analytics.src}
            strategy="afterInteractive"
          />
        )}
        {analytics?.type === "umami" && (
          <Script
            defer
            data-website-id={analytics.websiteId}
            src={analytics.src}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-screen bg-surface font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
