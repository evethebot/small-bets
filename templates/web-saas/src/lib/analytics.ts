/**
 * Analytics Integration Stub
 *
 * Supports: Plausible, Umami, or custom
 * Configure via environment variables
 */

// ============================================
// Event Tracking
// ============================================

type AnalyticsEvent = {
  name: string;
  props?: Record<string, string | number | boolean>;
};

/**
 * Track a custom event (client-side)
 */
export function trackEvent({ name, props }: AnalyticsEvent) {
  // Plausible
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible(name, { props });
    return;
  }

  // Umami
  if (typeof window !== "undefined" && (window as any).umami) {
    (window as any).umami.track(name, props);
    return;
  }

  // Development fallback
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", name, props);
  }
}

// ============================================
// Common Events
// ============================================

export const analytics = {
  // Auth events
  signUp: () => trackEvent({ name: "sign_up" }),
  signIn: () => trackEvent({ name: "sign_in" }),

  // Subscription events
  startCheckout: (plan: string) =>
    trackEvent({ name: "start_checkout", props: { plan } }),
  completeCheckout: (plan: string) =>
    trackEvent({ name: "complete_checkout", props: { plan } }),
  cancelSubscription: () => trackEvent({ name: "cancel_subscription" }),

  // Feature usage
  featureUsed: (feature: string) =>
    trackEvent({ name: "feature_used", props: { feature } }),

  // Page views (auto-tracked by Plausible/Umami, but useful for SPA)
  pageView: (path: string) =>
    trackEvent({ name: "pageview", props: { path } }),
};

// ============================================
// Script Components (for layout.tsx)
// ============================================

export function getAnalyticsConfig() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";

  if (!enabled) return null;

  if (plausibleDomain) {
    return {
      type: "plausible" as const,
      src: "https://plausible.io/js/script.js",
      domain: plausibleDomain,
    };
  }

  if (umamiId && umamiUrl) {
    return {
      type: "umami" as const,
      src: `${umamiUrl}/script.js`,
      websiteId: umamiId,
    };
  }

  return null;
}
