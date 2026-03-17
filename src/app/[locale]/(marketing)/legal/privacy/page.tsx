import type { Metadata } from "next"
import React from "react";
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export const metadata: Metadata = {
  title: "Privacy Policy — Yoosr",
  description: "How Yoosr collects, uses, and protects your data."
}

export default async function PrivacyPolicy({ params }: { params: Promise<{ locale: string }> }) {
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">

          {/* Intro */}
          <Section>
            <p className="text-lg text-muted-foreground leading-relaxed">
              This Privacy Policy describes how Yoosr (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated by
              Mohamed Benoughidene, collects, uses, and protects information when you use
              our platform. We are committed to handling data responsibly and transparently.
            </p>
          </Section>

          {/* 1 */}
          <Section title="1. Who This Policy Applies To">
            <p>This policy applies to two categories of users:</p>
            <ul className="space-y-4 my-6">
              <li>
                <strong className="text-foreground">Platform Users</strong>: businesses and individuals who create a
                Yoosr account to manage customer conversations and deploy AI bots.
              </li>
              <li>
                <strong className="text-foreground">End Users (Visitors)</strong>: customers and visitors who interact
                with a Yoosr-powered widget embedded on a Platform User&apos;s website or app.
              </li>
            </ul>
            <p>
              Platform Users are responsible for obtaining appropriate consent from their
              own End Users before deploying Yoosr on their platforms.
            </p>
          </Section>

          {/* 2 */}
          <Section title="2. Information We Collect">
            <p>
              <strong className="text-foreground">From Platform Users:</strong>
            </p>
            <ul className="space-y-2 my-4">
              <li>Account information: name, email address, and organization name (via Clerk)</li>
              <li>Workspace configuration: bot flows, departments, labels, canned responses, and settings</li>
              <li>Usage data: conversation volume, AI model usage, and feature interactions</li>
              <li>Billing and plan information (when applicable)</li>
            </ul>
            <p className="mt-8">
              <strong className="text-foreground">From End Users (via your deployed widget):</strong>
            </p>
            <ul className="space-y-2 my-4">
              <li>Conversation messages and metadata (timestamps, channel, status)</li>
              <li>Optional visitor attributes your bot or agents may capture (name, email, phone)</li>
              <li>CSAT ratings and feedback if enabled</li>
              <li>Device and browser metadata (browser type, language, approximate location if shared)</li>
            </ul>
            <p className="mt-6">
              We do not collect payment card numbers directly. Payments are processed by
              third-party payment providers.
            </p>
          </Section>

          {/* 3 */}
          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="space-y-2 my-4">
              <li>Provide, operate, and improve the Yoosr platform</li>
              <li>Authenticate users and manage workspace access</li>
              <li>Route conversations to the appropriate bots or agents</li>
              <li>Generate analytics and reports visible only to your organization</li>
              <li>Respond to support requests and communicate service updates</li>
              <li>Detect and prevent abuse, fraud, or security incidents</li>
            </ul>
            <p className="mt-8 font-medium text-foreground">
              We do not use your conversation data or End User data to train AI models,
              and we do not sell any data to third parties.
            </p>
          </Section>

          {/* 4 */}
          <Section title="4. Data Storage and Infrastructure">
            <p>
              Yoosr uses the following infrastructure providers to store and process data:
            </p>
            <ul className="space-y-2 my-4">
              <li>
                <strong className="text-foreground">Convex</strong>: database and real-time backend infrastructure
                (convex.dev)
              </li>
              <li>
                <strong className="text-foreground">Clerk</strong>: user authentication and organization management
                (clerk.com)
              </li>
              <li>
                <strong className="text-foreground">OpenRouter</strong>: AI model routing for bot and assistant
                features (openrouter.ai)
              </li>
              <li>
                <strong className="text-foreground">Vercel</strong>: frontend hosting and edge functions (vercel.com)
              </li>
            </ul>
            <p className="mt-6">
              Data may be stored on servers located outside your country. By using Yoosr,
              you consent to this transfer. We choose infrastructure providers with strong
              security and privacy practices.
            </p>
          </Section>

          {/* 5 */}
          <Section title="5. Cookies and Tracking">
            <p>
              Yoosr uses essential cookies to maintain your login session and workspace state.
              We do not use third-party advertising cookies or behavioral tracking pixels.
            </p>
            <p className="mt-4">
              The Yoosr widget embedded on your website may set a session identifier
              cookie to maintain conversation continuity for your visitors. No personal
              data is stored in this cookie.
            </p>
          </Section>

          {/* 6 */}
          <Section title="6. Data Retention">
            <p>
              We retain Platform User account data for as long as your account is active.
              If you delete your account, your data will be removed from our systems within
              30 days, except where we are required to retain it for legal or operational
              reasons.
            </p>
            <p className="mt-4">
              Conversation data and End User messages are retained as long as your workspace
              exists. You can delete individual conversations or request full data deletion
              by contacting us.
            </p>
          </Section>

          {/* 7 */}
          <Section title="7. Data Security">
            <p>
              We take reasonable technical and organizational measures to protect your data
              against unauthorized access, loss, or disclosure. These include encrypted
              data transmission (TLS), access controls, and role-based permissions within
              organizations.
            </p>
            <p className="mt-4">
              No system is completely secure. While we work to protect your data, we
              cannot guarantee absolute security and encourage you to use strong passwords
              and protect your account credentials.
            </p>
          </Section>

          {/* 8 */}
          <Section title="8. Your Rights">
            <p>
              Depending on where you are located, you may have the right to:
            </p>
            <ul className="space-y-2 my-4">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li>Object to or restrict how we process your data</li>
              <li>Request a portable copy of your data</li>
            </ul>
            <p className="mt-6">
              To exercise any of these rights, email us at{" "}
              <strong className="text-foreground">support@yoosr.app</strong>. We will respond within 30 days.
            </p>
          </Section>

          {/* 9 */}
          <Section title="9. Children's Privacy">
            <p>
              Yoosr is not intended for use by individuals under the age of 16. We do not
              knowingly collect personal data from minors. If you believe we have
              inadvertently collected such data, please contact us and we will delete it promptly.
            </p>
          </Section>

          {/* 10 */}
          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you
              of material changes via email or an in-app notice. The &quot;Last updated&quot; date
              at the top of this page reflects the most recent revision. Continued use
              of the Service after changes take effect constitutes acceptance of the
              updated policy.
            </p>
          </Section>

          {/* 11 */}
          <Section title="11. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy
              Policy or how we handle your data, please contact:
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