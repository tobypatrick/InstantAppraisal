@AGENTS.md

# InstantAppraisal

Restored 6 Aug 2026. The previous CLAUDE.md was overwritten by a Next.js postinstall,
which reduced this file to a bare `@AGENTS.md` pointer and destroyed all project context.
Rebuilt from `~/Desktop/MD Files/Migration/brain-dump-2026-08-06.md`. **If a postinstall
clobbers this file again, restore it from there or from
`AI OS/strud-marketing-ai-os/state/instantappraisal-dev-context.md`.**

The `@AGENTS.md` include above is deliberate and must stay. It carries the Next.js
version warning.

## What this is
A real-estate property-appraisal lead-gen SaaS. Address in, instant estimate out, seller
lead captured. Multi-tenant Next.js App Router on Vercel, migrated from Lovable.

**Ownership: a sub-brand of STRUD Marketing Pty Ltd, not a personal side project.** Runs
independently on its own stack and partners with Agent Growth. Every Agent Growth
subscription bundles a free InstantAppraisal subscription.

Repos:
- Current: `~/Developer/instant-appraisal` (moved off the iCloud-synced Desktop 13 Aug 2026;
  the Desktop copy at `~/Desktop/Claude Projects/instant-appraisal` is retired, delete once
  the new location is proven)
- Old Lovable build, kept as a porting reference: `~/Desktop/Claude Projects/InstantAppraisal`

## The hard rule
**All changes go to the `staging` branch and staging environment first, and are tested
there. NEVER push to production without explicit permission.** That covers both merging
staging into main AND running migrations against the prod database. Work one step at a
time. This protects live agents and their lead data.

## Branching
| Branch | Role | Deploys to |
|---|---|---|
| `main` | Production | instantappraisal.co, dashboard., my. |
| `staging` | Pre-prod QA | staging., staging-dashboard., staging-my. |
| `feat/*` | One feature per branch | Auto preview URL (marketing only) |
| `hotfix/*` | Urgent prod fix | Auto preview URL |

`main` is always production-ready. Never merge unfinished work into it.

## Infrastructure
- **Supabase:** staging `snobwvwwgvksbxjpxbhv`, prod `vqgzwqrixtesieblrbzy`, both Sydney.
  **The Supabase CLI on this machine is linked to PROD**, so always pass
  `--project-ref snobwvwwgvksbxjpxbhv` to target staging.
- **staging to main deploys code only.** DB migrations and Supabase infra (edge functions,
  the auth Send-Email hook and its secrets) are per-project and must be replicated on prod
  separately.
- **Domains:** marketing instantappraisal.co, dashboard dashboard.instantappraisal.co,
  agent my.instantappraisal.co. Staging uses the `staging-` prefixed variants. Vercel
  Deployment Protection on staging returns 401 to unauthenticated requests, so curl can't
  verify it.
- **Multi-domain testing:** the app routes by hostname in `proxy.ts`. A raw preview URL
  only shows marketing. Use `?domain=` to simulate subdomains locally and on previews:
  `localhost:3000/?domain=dashboard`, `localhost:3000/?domain=agent`. The param is
  stripped in production, where the real hostname is authoritative.
- **Email architecture:** auth emails (signup, reset) go through the Supabase
  `auth-email-hook` edge function with its own Resend secret. App emails
  (lead-notification, vendor-confirmation, limit-reached) go through Next.js API routes
  using the Vercel `RESEND_API_KEY`. Everything sends from
  noreply@team.instantappraisal.co, so **the Resend key must have that domain verified or
  a domain-restricted key will 403.**
- **Vercel env gotcha:** Production and Preview scopes are independent. Vars set for
  staging (Preview) are NOT automatically on Production. After any go-live, check
  `RESEND_API_KEY`, `PROPTRACK_*` and friends exist in the Production scope. Env changes
  only take effect on a new deployment.
- **Meta Conversions API:** server-side CAPI in `lib/fb-capi.ts` (`sendCapiEvent`), posts
  to the Pixel (default `FB_PIXEL_ID` 1700241921115604) via graph.facebook.com. The key
  event is the paid-subscription conversion, fired from the Stripe webhook about 30 days
  after signup when the trial converts, which the browser pixel can't see. **No-ops until
  `FB_CAPI_ACCESS_TOKEN` is set in the Vercel env.** A Meta Admin System User exists to
  mint that long-lived token.
- **Stripe:** prod is LIVE mode. Full signup-to-pay testing on prod uses the 30-day trial
  so there's no immediate charge. The 4242 test card is staging only.

## Pricing
Pro $99/mo (20 reports), Elite $199/mo (100 reports). Free with any Agent Growth
subscription.

## Key files
```
CLAUDE.md      # this file
AGENTS.md      # Next.js agent rules, read before any Next.js work
BRANCHING.md   # full branching and deployment workflow
proxy.ts       # multi-domain routing
app/           # App Router pages, incl. app/admin/(protected)/overview/page.tsx
components/    # shared, incl. components/admin/
lib/           # utilities, Supabase clients, fb-capi.ts
supabase/      # migrations and schema
```

## Shipped
- **v1.1, prod 2026-06-15:** new-user signup to Stripe checkout (gated on
  `stripe_customer_id`), campaign tracking-link persistence, email confirmation fully
  removed (**must stay OFF in Supabase in both envs**), Lead Analytics in Marketing,
  checkout self-provisions billing via `/api/stripe/verify-session`, friendlier auth
  errors.
- **Support fixes 2026-06-19:** white-on-white CTA bar fixed via `getContrastTextColor`
  (commit 269003f). Per-agent Open Graph link previews for SMS sharing on
  `app/agent/[slug]/page.tsx` (commits 8203673, 79423a4). Note messaging apps cache
  previews per URL.
- **v2 admin, prod 2026-06-22** at admin.instantappraisal.co, standalone login separate
  from demo and agent. Old in-dashboard admin and `audit_log` removed. **Gotcha hit and
  fixed:** an `audit_profile_update` trigger on `profiles` broke all profile saves once
  `audit_log` was dropped. The drop migration now removes the trigger and function too.
  Coloured QR codes done on staging. Demo account email swapped to
  team+test@instantappraisal.co.

## v2 scope, priority order (set 2026-06-19, updated 2026-06-22)
1. Admin rebuild — DONE and live.
2. **Post-signup onboarding / "what now?" orientation.** An activation problem that kills
   trial conversion. How-to lives in the Resources Centre plus a visible "Start here"
   pointer in the dashboard. Move this slice UP the priority order.
3. **$5,000 + GST Launch Package**, one-off and separate from the subscription. Three DL
   flyer designs plus Facebook/Instagram Ads setup (25 creatives, up to 3 suburb
   campaigns). Needs a sales page, a one-off Stripe payment (~$5,500 inc GST) and an
   intake. Deliverables are produced manually.
4. **Interactive demo.** Prospect changes colours, logo and name live on the demo page
   before signup, and those settings carry into signup. Plus a slide-by-slide story
   entrance: problem, instant-appraisal hook, value exchange, owned leads, CTA.
5. **Paid referral program**, agents refer agents for cash. Open questions: cash vs
   credit, flat vs recurring. Needs a referrals table, attribution, an anti-self-referral
   guard and a payout threshold.
6. **RateMyAgent review widget** on the landing page. **Security: do not render a pasted
   embed raw (XSS).** Restrict to RateMyAgent's known embed or sandbox the iframe.
7. Coloured QR codes in the agent's brand colour (`MarketingKit.tsx`) — done. Keep
   contrast for scannability.
8. Fuller Resources Centre library, in-app change-email, sitemap and robots.txt for the
   marketing site.

**Back-burner:** a Property Managers version doing rental appraisals to win management of
investment properties. Same engine, rental valuation and PM copy. Open: does PropTrack
expose a rental AVM endpoint, same app with a toggle vs a separate brand, pricing, shared
vs separate infra. Do it as a `feat/*` branch.

**Skipped:** Resend key rotation, Toby's call, low risk.

## Voice
Australian English. No em dashes. No bold in drafted messages. No competitor talk.
Confirm anything outward-facing or hard to reverse.
