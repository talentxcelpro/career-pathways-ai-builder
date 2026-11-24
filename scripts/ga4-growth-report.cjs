// TalentXcel GA4 growth report (read-only).
// Setup:  npm i @google-analytics/data
//         set GOOGLE_APPLICATION_CREDENTIALS=gsc-service-account.json
//         The service account needs Viewer on GA4 property 499367883.
// Run:    node scripts/ga4-growth-report.cjs [startDate] [endDate]
// Env:    SIGNUP_EVENT=sign_up   (change if your signup event has another name)

const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');

const PROPERTY = 'properties/499367883';
const SIGNUP = process.env.SIGNUP_EVENT || 'sign_up';
const RANGE = [{ startDate: process.argv[2] || '28daysAgo', endDate: process.argv[3] || 'yesterday' }];

// Support auto-resolving service account key if not explicitly set in env
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const defaultKey = path.join(__dirname, '..', 'gsc-service-account.json');
  if (require('fs').existsSync(defaultKey)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = defaultKey;
  }
}

const client = new BetaAnalyticsDataClient();

const eventIn = (names) => ({
  filter: { fieldName: 'eventName', inListFilter: { values: names } },
});

async function run(req) {
  const [res] = await client.runReport({ property: PROPERTY, dateRanges: RANGE, limit: 10000, ...req });
  return res.rows || [];
}
const dim = (r, i = 0) => r.dimensionValues[i].value;
const met = (r, i = 0) => Number(r.metricValues[i].value);
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) + '%' : '-');

// Collapse /jobs/<uuid> and /jobs/<seo-slug> into /jobs/:id so landing pages group by template.
const normalize = (p) => p.replace(/\?.*$/, '').replace(/\/jobs\/[^/?#]+/i, '/jobs/:id');

async function funnel() {
  const events = [
    'page_view', 'job_view', 'apply_cta_clicked', 'job_apply_click', 'guest_modal_opened',
    'oauth_started', 'auth_started', 'application_submitted', SIGNUP,
    'ats_score_generated', 'match_score_started',
    'one_tap_shown', 'google_onetap_accepted', 'one_tap_dismissed', 'google_onetap_dismissed',
  ];
  const rows = await run({
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    dimensionFilter: eventIn(events),
  });
  console.log('\n=== 1. FUNNEL EVENTS (check for duplicate event names for the same action) ===');
  console.table(rows.map((r) => ({ event: dim(r), events: met(r, 0), users: met(r, 1) })));
}

async function signupsBySource() {
  const [sessions, signups] = await Promise.all([
    run({
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    }),
    run({
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: eventIn([SIGNUP]),
    }),
  ]);
  const su = new Map(signups.map((r) => [dim(r), met(r)]));
  const out = sessions
    .map((r) => ({
      source_medium: dim(r),
      sessions: met(r, 0),
      users: met(r, 1),
      signups: su.get(dim(r)) || 0,
      signup_per_session: pct(su.get(dim(r)) || 0, met(r, 0)),
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 25);
  console.log('\n=== 2. SIGNUPS BY SESSION SOURCE / MEDIUM ===');
  console.table(out);
}

async function signupsByLandingPage() {
  const [sessions, signups] = await Promise.all([
    run({ dimensions: [{ name: 'landingPage' }], metrics: [{ name: 'sessions' }] }),
    run({
      dimensions: [{ name: 'landingPage' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: eventIn([SIGNUP]),
    }),
  ]);
  const agg = new Map();
  for (const r of sessions) {
    const k = normalize(dim(r));
    const a = agg.get(k) || { sessions: 0, signups: 0 };
    a.sessions += met(r);
    agg.set(k, a);
  }
  for (const r of signups) {
    const k = normalize(dim(r));
    const a = agg.get(k) || { sessions: 0, signups: 0 };
    a.signups += met(r);
    agg.set(k, a);
  }
  const out = [...agg.entries()]
    .map(([page, a]) => ({ landing_page: page, ...a, signup_per_session: pct(a.signups, a.sessions) }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 25);
  console.log('\n=== 3. LANDING PAGE TEMPLATE PERFORMANCE ===');
  console.table(out);
}

async function daily() {
  const [traffic, signups] = await Promise.all([
    run({
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }),
    run({
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: eventIn([SIGNUP]),
    }),
  ]);
  const su = new Map(signups.map((r) => [dim(r), met(r)]));
  console.log('\n=== 4. DAILY TRAFFIC vs SIGNUP EVENTS (GA4 date = property timezone; compare with DB in the same zone) ===');
  console.table(
    traffic.map((r) => {
      const d = dim(r);
      const s = su.get(d) || 0;
      return { date: d, users: met(r, 0), sessions: met(r, 1), ga4_signups: s, per_user: pct(s, met(r, 0)) };
    })
  );
}

(async () => {
  console.log(`GA4 property ${PROPERTY} | range ${RANGE[0].startDate} -> ${RANGE[0].endDate} | signup event: ${SIGNUP}`);
  await funnel();
  await signupsBySource();
  await signupsByLandingPage();
  await daily();
  console.log('\nNext: join the same date range against auth.users.created_at (UTC) and the first job_applications row per user.');
})().catch((e) => {
  console.error('GA4 report failed:', e.message);
  process.exit(1);
});
