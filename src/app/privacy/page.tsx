import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — CodexLib",
  description:
    "Privacy Policy for CodexLib — how we handle your data, payments, and account information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted text-sm mb-10">Last updated: March 1, 2026</p>

      <div className="space-y-8 text-muted">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Overview</h2>
          <p>
            CodexLib (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website
            codexlib.io and its associated services. This Privacy Policy explains how we collect,
            use, and protect your information when you use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Data Collection</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>
              <strong className="text-foreground">Account information</strong> — email address and
              profile data when you create an account
            </li>
            <li>
              <strong className="text-foreground">Usage data</strong> — packs downloaded, vaults
              created, API usage, and browsing activity
            </li>
            <li>
              <strong className="text-foreground">Payment information</strong> — processed securely
              by Stripe (we never store your full card details)
            </li>
            <li>
              <strong className="text-foreground">User-generated content</strong> — knowledge packs,
              vaults, and other content you submit to the platform
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Payment Processing</h2>
          <p>
            All payment processing is handled by{" "}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light"
            >
              Stripe
            </a>
            . When you subscribe to a paid plan, your payment information is sent directly to
            Stripe&apos;s secure servers. We receive only a token reference, your subscription
            status, and basic transaction details. We never have access to your full credit card
            number.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Data Storage</h2>
          <p>
            Your account data, pack metadata, and vault information are stored in{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light"
            >
              Supabase
            </a>
            , a secure PostgreSQL-based cloud database. Data is encrypted in transit (TLS) and at
            rest. Your uploaded knowledge pack content is stored securely and associated with your
            account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use
            third-party tracking cookies for advertising. Analytics cookies may be used to
            understand usage patterns and improve the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>
              <strong className="text-foreground">Stripe</strong> — payment processing
            </li>
            <li>
              <strong className="text-foreground">Supabase</strong> — database and authentication
            </li>
            <li>
              <strong className="text-foreground">Vercel</strong> — hosting and edge delivery
            </li>
          </ul>
          <p className="mt-2 text-sm">
            Each service has its own privacy policy governing how they handle your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">How We Use Your Data</h2>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>To provide and maintain the CodexLib service</li>
            <li>To process payments and manage subscriptions</li>
            <li>To communicate service updates and important notices</li>
            <li>To prevent fraud and enforce our Terms of Service</li>
            <li>To improve the platform based on usage patterns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Data Retention</h2>
          <p>
            We retain your account data for as long as your account is active. If you delete your
            account, we will remove your personal data within 30 days. Anonymized usage statistics
            may be retained indefinitely. Payment records are retained as required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of non-essential communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Children&apos;s Privacy</h2>
          <p>
            CodexLib is not directed to children under 13. We do not knowingly collect personal
            information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated revision date. Continued use of the service after changes are
            posted constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
            <a
              href="mailto:contact@codexlib.io"
              className="text-gold hover:text-gold-light"
            >
              contact@codexlib.io
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
