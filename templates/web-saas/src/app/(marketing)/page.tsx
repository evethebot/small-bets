import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
    </>
  );
}
