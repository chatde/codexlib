import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — CodexLib",
  description:
    "Terms of Service for CodexLib — usage terms, subscriptions, and acceptable use.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted text-sm mb-10">Last updated: March 1, 2026</p>

      <div className="space-y-8 text-muted">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CodexLib (the &ldquo;Service&rdquo;), including the website at
            codexlib.io and its API, you agree to be bound by these Terms of Service. If you do
            not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
          <p>
            CodexLib is a platform for AI-optimized knowledge packs in compressed format. Users can
            browse, download, and integrate knowledge packs into their AI workflows. The Service
            includes free and paid tiers with different access levels.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Accounts</h2>
          <p>
            You must create an account to access certain features. You are responsible for
            maintaining the security of your account credentials and for all activities that occur
            under your account. You must provide accurate information and keep it up to date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            4. Subscription Plans and Billing
          </h2>
          <p>CodexLib offers the following plans:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>
              <strong className="text-foreground">Free</strong> — 5 pack downloads per month
            </li>
            <li>
              <strong className="text-foreground">Pro ($12/month)</strong> — unlimited downloads and
              API access
            </li>
            <li>
              <strong className="text-foreground">Team ($29/month)</strong> — team features and
              priority support
            </li>
          </ul>
          <p className="mt-3">
            Paid subscriptions are billed monthly through Stripe. You can cancel at any time.
            Cancellation takes effect at the end of the current billing period — you retain access
            until then.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Refund Policy</h2>
          <p>
            CodexLib provides digital goods and services. Due to the nature of digital content,
            we generally do not offer refunds for subscription payments already processed. However,
            if you experience a technical issue that prevents you from using the Service, contact us
            within 7 days and we will work to resolve the issue or provide a refund at our
            discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Use the Service for any unlawful purpose</li>
            <li>Upload malicious, harmful, or misleading content</li>
            <li>Redistribute paid knowledge packs without authorization</li>
            <li>Circumvent usage limits or access controls</li>
            <li>Attempt to reverse-engineer or scrape the platform</li>
            <li>Impersonate other users or misrepresent your identity</li>
            <li>Use automated tools to bulk-download content beyond your plan limits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. User Content</h2>
          <p>
            When you submit knowledge packs or vault content to CodexLib, you retain ownership of
            your content. By submitting content, you grant CodexLib a non-exclusive, worldwide
            license to host, display, and distribute that content through the platform. You
            represent that you have the right to share any content you upload.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Intellectual Property</h2>
          <p>
            The CodexLib name, logo, website design, and platform infrastructure are the property
            of CodexLib. Knowledge pack content is owned by its respective
            creators. The TokenShrink compression format is used under license.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            9. Limitation of Liability
          </h2>
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
            IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, CODEXLIB SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR
            USE OF THE SERVICE.
          </p>
          <p className="mt-3">
            Knowledge packs are provided for informational purposes. We do not guarantee the
            accuracy, completeness, or fitness for any particular purpose of any knowledge pack
            content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">10. API Usage</h2>
          <p>
            API access is subject to rate limits based on your subscription plan. We reserve the
            right to throttle or suspend API access if usage patterns indicate abuse or if they
            negatively impact the Service for other users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">11. Termination</h2>
          <p>
            We may suspend or terminate your account if you violate these Terms. You may delete
            your account at any time. Upon termination, your access to paid features will cease
            and your data will be handled in accordance with our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">12. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be communicated via
            email or a prominent notice on the website. Continued use of the Service after changes
            are posted constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">13. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the United States. Any disputes will be
            resolved through binding arbitration or in the courts of competent jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">14. Contact</h2>
          <p>
            Questions about these Terms can be directed to{" "}
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
