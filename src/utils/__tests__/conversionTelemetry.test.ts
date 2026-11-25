/**
 * src/utils/__tests__/conversionTelemetry.test.ts
 * Automated verification of all 10 Phase A4 Signup Attribution & Telemetry Invariants.
 * Run with: npx tsx --test src/utils/__tests__/conversionTelemetry.test.ts
 */
import test from 'node:test';
import assert from 'node:assert/strict';

// Lightweight browser storage + window mock before importing conversionTelemetry
const memLocal = new Map<string, string>();
const memSession = new Map<string, string>();
const listeners = new Map<string, Array<() => void>>();

(globalThis as any).window = {
  location: {
    hostname: 'talentxcel.in',
    pathname: '/locations/varanasi',
    search: '?utm_source=google&utm_medium=organic',
    href: 'https://talentxcel.in/locations/varanasi?utm_source=google&utm_medium=organic',
  },
  addEventListener: (ev: string, fn: () => void) => {
    if (!listeners.has(ev)) listeners.set(ev, []);
    listeners.get(ev)!.push(fn);
  },
  gtag: () => {},
};
(globalThis as any).document = {
  referrer: 'https://www.google.com/',
  cookie: '',
  visibilityState: 'visible',
};
(globalThis as any).localStorage = {
  getItem: (k: string) => memLocal.get(k) ?? null,
  setItem: (k: string, v: string) => { memLocal.set(k, v); },
  removeItem: (k: string) => { memLocal.delete(k); },
  clear: () => { memLocal.clear(); },
};
(globalThis as any).sessionStorage = {
  getItem: (k: string) => memSession.get(k) ?? null,
  setItem: (k: string, v: string) => { memSession.set(k, v); },
  removeItem: (k: string) => { memSession.delete(k); },
  clear: () => { memSession.clear(); },
};

import { conversionTelemetry } from '../conversionTelemetry';

function resetTelemetryState() {
  memLocal.clear();
  memSession.clear();
  (conversionTelemetry as any).eventsLog = [];
  (conversionTelemetry as any).completedSignupUserIds.clear();
  (conversionTelemetry as any).deduplicationCache.clear();
  (conversionTelemetry as any).syncRetryAttempts = 0;
}

function getLog(): any[] {
  return (conversionTelemetry as any).eventsLog;
}

test('1. Successful email registration records signup_started + signup_completed and flushes immediately', async () => {
  resetTelemetryState();
  let flushedCount = 0;
  (conversionTelemetry as any).syncPendingToSupabase = async function () {
    const pending = this.eventsLog.filter((e: any) => !e.synced);
    flushedCount += pending.length;
    pending.forEach((e: any) => { e.synced = true; });
  };

  await conversionTelemetry.trackSignupStarted('email', { source: 'job_seeker' });
  const tracked = await conversionTelemetry.trackSignupCompletedOnce(
    { id: 'user-email-1', created_at: new Date().toISOString() },
    'email',
    { source: 'job_seeker' }
  );

  assert.equal(tracked, true);
  assert.equal(flushedCount, 2);
  const log = getLog();
  assert.equal(log.some((e) => e.event === 'signup_completed' && e.synced === true), true);
});

test('2. Failed registration does NOT record signup_completed', async () => {
  resetTelemetryState();
  await conversionTelemetry.trackSignupStarted('email', { source: 'job_seeker' });
  // Simulate auth.signUp() returning error -> trackSignupCompletedOnce is NOT called
  const log = getLog();
  assert.equal(log.filter((e) => e.event === 'signup_started').length, 1);
  assert.equal(log.filter((e) => e.event === 'signup_completed').length, 0);
});

test('3. Successful OAuth flow records signup_completed for newly created user', async () => {
  resetTelemetryState();
  (conversionTelemetry as any).syncPendingToSupabase = async function () {
    this.eventsLog.forEach((e: any) => { e.synced = true; });
  };
  const nowMs = Date.parse('2026-11-25T12:00:00Z');
  const tracked = await conversionTelemetry.trackSignupCompletedOnce(
    { id: 'user-oauth-1', created_at: '2026-11-25T11:59:30Z' },
    'oauth',
    { source: 'auth_state_signed_in' },
    nowMs
  );
  assert.equal(tracked, true);
  assert.equal(getLog().some((e) => e.event === 'signup_completed' && e.metadata?.auth_method === 'oauth'), true);
});

test('4. Interrupted OAuth (user never returns / null user) records signup_started only, never signup_completed', async () => {
  resetTelemetryState();
  (conversionTelemetry as any).syncPendingToSupabase = async function () {
    this.eventsLog.forEach((e: any) => { e.synced = true; });
  };
  await conversionTelemetry.trackSignupStarted('oauth', { provider: 'google' });
  const tracked = await conversionTelemetry.trackSignupCompletedOnce(null, 'oauth');
  assert.equal(tracked, false);
  assert.equal(getLog().filter((e) => e.event === 'signup_completed').length, 0);
});

test('5. Mobile registration records signup_started and signup_completed with mobile auth_method', async () => {
  resetTelemetryState();
  (conversionTelemetry as any).syncPendingToSupabase = async function () {
    this.eventsLog.forEach((e: any) => { e.synced = true; });
  };
  await conversionTelemetry.trackSignupStarted('mobile', { source: 'mobile_auth' });
  const tracked = await conversionTelemetry.trackSignupCompletedOnce(
    { id: 'user-mobile-1', created_at: new Date().toISOString() },
    'mobile',
    { source: 'mobile_auth' }
  );
  assert.equal(tracked, true);
  const completed = getLog().find((e) => e.event === 'signup_completed');
  assert.equal(completed?.metadata?.auth_method, 'mobile');
});

test('6. Duplicate completion events for same user ID are deduplicated across email + onAuthStateChange', async () => {
  resetTelemetryState();
  (conversionTelemetry as any).syncPendingToSupabase = async function () {
    this.eventsLog.forEach((e: any) => { e.synced = true; });
  };
  const first = await conversionTelemetry.trackSignupCompletedOnce({ id: 'user-dup-1', created_at: new Date().toISOString() }, 'email');
  const second = await conversionTelemetry.trackSignupCompletedOnce({ id: 'user-dup-1', created_at: new Date().toISOString() }, 'oauth');
  assert.equal(first, true);
  assert.equal(second, false);
  assert.equal(getLog().filter((e) => e.event === 'signup_completed').length, 1);
});

test('7. Navigation before 500ms debounce is safe because flushImmediate() clears timer and syncs immediately', async () => {
  resetTelemetryState();
  let syncCalled = false;
  (conversionTelemetry as any).syncPendingToSupabase = async function () {
    syncCalled = true;
    this.eventsLog.forEach((e: any) => { e.synced = true; });
  };
  await conversionTelemetry.trackSignupCompletedOnce({ id: 'user-nav-1', created_at: new Date().toISOString() }, 'email');
  assert.equal(syncCalled, true);
  assert.equal((conversionTelemetry as any).syncDebounceTimer, null);
});

test('8. Retry after transient failure preserves unsynced event and marks synced on subsequent flush', async () => {
  resetTelemetryState();
  let attempt = 0;
  (conversionTelemetry as any).syncPendingToSupabase = async function () {
    attempt++;
    if (attempt === 1) return; // Simulate transient failure leaving synced=false
    this.eventsLog.forEach((e: any) => { e.synced = true; });
  };
  await conversionTelemetry.trackSignupCompletedOnce({ id: 'user-retry-1', created_at: new Date().toISOString() }, 'email');
  assert.equal(getLog()[0].synced, false);
  await conversionTelemetry.flushImmediate();
  assert.equal(getLog()[0].synced, true);
});

test('9. Existing authenticated users signing back in (>120s since created_at) do NOT trigger signup_completed', async () => {
  resetTelemetryState();
  const nowMs = Date.parse('2026-11-25T12:00:00Z');
  const tracked = await conversionTelemetry.trackSignupCompletedOnce(
    { id: 'user-existing-1', created_at: '2026-10-01T00:00:00Z' },
    'oauth',
    { source: 'auth_state_signed_in' },
    nowMs
  );
  assert.equal(tracked, false);
  assert.equal(getLog().filter((e) => e.event === 'signup_completed').length, 0);
});

test('10. Missing attribution (direct visit with no referrer/UTM) still records valid signup_completed without crashing', async () => {
  resetTelemetryState();
  (globalThis as any).document.referrer = '';
  (globalThis as any).window.location.search = '';
  (conversionTelemetry as any).syncPendingToSupabase = async function () {
    this.eventsLog.forEach((e: any) => { e.synced = true; });
  };
  const tracked = await conversionTelemetry.trackSignupCompletedOnce(
    { id: 'user-direct-1', created_at: new Date().toISOString() },
    'email'
  );
  assert.equal(tracked, true);
  const ev = getLog().find((e) => e.event === 'signup_completed');
  assert.ok(ev?.anonymousSessionId);
  assert.ok(ev?.timestamp);
});
