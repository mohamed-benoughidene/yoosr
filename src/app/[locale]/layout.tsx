import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale as unstable_setRequestLocale, getMessages } from "next-intl/server";
import { HtmlDirSetter } from "@/components/HtmlDirSetter";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }, { locale: "fr" }];
}

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
      {children}
    </NextIntlClientProvider>
  );
}
