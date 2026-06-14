# Branching & Deployment Workflow

How we ship changes to InstantAppraisal without breaking production — and how to push an urgent fix even while a big feature is mid-flight.

## The golden rule

**`main` is always production-ready.** Never merge unfinished work into `main`. Everything else branches *off* `main`.

## Branches

| Branch | Role | Deploys to |
|---|---|---|
| `main` | Production. Always deployable. | `instantappraisal.co`, `dashboard.`, `my.` |
| `staging` | Pre-prod integration / full multi-site QA. Kept *close* to `main` — not a parking lot for months of unfinished work. | `staging.`, `staging-dashboard.`, `staging-my.` |
| `feat/*` | One big feature each, branched off `main`. | Auto preview URL (marketing only — see caveat) |
| `hotfix/*` | Urgent prod fix, branched off `main`. | Auto preview URL |

## ⚠️ Multi-domain caveat (important)

The app serves **three sites from one codebase**, routed by hostname in `proxy.ts`:
`dashboard.*` → dashboard, `my.*` → agent pages, **everything else → marketing**.

A raw Vercel preview URL (`...git-feat-x.vercel.app`) matches none of those prefixes, so **it only renders the marketing site.** Therefore:

- **Marketing changes** → test on the branch's preview URL. ✅
- **Dashboard or agent changes** → preview URLs won't show them. Test by **pushing to `staging`** (hits `staging-dashboard.` / `staging-my.`), or **locally** with the `?domain=dashboard` / `?domain=agent` query param.

> Optional future enhancement: allow the `?domain=` override on **preview** deploys (gate on `VERCEL_ENV !== 'production'`) so any preview URL can simulate all three sites. Small change to `proxy.ts`. Until then, `staging` is the real multi-site test environment.

## Workflows

### Big / innovation feature
```
git checkout main && git pull
git checkout -b feat/new-thing
# build it; commit
git push -u origin feat/new-thing      # marketing → preview URL; dashboard/agent → merge to staging to test
# when ready for full QA:
#   merge feat/new-thing → staging  (tests on staging subdomains)
# when QA passes + you have the go-ahead:
#   merge feat/new-thing → main     (ships to prod)
```
Keep features on their own branch — don't pile them onto `staging`, or `staging` stops being shippable.

### Urgent hotfix (while a feature is mid-flight)
```
git checkout main && git pull
git checkout -b hotfix/whatever
# fix it; commit
git push -u origin hotfix/whatever     # preview URL to verify (marketing) — or merge to staging for dashboard/agent
# merge hotfix → main                  # ships ONLY the fix (no in-progress feature work)
# then back-merge so nothing drifts:
git checkout staging && git merge main && git push
# and into any active feature branch:
git checkout feat/active && git merge main && git push
```
Because the hotfix branched off `main`, it carries none of the unfinished feature work — you ship just the fix. This is why you **don't need a second staging environment**: branch + preview deploys cover it.

## Database / Supabase (per-project, NOT carried by a code merge)

- Supabase: **staging = `snobwvwwgvksbxjpxbhv`**, **prod = `vqgzwqrixtesieblrbzy`**. The CLI on the dev machine is linked to **prod** — always pass `--project-ref snob…` to target staging.
- DB migrations, edge functions, and the auth Send-Email hook are configured **per project** and do **not** travel with a `staging`→`main` merge. Apply them to each environment separately.
- **Always apply migrations to staging first; never run them on prod without explicit sign-off.**
- Preview deploys read the **Preview**-scope env vars → they point at the **staging** Supabase + the staging DB. Two big features in flight share that one staging DB; conflicting migrations are the *only* real case for a second staging.

## Vercel env-var gotcha

Production and Preview scopes are **independent**. A value correct on one can be wrong/missing on the other (this has bitten us: `RESEND_API_KEY`, `PROPTRACK_BASE_URL`). After any go-live, sanity-check the **Production** scope has every var it needs. Env-var changes only take effect on a **new deployment**.

## TL;DR

1. `main` always deployable.
2. Features and hotfixes branch **off `main`**; each gets a preview URL (marketing) — use `staging` for dashboard/agent testing.
3. Hotfix = branch off `main` → fix → merge to `main` → back-merge to `staging` + active features.
4. One staging is enough. No second environment needed.
5. Never push prod (merge to `main`, or run prod migrations) without explicit approval.
