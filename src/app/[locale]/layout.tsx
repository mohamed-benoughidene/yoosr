import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale as unstable_setRequestLocale, getMessages } from "next-intl/server";
import { HtmlDirSetter } from "@/components/HtmlDirSetter";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }, { locale: "fr" }];
}

// Force all locale pages to be dynamically rendered — this avoids static
// pre-render crashes when Clerk/Convex env vars are missing (CI build).
export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlDirSetter locale={locale} />
      <JsonLd />
      {children}
    </NextIntlClientProvider>
  );
}
