import type { Metadata } from "next";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for {{PRODUCT_NAME}}. Choose the plan that works for you.",
};

export default function PricingPage() {
  return (
    <>
      <div className="pt-8">
        <Pricing />
      </div>
      <FAQ />
    </>
  );
}
