import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale as unstable_setRequestLocale, getMessages } from "next-intl/server";
import { ClerkProvider } from "@clerk/nextjs";
import { HtmlDirSetter } from "@/components/HtmlDirSetter";
import { arSA, enUS, frFR } from "@clerk/localizations";

const arSAWithPlaceholders = {
    ...arSA,
    formFieldInputPlaceholder__emailAddress: 'أدخل بريدك الإلكتروني',
    formFieldInputPlaceholder__emailAddress_username: 'البريد الإلكتروني أو اسم المستخدم',
    formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
    formFieldInputPlaceholder__firstName: 'الاسم الأول',
    formFieldInputPlaceholder__lastName: 'اسم العائلة',
    formFieldInputPlaceholder__password: 'أدخل كلمة المرور',
    formFieldInputPlaceholder__phoneNumber: 'أدخل رقم هاتفك',
    formFieldInputPlaceholder__organizationName: 'اسم المؤسسة',
    formFieldInputPlaceholder__organizationSlug: 'my-org',
    signUp: {
        start: {
            title: 'إنشاء حساب',
            subtitle: 'أدخل بياناتك أدناه لإنشاء حسابك',
        }
    }
}

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
  const localeMap = { ar: arSAWithPlaceholders, en: enUS, fr: frFR };
  const clerkLocalization = localeMap[locale as keyof typeof localeMap] ?? enUS;

    return (
        <ClerkProvider
            localization={clerkLocalization}
            waitlistUrl="/waitlist"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/onboarding"
            afterSignOutUrl="/"
        >
            <NextIntlClientProvider messages={messages}>
                <HtmlDirSetter locale={locale} />
                {children}
            </NextIntlClientProvider>
        </ClerkProvider>
    );
}
