import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/lib/env"; // Validates required env vars at startup (side-effect import)

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Viewport metadata (separate export required in Next.js 14+)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0B0F" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://yoosr.io"),
  title: {
    default: "Yoosr - AI-Powered Customer Support Platform",
    template: "%s | Yoosr",
  },
  description: "Build intelligent customer support bots with visual flow builder, knowledge base RAG, and omnichannel support. Early access available.",
  keywords: [
    "AI customer support",
    "chatbot builder",
    "customer service automation",
    "visual bot builder",
    "knowledge base",
    "RAG",
    "omnichannel support",
    "WhatsApp",
    "Telegram",
    "Messenger",
    "Instagram",
  ],
  authors: [{ name: "Yoosr Team" }],
  creator: "Yoosr",
  publisher: "Yoosr",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yoosr.io",
    siteName: "Yoosr",
    title: "Yoosr - AI-Powered Customer Support Platform",
    description: "Build intelligent customer support bots with visual flow builder, knowledge base RAG, and omnichannel support.",
    images: [
      {
        url: "/og/image",
        width: 1200,
        height: 630,
        alt: "Yoosr - AI-Powered Customer Support Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yoosr - AI-Powered Customer Support Platform",
    description: "Build intelligent customer support bots with visual flow builder, knowledge base RAG, and omnichannel support.",
    images: ["/og/image"],
  },
  alternates: {
    canonical: "/",
    languages: {
      "en": "https://yoosr.io/en",
      "ar": "https://yoosr.io/ar",
      "fr": "https://yoosr.io/fr",
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
