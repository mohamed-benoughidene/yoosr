interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  features: string[];
}

interface PricingJsonLdProps {
  plans: PricingPlan[];
  siteUrl: string;
}

/**
 * Server-rendered Product JSON-LD for pricing tiers.
 * Each plan is emitted as a separate Product with an Offer.
 */
export function PricingJsonLd({ plans, siteUrl }: PricingJsonLdProps) {
  const products = plans
    .filter((plan) => plan.monthlyPrice !== null)
    .map((plan) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `Yoosr ${plan.name}`,
      "description": plan.description,
      "brand": {
        "@type": "Brand",
        "name": "Yoosr",
      },
      "offers": {
        "@type": "Offer",
        "price": plan.monthlyPrice,
        "priceCurrency": "USD",
        "description": `${plan.name} plan — monthly billing`,
        "url": `${siteUrl}/pricing`,
        "availability": "https://schema.org/InStock",
      },
      "featureList": plan.features,
      "category": "Software",
      "applicationCategory": "BusinessApplication",
    }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(products) }}
    />
  );
}
