"use client";

import Script from "next/script";

export function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoosr.com";

  // Organization structured data
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Yoosr",
    "url": siteUrl,
    "logo": `${siteUrl}/yoosr-light.svg`,
    "description": "AI-Powered Customer Support Platform with visual bot builder, knowledge base RAG, and omnichannel support",
    "foundingDate": "2024",
    "areaServed": "Worldwide",
    "sameAs": [
      "https://twitter.com/yoosr",
      "https://linkedin.com/company/yoosr",
      "https://github.com/yoosr",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@yoosr.com",
      "availableLanguage": ["English", "Arabic", "French"],
    },
  };

  // WebSite structured data
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Yoosr",
    "url": siteUrl,
    "description": "Build intelligent customer support bots with visual flow builder, knowledge base RAG, and omnichannel support",
    "inLanguage": ["en", "ar", "fr"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  // SoftwareApplication structured data (for the product)
  const softwareData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Yoosr",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web-based",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Early access available",
    },
    "description": "AI-powered customer support platform with visual bot builder, knowledge base, and omnichannel support",
    "featureList": [
      "Visual Bot Builder",
      "Knowledge Base with RAG",
      "Omnichannel Support",
      "Real-Time Analytics",
      "HITL Handoff",
      "Multi-language Support (EN/AR/FR)",
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "1",
      "bestRating": "5",
      "worstRating": "1",
    },
  };

  // FAQ structured data (for landing page)
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Yoosr?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yoosr is an AI-powered customer support platform that helps businesses build intelligent chatbots with a visual flow builder, knowledge base integration, and omnichannel support.",
        },
      },
      {
        "@type": "Question",
        "name": "Which channels does Yoosr support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yoosr supports website widget, WhatsApp, Telegram, Meta Messenger, and Instagram - all managed from a single dashboard.",
        },
      },
      {
        "@type": "Question",
        "name": "Does Yoosr support multiple languages?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Yoosr supports English, Arabic (with full RTL), and French out of the box.",
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="json-ld-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        strategy="afterInteractive"
      />
      <Script
        id="json-ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        strategy="afterInteractive"
      />
      <Script
        id="json-ld-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareData) }}
        strategy="afterInteractive"
      />
      <Script
        id="json-ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
        strategy="afterInteractive"
      />
    </>
  );
}
