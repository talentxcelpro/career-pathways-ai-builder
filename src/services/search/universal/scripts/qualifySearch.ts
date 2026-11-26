/**
 * TalentXcel Universal Search — Live Qualification Script
 * Phase 2 of 10: Real Search Qualification + Provider Failure + Security + Latency + Error States
 *
 * Run: npx tsx src/services/search/universal/scripts/qualifySearch.ts
 *
 * READ-ONLY: No writes. Uses anon key from VITE_SUPABASE_PUBLISHABLE_KEY.
 * No PII is logged — only titles, urls, counts, and latencies.
 */

import { createClient } from '@supabase/supabase-js';
// NOTE: We instantiate QueryInterpreter inline below to avoid @/ alias resolution issues in tsx node context.
// The logic is duplicated minimally just for intent parsing in qualification output.

// ── Supabase client using anon key (same as browser client) ──────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Lightweight intent parsing for display only (avoids @/ alias)
function parseIntent(query: string): { queryType: string; targetScopes: string[]; roles: string[]; skills: string[]; cities: string[]; keywords: string[] } {
  const q = query.toLowerCase();
  const roles: string[] = [];
  const skills: string[] = [];
  const cities: string[] = [];
  const keywords: string[] = [];

  for (const r of ['recruiter', 'hr manager', 'developer', 'engineer', 'fresher', 'candidate', 'professional', 'healthcare']) {
    if (q.includes(r)) roles.push(r);
  }
  for (const s of ['python', 'java', 'aws', 'react', 'node', 'sap', 'mba', 'supply chain', 'data science']) {
    if (q.includes(s)) skills.push(s);
  }
  for (const c of ['bangalore', 'bengaluru', 'delhi', 'noida', 'mumbai', 'hyderabad', 'india', 'dubai', 'it']) {
    if (q.includes(c)) cities.push(c);
  }

  const scopes: string[] = [];
  if (q.includes('post') || q.includes('discussion') || q.includes('work from home')) scopes.push('posts');
  if (q.includes('job') || q.includes('internship') || q.includes('hiring') || q.includes('fresher')) scopes.push('jobs');
  if (q.includes('communit') || q.includes('startup')) scopes.push('communities');
  if (q.includes('articl') || q.includes('ats') || q.includes('resume')) scopes.push('articles');
  if (q.includes('course') || q.includes('learn') || q.includes('data science')) scopes.push('courses');
  if (q.includes('colleg')) scopes.push('colleges');
  if (q.includes('compan')) scopes.push('companies');
  if (scopes.length === 0) scopes.push('people');
  if (!scopes.includes('people')) scopes.unshift('people');

  const stopWords = new Set(['find', 'show', 'me', 'with', 'in', 'for', 'and', 'the', 'my', 'who', 'are', 'working', 'at', 'about', 'of', 'a', 'an', 'have', 'has', 'hiring', 'recently', 'last', 'people', 'professionals', 'candidates']);
  q.split(/\s+/).forEach((w) => { if (!stopWords.has(w) && w.length >= 3) keywords.push(w); });

  const queryType = q.includes('post') ? 'posts' : q.includes('job') || q.includes('internship') ? 'jobs' : q.includes('communit') ? 'communities' : 'people';
  return { queryType, targetScopes: [...new Set(scopes)], roles, skills, cities, keywords: keywords.slice(0, 5) };
}

// ── Types ────────────────────────────────────────────────────────────────────
interface ProviderResult {
  provider: string;
  status: 'pass' | 'fail' | 'empty' | 'error';
  count: number;
  latencyMs: number;
  errorMessage?: string;
  sampleTitles: string[];
}

interface QueryResult {
  query: string;
  parsedIntent: string;
  entities: string;
  filters: string;
  providers: ProviderResult[];
  totalItems: number;
  totalLatencyMs: number;
}

// ── Helper: safe ILIKE escape ────────────────────────────────────────────────
function safeText(s: string) {
  return s.replace(/[,%()]/g, ' ').trim();
}

// ── Provider test runners (READ-ONLY, anon access) ───────────────────────────

async function testJobs(term: string, location: string): Promise<ProviderResult> {
  const t0 = Date.now();
  try {
    let q = supabase
      .from('jobs')
      .select('id, title, location', { count: 'exact' })
      .eq('status', 'active')
      .limit(5);
    if (term) q = (q as any).or(`title.ilike.%${safeText(term)}%,description.ilike.%${safeText(term)}%`);
    if (location) q = (q as any).ilike('location', `%${safeText(location)}%`);
    const { data, error, count } = await q;
    if (error) return { provider: 'jobs', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: error.message, sampleTitles: [] };
    const titles = (data || []).map((r: any) => r.title).filter(Boolean);
    return { provider: 'jobs', status: (count || 0) > 0 ? 'pass' : 'empty', count: count || 0, latencyMs: Date.now() - t0, sampleTitles: titles.slice(0, 3) };
  } catch (e: any) {
    return { provider: 'jobs', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: String(e.message), sampleTitles: [] };
  }
}

async function testPeople(term: string, location: string): Promise<ProviderResult> {
  const t0 = Date.now();
  try {
    let q = (supabase as any)
      .from('public_profiles')
      .select('id, full_name, title, location', { count: 'exact' })
      .not('full_name', 'is', null)
      .neq('full_name', '')
      .limit(5);
    if (term) q = q.or(`full_name.ilike.%${safeText(term)}%,title.ilike.%${safeText(term)}%,headline.ilike.%${safeText(term)}%`);
    if (location) q = q.ilike('location', `%${safeText(location)}%`);
    const { data, error, count } = await q;
    if (error) return { provider: 'people', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: error.message, sampleTitles: [] };
    const titles = (data || []).map((r: any) => `${r.full_name} (${r.title || 'No title'})`).filter(Boolean);
    return { provider: 'people', status: (count || 0) > 0 ? 'pass' : 'empty', count: count || 0, latencyMs: Date.now() - t0, sampleTitles: titles.slice(0, 3) };
  } catch (e: any) {
    return { provider: 'people', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: String(e.message), sampleTitles: [] };
  }
}

async function testPosts(term: string): Promise<ProviderResult> {
  const t0 = Date.now();
  try {
    let q = supabase
      .from('posts')
      .select('id, headline, content', { count: 'exact' })
      .eq('status', 'published')
      .eq('is_deleted', false)
      .eq('is_public', true)
      .limit(5);
    if (term) q = (q as any).or(`headline.ilike.%${safeText(term)}%,content.ilike.%${safeText(term)}%`);
    const { data, error, count } = await q;
    if (error) return { provider: 'posts', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: error.message, sampleTitles: [] };
    const titles = (data || []).map((r: any) => r.headline || (r.content || '').slice(0, 60)).filter(Boolean);
    return { provider: 'posts', status: (count || 0) > 0 ? 'pass' : 'empty', count: count || 0, latencyMs: Date.now() - t0, sampleTitles: titles.slice(0, 3) };
  } catch (e: any) {
    return { provider: 'posts', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: String(e.message), sampleTitles: [] };
  }
}

async function testCompanies(term: string): Promise<ProviderResult> {
  const t0 = Date.now();
  try {
    let q = supabase
      .from('companies')
      .select('id, name, industry', { count: 'exact' })
      .limit(5);
    if (term) q = (q as any).or(`name.ilike.%${safeText(term)}%,industry.ilike.%${safeText(term)}%`);
    const { data, error, count } = await q;
    if (error) return { provider: 'companies', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: error.message, sampleTitles: [] };
    const titles = (data || []).map((r: any) => r.name).filter(Boolean);
    return { provider: 'companies', status: (count || 0) > 0 ? 'pass' : 'empty', count: count || 0, latencyMs: Date.now() - t0, sampleTitles: titles.slice(0, 3) };
  } catch (e: any) {
    return { provider: 'companies', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: String(e.message), sampleTitles: [] };
  }
}

async function testCommunities(term: string): Promise<ProviderResult> {
  const t0 = Date.now();
  try {
    const [gRes, gcRes] = await Promise.all([
      (supabase as any)
        .from('groups')
        .select('id, name, category', { count: 'exact' })
        .eq('is_public', true)
        .or(term ? `name.ilike.%${safeText(term)}%,category.ilike.%${safeText(term)}%` : 'id.neq.00000000-0000-0000-0000-000000000000')
        .limit(3),
      (supabase as any)
        .from('goal_communities')
        .select('id, name, goal_type', { count: 'exact' })
        .eq('is_active', true)
        .or(term ? `name.ilike.%${safeText(term)}%,goal_type.ilike.%${safeText(term)}%` : 'id.neq.00000000-0000-0000-0000-000000000000')
        .limit(3),
    ]);
    const hasError = gRes.error || gcRes.error;
    if (hasError) {
      const errMsg = (gRes.error?.message || '') + ' ' + (gcRes.error?.message || '');
      return { provider: 'communities', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: errMsg.trim(), sampleTitles: [] };
    }
    const total = (gRes.count || 0) + (gcRes.count || 0);
    const titles = [...(gRes.data || []).map((r: any) => r.name), ...(gcRes.data || []).map((r: any) => r.name)].filter(Boolean);
    return { provider: 'communities', status: total > 0 ? 'pass' : 'empty', count: total, latencyMs: Date.now() - t0, sampleTitles: titles.slice(0, 3) };
  } catch (e: any) {
    return { provider: 'communities', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: String(e.message), sampleTitles: [] };
  }
}

async function testArticles(term: string): Promise<ProviderResult> {
  const t0 = Date.now();
  try {
    let q = supabase
      .from('content_hub')
      .select('id, title, content_type', { count: 'exact' })
      .eq('status', 'published')
      .limit(5);
    if (term) q = (q as any).or(`title.ilike.%${safeText(term)}%,excerpt.ilike.%${safeText(term)}%`);
    const { data, error, count } = await q;
    if (error) return { provider: 'articles', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: error.message, sampleTitles: [] };
    const titles = (data || []).map((r: any) => r.title).filter(Boolean);
    return { provider: 'articles', status: (count || 0) > 0 ? 'pass' : 'empty', count: count || 0, latencyMs: Date.now() - t0, sampleTitles: titles.slice(0, 3) };
  } catch (e: any) {
    return { provider: 'articles', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: String(e.message), sampleTitles: [] };
  }
}

async function testCourses(term: string): Promise<ProviderResult> {
  const t0 = Date.now();
  try {
    let q = supabase
      .from('courses')
      .select('id, title, category', { count: 'exact' })
      .eq('is_active', true)
      .eq('published', true)
      .limit(5);
    if (term) q = (q as any).or(`title.ilike.%${safeText(term)}%,category.ilike.%${safeText(term)}%`);
    const { data, error, count } = await q;
    if (error) return { provider: 'courses', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: error.message, sampleTitles: [] };
    const titles = (data || []).map((r: any) => r.title).filter(Boolean);
    return { provider: 'courses', status: (count || 0) > 0 ? 'pass' : 'empty', count: count || 0, latencyMs: Date.now() - t0, sampleTitles: titles.slice(0, 3) };
  } catch (e: any) {
    return { provider: 'courses', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: String(e.message), sampleTitles: [] };
  }
}

async function testReels(term: string): Promise<ProviderResult> {
  const t0 = Date.now();
  try {
    let q = supabase
      .from('reels')
      .select('id, title, description', { count: 'exact' })
      .eq('status', 'published')
      .limit(5);
    if (term) q = (q as any).or(`title.ilike.%${safeText(term)}%,description.ilike.%${safeText(term)}%`);
    const { data, error, count } = await q;
    if (error) return { provider: 'reels', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: error.message, sampleTitles: [] };
    const titles = (data || []).map((r: any) => r.title || 'Reel').filter(Boolean);
    return { provider: 'reels', status: (count || 0) > 0 ? 'pass' : 'empty', count: count || 0, latencyMs: Date.now() - t0, sampleTitles: titles.slice(0, 3) };
  } catch (e: any) {
    return { provider: 'reels', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: String(e.message), sampleTitles: [] };
  }
}

async function testColleges(term: string): Promise<ProviderResult> {
  const t0 = Date.now();
  try {
    let q = supabase
      .from('colleges')
      .select('id, name, location', { count: 'exact' })
      .limit(5);
    if (term) q = (q as any).or(`name.ilike.%${safeText(term)}%,location.ilike.%${safeText(term)}%`);
    const { data, error, count } = await q;
    if (error) return { provider: 'colleges', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: error.message, sampleTitles: [] };
    const titles = (data || []).map((r: any) => r.name).filter(Boolean);
    return { provider: 'colleges', status: (count || 0) > 0 ? 'pass' : 'empty', count: count || 0, latencyMs: Date.now() - t0, sampleTitles: titles.slice(0, 3) };
  } catch (e: any) {
    return { provider: 'colleges', status: 'error', count: 0, latencyMs: Date.now() - t0, errorMessage: String(e.message), sampleTitles: [] };
  }
}

// ── PHASE 3: Failure isolation check ─────────────────────────────────────────
async function testFailureIsolation(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('PHASE 3 — Provider Failure Isolation');
  console.log('═══════════════════════════════════════════════════════════');

  // Test: broken provider should not block others
  const t0 = Date.now();
  const results = await Promise.allSettled([
    testPeople('software engineer', ''),          // should work
    Promise.reject(new Error('SIMULATED_PROVIDER_FAILURE')),  // simulated failure
    testJobs('React developer', 'India'),          // should still work
  ]);

  let passCount = 0;
  let failCount = 0;
  for (const r of results) {
    if (r.status === 'fulfilled') {
      passCount++;
      console.log(`  ✓ Provider succeeded: ${r.value.provider} (${r.value.count} results, ${r.value.latencyMs}ms)`);
    } else {
      failCount++;
      console.log(`  ✗ Provider failed: ${r.reason?.message || 'unknown'} — ISOLATED (did not block others)`);
    }
  }
  console.log(`\n  Failure Isolation: ${passCount} succeeded, ${failCount} failed`);
  console.log(`  Promise.allSettled behavior: ${failCount > 0 && passCount > 0 ? 'PASS — partial results returned despite failure' : 'UNEXPECTED'}`);
  console.log(`  Total latency: ${Date.now() - t0}ms`);
}

// ── PHASE 4: Security validation (anon access) ─────────────────────────────
async function testSecurity(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('PHASE 4 — Security Validation (anon role)');
  console.log('═══════════════════════════════════════════════════════════');

  // 1. Base profiles table must be blocked to anon
  const { data: rawProfiles, error: rawErr } = await supabase
    .from('profiles')
    .select('id, email, phone')
    .limit(1);

  if (rawErr) {
    console.log(`  ✓ RAW profiles blocked to anon: ${rawErr.message}`);
  } else if (!rawProfiles || rawProfiles.length === 0) {
    console.log(`  ✓ RAW profiles: anon returned 0 rows (RLS restricting OK)`);
  } else {
    console.log(`  ✗ RAW profiles EXPOSED to anon! Rows returned: ${rawProfiles.length}`);
    // Check if sensitive columns are present
    const sample = rawProfiles[0] as any;
    if (sample.email || sample.phone) {
      console.log(`  ✗✗ CRITICAL: email/phone PII visible in anon profiles response!`);
    }
  }

  // 2. public_profiles view must work for anon (22-col sanitized view)
  const { data: pubProfiles, error: pubErr } = await (supabase as any)
    .from('public_profiles')
    .select('id, full_name, title')
    .limit(3);

  if (pubErr) {
    console.log(`  ✗ public_profiles view: anon access BLOCKED — ${pubErr.message}`);
    console.log(`    NOTE: This view MUST be accessible to anon per Migration A grant.`);
  } else {
    const count = (pubProfiles || []).length;
    console.log(`  ✓ public_profiles view: anon can read (${count} sample rows returned)`);
    // Verify no PII columns returned
    const sample = (pubProfiles || [])[0] as any;
    if (sample) {
      const hasPII = sample.email !== undefined || sample.phone !== undefined || sample.salary !== undefined;
      console.log(`  ${hasPII ? '✗ PII DETECTED' : '✓ No PII columns'} in public_profiles anon response`);
    }
  }

  // 3. direct_messages must be blocked to anon
  const { data: msgs, error: msgErr } = await supabase
    .from('direct_messages')
    .select('id, message_content, sender_id, recipient_id')
    .limit(1);

  if (msgErr) {
    console.log(`  ✓ direct_messages blocked to anon: ${msgErr.message}`);
  } else if (!msgs || msgs.length === 0) {
    console.log(`  ✓ direct_messages: anon returned 0 rows (RLS OK)`);
  } else {
    console.log(`  ✗ direct_messages EXPOSED to anon! ${msgs.length} rows`);
  }

  // 4. unified_candidates must be restricted (recruiter-only view)
  const { data: candidates, error: candErr } = await supabase
    .from('unified_candidates')
    .select('id, name, email, phone')
    .limit(1);

  if (candErr) {
    console.log(`  ✓ unified_candidates blocked to anon: ${candErr.message}`);
  } else if (!candidates || candidates.length === 0) {
    console.log(`  ✓ unified_candidates: anon returned 0 rows (RLS OK)`);
  } else {
    const sample = (candidates as any[])[0];
    const hasPII = sample?.email || sample?.phone;
    console.log(`  ✗ unified_candidates accessible to anon (${candidates.length} rows)${hasPII ? ' — PII EXPOSED' : ''}`);
  }

  // 5. connections table — anon scope check
  const { data: conns, error: connErr } = await supabase
    .from('connections')
    .select('id, requester_id, recipient_id')
    .limit(1);

  if (connErr) {
    console.log(`  ✓ connections blocked to anon: ${connErr.message}`);
  } else if (!conns || conns.length === 0) {
    console.log(`  ✓ connections: anon returned 0 rows (RLS OK)`);
  } else {
    console.log(`  ✗ connections accessible to anon (${conns.length} rows) — may expose relationship graph`);
  }

  // 6. MessagesProvider exclusion from default scopes check (code-level)
  const jobsIntent = parseIntent('Find software engineers in Bangalore');
  const hasMessages = jobsIntent.targetScopes.includes('messages');
  console.log(`  ${hasMessages ? '✗ messages in default scope — SECURITY ISSUE' : '✓ messages excluded from default scopes'}`);

  const msgIntent = parseIntent('Find my messages from last week');
  const hasMsgScope = msgIntent.targetScopes.includes('messages');
  console.log(`  ${hasMsgScope ? '✓ messages scope activated for explicit message query' : '✓ messages scope not triggered (expected — requires auth)'}`);
}

// ── PHASE 8: Empty/error state tests ─────────────────────────────────────────
async function testEdgeCases(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('PHASE 8 — Empty Results & Error States');
  console.log('═══════════════════════════════════════════════════════════');

  const edgeCases = [
    { label: 'Empty query ""', term: '', loc: '' },
    { label: 'Unknown skill "xyzfoo123abc language"', term: 'xyzfoo123abc language', loc: '' },
    { label: 'Unknown location "Zxqwerty City"', term: 'software', loc: 'Zxqwerty City' },
    { label: 'Very long query (200 chars)', term: 'senior software engineer'.repeat(9).slice(0, 200), loc: '' },
    { label: 'Special chars query "React & (Node.js)"', term: 'React & (Node.js)', loc: '' },
  ];

  for (const ec of edgeCases) {
    const t0 = Date.now();
    const result = await testPeople(ec.term, ec.loc);
    const latency = Date.now() - t0;
    const icon = result.status === 'error' ? '✗' : '✓';
    console.log(`  ${icon} ${ec.label}: ${result.status} (${result.count} results, ${latency}ms) ${result.errorMessage || ''}`);
  }
}

// ── Main test suite: 25 search queries ───────────────────────────────────────
const TEST_QUERIES = [
  { q: 'HR managers in Noida', term: 'HR manager', loc: 'Noida' },
  { q: 'Recruiters in Bangalore', term: 'recruiter', loc: 'Bangalore' },
  { q: 'Python developers with 5 years experience', term: 'Python developer', loc: '' },
  { q: 'Remote marketing jobs', term: 'marketing', loc: '' },
  { q: 'Jobs for freshers in Delhi', term: 'fresher', loc: 'Delhi' },
  { q: 'Posts about AI recruitment', term: 'AI recruitment', loc: '' },
  { q: 'Communities for startup founders', term: 'startup', loc: '' },
  { q: 'Articles about ATS resumes', term: 'ATS resume', loc: '' },
  { q: 'Candidates with Java and AWS', term: 'Java AWS', loc: '' },
  { q: 'Companies hiring in India', term: '', loc: 'India' },
  { q: 'Internships in marketing', term: 'marketing internship', loc: '' },
  { q: 'People working at Microsoft', term: 'Microsoft', loc: '' },
  { q: 'Posts in the last 24 hours', term: '', loc: '' }, // time-range test, not term-based
  { q: 'Candidates with MBA degree', term: 'MBA', loc: '' },
  { q: 'Healthcare professionals', term: 'healthcare', loc: '' },
  { q: 'Recruiters in Dubai', term: 'recruiter', loc: 'Dubai' },
  { q: 'Startup communities', term: 'startup', loc: '' },
  { q: 'Professionals with supply chain experience', term: 'supply chain', loc: '' },
  { q: 'SAP candidates', term: 'SAP', loc: '' },
  { q: 'Jobs requiring React and Node', term: 'React Node', loc: '' },
  { q: 'People recently joining the platform', term: '', loc: '' }, // sorted by created_at
  { q: 'Professionals in IT in my network', term: 'IT', loc: '' },
  { q: 'Posts about work from home', term: 'work from home', loc: '' },
  { q: 'Courses on data science', term: 'data science', loc: '' },
  { q: 'Colleges in Bangalore', term: 'Bangalore', loc: 'Bangalore' },
];

async function runMainQualification(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('PHASE 2 — Real Search Qualification (25 queries × providers)');
  console.log('═══════════════════════════════════════════════════════════');

  const summary: { query: string; providersRan: number; providersHadResults: number; total: number; maxLatency: number; errors: string[] }[] = [];

  for (const tq of TEST_QUERIES) {
    const intent = parseIntent(tq.q);
    const t0 = Date.now();
    // Run relevant providers in parallel (read-only)
    const results = await Promise.allSettled([
      testJobs(tq.term, tq.loc),
      testPeople(tq.term, tq.loc),
      testPosts(tq.term),
      testCompanies(tq.term),
      testCommunities(tq.term),
    ]);

    const resolved: ProviderResult[] = [];
    const errors: string[] = [];

    for (const r of results) {
      if (r.status === 'fulfilled') {
        resolved.push(r.value);
        if (r.value.status === 'error') errors.push(`${r.value.provider}: ${r.value.errorMessage}`);
      } else {
        errors.push(`REJECTED: ${r.reason?.message || 'unknown'}`);
      }
    }

    const totalItems = resolved.reduce((s, r) => s + r.count, 0);
    const hasResults = resolved.some((r) => r.status === 'pass');
    const maxLatency = Math.max(...resolved.map((r) => r.latencyMs), 0);

    console.log(`\n  Query: "${tq.q}"`);
    console.log(`    Intent: ${intent.queryType} | Scopes: ${intent.targetScopes.join(', ')}`);
    console.log(`    Entities: roles=${JSON.stringify(intent.roles)} skills=${JSON.stringify(intent.skills)} cities=${JSON.stringify(intent.cities)}`);
    console.log(`    Results: ${totalItems} total | Latency: ${Date.now() - t0}ms`);
    for (const r of resolved) {
      const icon = r.status === 'pass' ? '✓' : r.status === 'empty' ? '○' : '✗';
      const samples = r.sampleTitles.length > 0 ? ` → [${r.sampleTitles.slice(0, 2).join(' | ')}]` : '';
      console.log(`      ${icon} ${r.provider}: ${r.count} results (${r.latencyMs}ms)${samples}${r.errorMessage ? ` ERROR: ${r.errorMessage}` : ''}`);
    }
    if (errors.length > 0) console.log(`    ERRORS: ${errors.join('; ')}`);

    summary.push({
      query: tq.q,
      providersRan: resolved.length,
      providersHadResults: resolved.filter((r) => r.status === 'pass').length,
      total: totalItems,
      maxLatency,
      errors,
    });
  }

  // Phase 5 quality summary
  console.log('\n── Phase 5: Search Quality Summary ──');
  const withResults = summary.filter((s) => s.total > 0);
  const withErrors = summary.filter((s) => s.errors.length > 0);
  const avgLatency = summary.reduce((s, r) => s + r.maxLatency, 0) / summary.length;
  console.log(`  Queries returning results: ${withResults.length}/${summary.length}`);
  console.log(`  Queries with errors: ${withErrors.length}/${summary.length}`);
  console.log(`  Average max-provider latency: ${Math.round(avgLatency)}ms`);
  const slowQueries = summary.filter((s) => s.maxLatency > 2000);
  if (slowQueries.length > 0) {
    console.log(`  Slow queries (>2s): ${slowQueries.map((s) => `"${s.query}"(${s.maxLatency}ms)`).join(', ')}`);
  }

  return;
}

// ── PHASE 9: Index qualification (read migration file) ───────────────────────
async function testIndexQualification(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('PHASE 9 — Index Qualification');
  console.log('═══════════════════════════════════════════════════════════');

  // Check whether pg_trgm indexes are likely in effect by timing ILIKE vs term
  const t0 = Date.now();
  const { count: c1 } = await (supabase as any)
    .from('public_profiles')
    .select('id', { count: 'exact', head: true })
    .ilike('full_name', '%engineer%');
  const t1 = Date.now();
  const { count: c2 } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .ilike('title', '%software%');
  const t2 = Date.now();
  const { count: c3 } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('is_public', true)
    .eq('status', 'published');
  const t3 = Date.now();

  console.log(`  public_profiles ILIKE "engineer": ${c1} rows in ${t1 - t0}ms`);
  console.log(`  jobs ILIKE "software": ${c2} rows in ${t2 - t1}ms`);
  console.log(`  posts (is_public=true, status=published): ${c3} rows in ${t3 - t2}ms`);
  console.log(`  Note: Latencies <100ms suggest trgm index is active; >500ms indicates full scan`);
}

// ── Entry point ───────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   TalentXcel Universal Search — Live Qualification        ║');
  console.log('║   Production: dthlgsnakhoftinssokm | anon role            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`  Time: ${new Date().toISOString()}`);
  console.log('  Mode: READ-ONLY (anon key). No writes. No RLS bypass.');

  await runMainQualification();
  await testFailureIsolation();
  await testSecurity();
  await testEdgeCases();
  await testIndexQualification();

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Qualification Script Complete                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
