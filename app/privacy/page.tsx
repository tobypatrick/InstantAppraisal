export const metadata = {
  title: 'Privacy Policy',
  description: 'InstantAppraisal privacy policy — how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[700px] px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 4 March 2025</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-base font-semibold mb-2">1. Overview</h2>
            <p>Strud Marketing Pty Ltd (ABN 18 658 709 721) ("we", "us", "our") operates Instant Appraisal. This Privacy Policy explains how we collect, use, store, and disclose personal information in accordance with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">2. Information We Collect</h2>
            <p className="mb-3">(a) <span className="font-medium">Agent subscribers:</span> Name, email address, phone number, agency name, billing information (processed by Stripe — we do not store card details), and usage data.</p>
            <p className="mb-3">(b) <span className="font-medium">Property enquirers (vendors):</span> Name, email address, phone number, property address entered into the appraisal tool, and the estimated valuation range returned.</p>
            <p>(c) <span className="font-medium">Automatically collected:</span> IP address, browser type, pages visited, and session data via cookies and analytics tools.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">3. How We Use Personal Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide and operate the Platform</li>
              <li>Process subscription payments</li>
              <li>Deliver lead data to the subscribing agent on your behalf</li>
              <li>Communicate service updates and billing information</li>
              <li>Improve Platform performance and user experience</li>
            </ul>
            <p className="mt-3">Property data sourced from PropTrack will not be used for direct marketing purposes and will not be disclosed in breach of applicable privacy laws, consistent with our PropTrack data licence obligations.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">4. Disclosure of Information</h2>
            <p className="mb-3">We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>PropTrack Pty Ltd (ABN 43 127 386 298), as required to provide property valuation data</li>
              <li>Stripe, for payment processing</li>
              <li>LeadConnector / GoHighLevel, for CRM delivery of lead data to subscribing agents</li>
              <li>Regulatory authorities, if required by law</li>
            </ul>
            <p className="mt-3">We do not sell personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">5. PropTrack Data</h2>
            <p>Property valuation estimates displayed through Instant Appraisal are sourced from PropTrack Pty Ltd under licence from state and territory Valuer General offices. This information is supplied by Strud Marketing Pty Ltd (ABN 18 658 709 721) on behalf of PropTrack Pty Ltd (ABN 43 127 386 298). Full data source disclaimers are available in our{' '}
              <a href="https://instantappraisal.co/terms" className="text-primary underline underline-offset-2 hover:text-primary/80">Terms &amp; Conditions</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">6. Data Storage and Security</h2>
            <p>Data is stored on secure servers. We take reasonable steps to protect personal information from misuse, interference, loss, and unauthorised access. Stripe handles all payment data under PCI-DSS compliance standards.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">7. Retention</h2>
            <p>We retain agent subscriber data for the duration of the subscription and for 7 years thereafter for legal and accounting purposes. Lead data (vendor enquiries) is retained for 12 months unless the subscribing agent requests earlier deletion.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">8. Access and Correction</h2>
            <p>You have the right to request access to or correction of personal information we hold about you. To make a request, contact us at{' '}
              <a href="mailto:hello@instantappraisal.co" className="text-primary underline underline-offset-2 hover:text-primary/80">hello@instantappraisal.co</a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">9. Complaints</h2>
            <p>If you believe we have breached the Australian Privacy Principles, you may lodge a complaint with us at{' '}
              <a href="mailto:hello@instantappraisal.co" className="text-primary underline underline-offset-2 hover:text-primary/80">hello@instantappraisal.co</a>. If your complaint is not resolved, you may contact the Office of the Australian Information Commissioner (OAIC) at{' '}
              <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">www.oaic.gov.au</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">10. Cookies</h2>
            <p>The Platform uses cookies for session management and analytics. You may disable cookies in your browser settings, though some Platform functionality may be affected.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Continued use of the Platform after updates constitutes acceptance of the revised policy.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">12. Contact</h2>
            <p className="mb-2">Privacy enquiries: <a href="mailto:hello@instantappraisal.co" className="text-primary underline underline-offset-2 hover:text-primary/80">hello@instantappraisal.co</a></p>
            <p className="mb-1">Strud Marketing Pty Ltd</p>
            <p>ABN: 18 658 709 721</p>
          </section>
        </div>
      </div>
    </div>
  )
}
