const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoosr.io";

/**
 * Server-rendered JSON-LD structured data.
 * Emitted as inline <script> tags so crawlers see it on initial HTML parse.
 * NOT a client component — no "use client" directive.
 */
export function JsonLd() {
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
      "https://github.com/mohamed-benoughidene/yoosr",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@yoosr.app",
      "availableLanguage": ["English", "Arabic", "French"],
    },
  };

  // WebSite structured data with SitelinksSearchBox
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

  // SoftwareApplication + WebApplication for the product
  const softwareData = {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
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

  // VideoObject for landing page walkthrough video
  const videoData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Yoosr Platform Walkthrough",
    "description": "See how Yoosr AI-powered customer support platform works — from bot building to agent handoff.",
    "thumbnailUrl": `${siteUrl}/yoosr-light.svg`,
    "contentUrl": `${siteUrl}/walkthrough.mp4`,
    "embedUrl": `${siteUrl}/walkthrough.mp4`,
    "uploadDate": "2025-04-14T00:00:00Z",
    "duration": "PT2M",
  };

  // HowTo schema for "How It Works" section
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Get Started with Yoosr",
    "description": "Three simple steps to launch your AI-powered customer support bot.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Design Your Bot Flow",
        "text": "Use the visual drag-and-drop builder to create conversation flows, add AI responses, and set up decision trees — no coding required.",
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Connect Your Knowledge Base",
        "text": "Upload documents, URLs, or FAQs so your bot can answer customer questions with accurate, context-aware responses using RAG.",
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Deploy Across Channels",
        "text": "Publish your bot to website widget, WhatsApp, Telegram, Messenger, or Instagram — all from a single dashboard.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToData) }}
      />
    </>
  );
}
