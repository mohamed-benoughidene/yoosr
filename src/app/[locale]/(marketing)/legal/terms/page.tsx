import type { Metadata } from "next"
import React from "react";
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export const metadata: Metadata = {
  title: "Terms of Service — Yoosr",
  description: "Terms and conditions for using the Yoosr platform."
}

export default async function TermsOfService({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
  const lastUpdated = "March 2025";

  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm font-bold text-primary mb-3 uppercase tracking-widest">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">

          {/* Intro */}
          <Section>
            <p className="text-lg text-muted-foreground leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of Yoosr
              (&quot;the Service&quot;), operated by Mohamed Benoughidene (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
              By accessing or using Yoosr, you agree to be bound by these Terms.
              If you do not agree, do not use the Service.
            </p>
          </Section>

          {/* 1 */}
          <Section title="1. Use of the Service">
            <p>
              Yoosr is a customer communication platform that allows businesses to
              deploy AI-powered chatbots and manage live support conversations.
            </p>
            <p className="mt-4">You agree to:</p>
            <ul className="space-y-3 my-4">
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Use the Service only for lawful purposes and in compliance with these Terms</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Not attempt to gain unauthorized access to any part of the Service or its infrastructure</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Not use the Service to transmit spam, malware, or any harmful or deceptive content</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Not reverse engineer, copy, or resell any part of the Service without written permission</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Maintain the confidentiality of your account credentials</span>
              </li>
            </ul>
            <p className="mt-6 font-medium text-foreground">
              You are responsible for all activity that occurs under your account, including
              activity by your team members and end users of the widget deployed on your platform.
            </p>
          </Section>

          {/* 2 */}
          <Section title="2. Accounts and Organizations">
            <p>
              Access to Yoosr is managed through workspace accounts tied to an organization.
              You must provide accurate information when creating your account. Each organization
              is responsible for managing its own team members and access permissions.
            </p>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that violate these Terms,
              engage in abusive behavior, or pose a risk to other users or the platform.
            </p>
          </Section>

          {/* 3 */}
          <Section title="3. Your Data and Content">
            <p>
              You retain full ownership of all data, conversations, and content you or your
              end users generate through the Service (&quot;Your Content&quot;). By using Yoosr, you
              grant us a limited license to store and process Your Content solely to provide
              the Service to you.
            </p>
            <p className="mt-4 font-medium text-foreground">
              We do not sell Your Content or use it to train AI models without your explicit
              consent. You are solely responsible for the legality of the data you collect
              through your deployed widgets.
            </p>
          </Section>

          {/* 4 */}
          <Section title="4. Third-Party Services">
            <p>
              Yoosr integrates with third-party services including Clerk (authentication),
              Convex (database infrastructure), and OpenRouter (AI model routing).
              Your use of the Service is subject to the terms and privacy policies of
              these providers. We are not liable for their actions or failures.
            </p>
            <p className="mt-4">
              When you enable channel integrations (such as WhatsApp, Telegram, or
              Facebook Messenger), you are responsible for compliance with those
              platforms&apos; own developer policies.
            </p>
          </Section>

          {/* 5 */}
          <Section title="5. Acceptable Use and Prohibited Conduct">
            <p>You must not use Yoosr to:</p>
            <ul className="space-y-2 my-4">
              <li className="flex items-start gap-3 italic">
                <span>• Violate any applicable local, national, or international law or regulation</span>
              </li>
              <li className="flex items-start gap-3 italic">
                <span>• Collect or process data of minors without appropriate consent mechanisms</span>
              </li>
              <li className="flex items-start gap-3 italic">
                <span>• Deploy bots that deceive end users about interacting with an AI system</span>
              </li>
              <li className="flex items-start gap-3 italic">
                <span>• Conduct surveillance, harassment, or discrimination against any individual</span>
              </li>
              <li className="flex items-start gap-3 italic">
                <span>• Interfere with or disrupt the integrity or performance of the Service</span>
              </li>
            </ul>
            <p className="mt-6 text-destructive font-semibold">
              Violations may result in immediate account suspension without refund.
            </p>
          </Section>

          {/* 6 */}
          <Section title="6. Availability and Changes">
            <p>
              We aim to keep Yoosr available at all times, but we do not guarantee
              uninterrupted access. The Service is provided on an &quot;as is&quot; and &quot;as available&quot;
              basis. We may modify, suspend, or discontinue any part of the Service at
              any time with reasonable notice.
            </p>
            <p className="mt-4 font-italic">
              We may update these Terms from time to time. We will notify you of significant
              changes via email or an in-app notice. Continued use after changes take effect
              constitutes acceptance of the updated Terms.
            </p>
          </Section>

          {/* 7 */}
          <Section title="7. Disclaimer of Warranties">
            <p className="border p-4 rounded-lg bg-muted/50">
              To the fullest extent permitted by law, Yoosr is provided without warranties
              of any kind, express or implied, including but not limited to warranties of
              merchantability, fitness for a particular purpose, or non-infringement.
              We do not warrant that the Service will be error-free or that any defects
              will be corrected.
            </p>
          </Section>

          {/* 8 */}
          <Section title="8. Limitation of Liability">
            <p className="border p-4 rounded-lg bg-muted/50">
              To the maximum extent permitted by applicable law, we shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages,
              including but not limited to loss of revenue, data, or business opportunities,
              arising out of or in connection with your use of the Service — even if we
              have been advised of the possibility of such damages.
            </p>
          </Section>

          {/* 9 */}
          <Section title="9. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with applicable law.
              Any disputes arising under these Terms will be resolved through good-faith
              negotiation. If resolution cannot be reached, disputes will be submitted to
              binding arbitration or the courts of competent jurisdiction.
            </p>
          </Section>

          {/* 10 */}
          <Section title="10. Contact">
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="font-bold text-foreground py-2 border-b border-border w-fit">
              support@yoosr.app
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-2xl font-bold text-foreground border-l-4 border-primary pl-4">
          {title}
        </h2>
      )}
      <div className="text-muted-foreground text-base leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}