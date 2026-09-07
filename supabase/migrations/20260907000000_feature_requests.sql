-- A home for feature requests from paying users.
--
-- THE FAILURE THIS CLOSES. Three requests in a row arrived from paying users
-- and had nowhere to go: Michael Feletti twice, and Kendall Booth. They sat for
-- 7 weeks and 4 days respectively. Then, checking the code to answer them,
-- TWO OF THEM TURNED OUT TO BE ALREADY SHIPPED AND NOBODY HAD TOLD THE USER.
--
-- So the important column here is not `status`. It is `told_requester_at`.
-- A request that is shipped and not communicated is worse than one still open:
-- the user is paying, has been ignored for weeks, and the work was already
-- done. `status = 'shipped'` with `told_requester_at IS NULL` is the exact
-- state that keeps happening, and the admin page leads with it.
--
-- Deliberately NOT tied to a Supabase auth user. Requests arrive by email and
-- on calls, from people whose account we may not have looked up yet, and a
-- foreign key would mean the request cannot be recorded until somebody does
-- that lookup. Recording it has to be the cheapest possible action or this
-- table stays empty and the problem comes straight back.

CREATE TABLE IF NOT EXISTS public.feature_requests (
  id              uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),

  requester_name  text NOT NULL,
  requester_email text,
  -- Free text on purpose: 'AT Realty (pro)' carries more than an account id
  -- does when somebody is scanning the list.
  requester_note  text,

  request         text NOT NULL,
  -- Where it came from, so the reply goes back the way it arrived.
  source          text NOT NULL DEFAULT 'email'
                  CHECK (source IN ('email', 'call', 'support', 'in_app', 'other')),

  status          text NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'planned', 'shipped', 'declined')),

  -- Set when the work landed. Separate from told_requester_at precisely
  -- because those two came apart and that is the whole bug.
  shipped_at          timestamptz,
  told_requester_at   timestamptz,

  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- The queue the admin page opens on: anything shipped that nobody has told the
-- requester about, oldest first.
CREATE INDEX IF NOT EXISTS feature_requests_owed_a_reply
  ON public.feature_requests (shipped_at)
  WHERE status = 'shipped' AND told_requester_at IS NULL;

-- Admin reads this with the service-role key, which bypasses RLS. RLS is still
-- enabled with no policy, so an anon or authenticated client sees nothing:
-- these are other customers' words and they are not public.
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- The three that prompted this, recorded as the real records they are rather
-- than as sample rows. Dates and facts from the 18 Aug 2026 support sweep.
-- The NULLs carry explicit casts. In a multi-row VALUES list Postgres infers an
-- untyped NULL as text, and the insert then fails on the timestamptz columns.
INSERT INTO public.feature_requests
  (requester_name, requester_email, requester_note, request, source, status, shipped_at, told_requester_at, notes)
SELECT * FROM (VALUES
  (
    'Michael Feletti', NULL::text, 'paying user',
    'Two separate feature requests, both raised roughly 7 weeks before anyone looked at them.',
    'email', 'shipped', NULL::timestamptz, NULL::timestamptz,
    'ALREADY SHIPPED when the code was checked on 18 Aug 2026, and he was never told. Confirm exactly which two, then write to him. This row is the reason the table exists.'
  ),
  (
    'Kendall Booth', NULL::text, 'AT Realty, paying user',
    'Make the lead notification email clickable so the agent can reply straight to the homeowner.',
    'email', 'shipped', NULL::timestamptz, NULL::timestamptz,
    'The clickable part was already built. The real defect underneath it was a hardcoded replyTo of team@instantappraisal.co in app/api/email/lead-notification/route.ts, so Reply went to us instead of the homeowner. Fixed in commit bd117e3 on 18 Aug 2026. Still on the staging branch and NOT in production as at 7 Sept 2026, so do not tell him it is live until it is.'
  ),
  (
    'Joey Allen', NULL::text, 'Direct Collective, inbound sales enquiry',
    'Deeper website integration. Promised to a paying prospect.',
    'call', 'new', NULL::timestamptz, NULL::timestamptz,
    'Asked to be phoned on 0457 535 472. Recorded here so the promise has a home; it is not being worked on.'
  )
) AS seed(requester_name, requester_email, requester_note, request, source, status, shipped_at, told_requester_at, notes)
WHERE NOT EXISTS (SELECT 1 FROM public.feature_requests);
