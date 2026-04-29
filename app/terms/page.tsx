export const metadata = {
  title: 'Terms & Conditions',
  description: 'InstantAppraisal terms and conditions of use.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[700px] px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 28 April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-base font-semibold mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Instant Appraisal ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">2. Description of Service</h2>
            <p>Instant Appraisal is a lead generation tool for licensed real estate agents. It provides prospective vendors with an estimated property appraisal range using data sourced from PropTrack Pty Ltd (ABN 43 127 386 298), and captures their contact details for follow-up by the subscribing agent.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">3. Eligibility</h2>
            <p>The Platform is available to licensed real estate agents and agencies operating in Australia. By subscribing, you warrant that you hold the required licences to operate as a real estate agent in your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">4. Subscription and Payment</h2>
            <p>Access to the Platform is provided on a monthly subscription basis at the rate displayed at the time of sign-up. Payments are processed via Stripe. Subscriptions renew automatically unless cancelled before the next billing date. No refunds are provided for partial months.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">5. Data Ownership</h2>
            <p className="mb-3">All lead data collected through the Platform — including vendor contact details, property addresses, and appraisal enquiry data — is owned by InstantAppraisal. By using the Platform, subscribing agents acknowledge that:</p>
            <p className="mb-3">(a) Lead data is provided to agents for the purpose of follow-up only and does not transfer ownership of that data to the agent.</p>
            <p className="mb-3">(b) InstantAppraisal retains the right to use anonymised, aggregated data for Platform improvement, analytics, and product development.</p>
            <p>(c) Agents must handle lead data in accordance with the Australian Privacy Act 1988 (Cth) and must not on-sell or misuse the contact information of enquirers.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">6. Data and PropTrack Licensing</h2>
            <p className="mb-4">Property valuation data displayed through the Platform is sourced from PropTrack Pty Ltd under licence from state and territory Valuer General offices. By using the Platform, you acknowledge the following:</p>
            <p className="mb-4">(a) This information is supplied by Strud Marketing Pty Ltd (ABN 18 658 709 721) on behalf of PropTrack Pty Ltd (ABN 43 127 386 298).</p>
            <p className="mb-4">(b) Property data must not be used for direct marketing purposes or in breach of applicable privacy laws.</p>
            <p className="mb-4">(c) The following state and territory data notices apply where relevant:</p>

            <div className="space-y-4 pl-4 border-l-2 border-border">
              <div>
                <p className="font-medium mb-1">New South Wales</p>
                <p>Contains property sales information provided under licence from the Valuer General New South Wales. PropTrack Pty Ltd is authorised as a Property Sales Information provider by the Valuer General New South Wales.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Queensland</p>
                <p>Based on or contains data provided by the State of Queensland (Department of Resources and Mines, Manufacturing and Regional and Rural Development) 2025. The State gives no warranty in relation to the data (including accuracy, reliability, completeness, currency or suitability) and accepts no liability for any loss, damage or costs relating to any use of the data. Data must not be used for direct marketing or in breach of privacy laws; see{' '}
                  <a href="https://www.propertydatacodeofconduct.com.au" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">www.propertydatacodeofconduct.com.au</a>.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Victoria</p>
                <p>The State of Victoria owns the copyright in the Property Sales Data and reproduction of that data in any way without the consent of the State of Victoria will constitute a breach of the Copyright Act 1968 (Cth). The State of Victoria does not warrant the accuracy or completeness of the Property Sales Data and any person using or relying upon such information does so on the basis that the State of Victoria accepts no responsibility or liability whatsoever for any errors, faults, defects or omissions in the information supplied.</p>
              </div>
              <div>
                <p className="font-medium mb-1">South Australia</p>
                <p>Copyright in this information belongs to the South Australian Government and the South Australian Government does not accept any responsibility for the accuracy or completeness of the information or its suitability for any purpose. The State of South Australia does not endorse any goods or services provided by PropTrack Pty Ltd and its related entities. This product is not produced by the State of South Australia and if it includes a valuation, it is not a valuation produced or endorsed by the State or the Valuer-General.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Western Australia</p>
                <p>Information contained within this product includes location information data licensed from Western Australian Land Information Authority (WALIA) trading as Landgate. Copyright in the location information data remains with WALIA. WALIA does not warrant the accuracy or completeness of the location information data or its suitability for any particular purpose.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Australian Capital Territory</p>
                <p>The Territory Data is the property of the Australian Capital Territory. No part of it may be reproduced, stored in a retrieval system or transmitted by any means without prior written permission. Enquiries: <a href="mailto:epdcustomerservice@act.gov.au" className="text-primary underline underline-offset-2 hover:text-primary/80">epdcustomerservice@act.gov.au</a>.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Tasmania</p>
                <p>This product incorporates data the copyright ownership of which is vested in the Crown in Right of Tasmania. The data has been used with the permission of the Crown in Right of Tasmania. The Crown in Right of Tasmania and its employees and agents give no warranty regarding the data&apos;s accuracy, completeness, currency or suitability for any particular purpose and do not accept liability for any loss resulting from the use of or reliance upon the data. Base data with the LIST © Crown in Right of Tasmania{' '}
                  <a href="https://www.thelist.tas.gov.au" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">https://www.thelist.tas.gov.au</a>.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Northern Territory</p>
                <p>Based on information provided under licence by the Department of Lands and Planning, Northern Territory of Australia.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Tenure Type</p>
                <p>The Tenure Type value is an inferred value based on information available to PropTrack at a given point in time and is subject to change in response to new data.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">7. Intellectual Property</h2>
            <p>All content, design, and software on the Platform (excluding PropTrack data) is owned by InstantAppraisal. You may not reproduce, distribute, or create derivative works without written permission.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">8. Limitation of Liability</h2>
            <p>The Platform is provided &quot;as is&quot;. Property estimate ranges are indicative only and do not constitute a formal valuation. InstantAppraisal accepts no liability for decisions made on the basis of data displayed through the Platform. To the maximum extent permitted by law, our liability to you is limited to the amount paid by you in the month in which the relevant issue arose.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">9. Termination</h2>
            <p>We reserve the right to suspend or terminate your account for breach of these terms, non-payment, or conduct that damages the reputation of the Platform or PropTrack.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">10. Governing Law</h2>
            <p>These terms are governed by the laws of Queensland, Australia. Any disputes will be subject to the exclusive jurisdiction of the courts of Queensland.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">11. Contact</h2>
            <p>For questions regarding these terms, contact <a href="mailto:team@instantappraisal.co" className="text-primary underline underline-offset-2 hover:text-primary/80">team@instantappraisal.co</a>.</p>
          </section>

          <section className="pt-4 border-t border-border">
            <p className="text-muted-foreground text-xs">The Platform is operated by Strud Marketing Pty Ltd (ABN 18 658 709 721) trading as InstantAppraisal.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
