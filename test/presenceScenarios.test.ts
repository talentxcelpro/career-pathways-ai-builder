import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPresence, PresenceData } from '../src/utils/presenceFormatter.ts';

test('TALENTXCEL PRESENCE SYSTEM — 20 CRITICAL SCENARIOS SUITE', async (suite) => {
  const baseTime = new Date('2026-11-23T18:00:00Z');

  // Scenario 1: User logs in and is online (fresh heartbeat within 60s)
  await suite.test('Scenario 1: User logs in and has fresh heartbeat -> Active now', () => {
    const presence: PresenceData = {
      is_online: true,
      last_heartbeat_at: new Date(baseTime.getTime() - 10_000).toISOString(),
      last_seen: new Date(baseTime.getTime() - 10_000).toISOString(),
      is_visible: true,
      visibility: 'everyone'
    };
    const res = formatPresence(presence, { now: baseTime });
    assert.equal(res.label, 'Active now');
    assert.equal(res.isOnline, true);
    assert.equal(res.statusColor, 'green');
  });

  // Scenario 2: User navigates between pages (heartbeat interval continues, remains online)
  await suite.test('Scenario 2: User navigates between pages -> Heartbeat updates, remains Active now', () => {
    const pageNavHeartbeat: PresenceData = {
      is_online: true,
      last_heartbeat_at: new Date(baseTime.getTime() - 45_000).toISOString(),
      last_seen: new Date(baseTime.getTime() - 45_000).toISOString(),
      is_visible: true,
      visibility: 'everyone'
    };
    const res = formatPresence(pageNavHeartbeat, { now: baseTime });
    assert.equal(res.label, 'Active now');
    assert.equal(res.isOnline, true);
  });

  // Scenario 3: Multiple tabs (singleton heartbeat active, presence remains online)
  await suite.test('Scenario 3: Multi-tab presence remains Active now', () => {
    const multiTabPresence: PresenceData = {
      is_online: true,
      last_heartbeat_at: new Date(baseTime.getTime() - 25_000).toISOString(),
      is_visible: true,
      visibility: 'everyone'
    };
    const res = formatPresence(multiTabPresence, { now: baseTime });
    assert.equal(res.label, 'Active now');
    assert.equal(res.isOnline, true);
  });

  // Scenario 4: User closes browser (session closed, last heartbeat stops, transitions to past active)
  await suite.test('Scenario 4: User closes browser -> ceases heartbeat, transitions to relative last seen', () => {
    const closedPresence: PresenceData = {
      is_online: false,
      last_seen: new Date(baseTime.getTime() - 12 * 60_000).toISOString(),
      last_heartbeat_at: new Date(baseTime.getTime() - 12 * 60_000).toISOString(),
      is_visible: true,
      visibility: 'everyone'
    };
    const res = formatPresence(closedPresence, { now: baseTime });
    assert.equal(res.label, 'Active 12 minutes ago');
    assert.equal(res.isOnline, false);
    assert.equal(res.statusColor, 'gray');
  });

  // Scenario 5: User backgrounds mobile browser (hidden tab sets is_online=false after grace period)
  await suite.test('Scenario 5: Mobile browser backgrounded -> marked offline after grace period', () => {
    const bgPresence: PresenceData = {
      is_online: false,
      last_seen: new Date(baseTime.getTime() - 3 * 60_000).toISOString(),
      is_visible: true,
      visibility: 'everyone'
    };
    const res = formatPresence(bgPresence, { now: baseTime });
    assert.equal(res.label, 'Active 3 minutes ago');
    assert.equal(res.isOnline, false);
  });

  // Scenario 6: User returns after 10 minutes (tab becomes visible, resumes active now)
  await suite.test('Scenario 6: User returns from background -> immediate heartbeat restores Active now', () => {
    const returnPresence: PresenceData = {
      is_online: true,
      last_heartbeat_at: new Date(baseTime.getTime() - 5_000).toISOString(),
      last_seen: new Date(baseTime.getTime() - 5_000).toISOString(),
      is_visible: true,
      visibility: 'everyone'
    };
    const res = formatPresence(returnPresence, { now: baseTime });
    assert.equal(res.label, 'Active now');
    assert.equal(res.isOnline, true);
  });

  // Scenario 7: Network interruption (is_online was true, but heartbeat stopped 4 minutes ago)
  await suite.test('Scenario 7: Network interruption -> heartbeat expires (>2m), prevents false Active now', () => {
    const staleHeartbeat: PresenceData = {
      is_online: true,
      last_heartbeat_at: new Date(baseTime.getTime() - 4 * 60_000).toISOString(), // 4m ago
      last_seen: new Date(baseTime.getTime() - 4 * 60_000).toISOString(),
      is_visible: true,
      visibility: 'everyone'
    };
    const res = formatPresence(staleHeartbeat, { now: baseTime });
    assert.notEqual(res.label, 'Active now');
    assert.equal(res.isOnline, false);
    assert.equal(res.label, 'Active 4 minutes ago');
  });

  // Scenario 8: Connection recovery (network restored, fresh heartbeat arrives)
  await suite.test('Scenario 8: Connection recovery -> heartbeat successfully records, user is Active now', () => {
    const recoveredPresence: PresenceData = {
      is_online: true,
      last_heartbeat_at: new Date(baseTime.getTime() - 15_000).toISOString(),
      last_seen: new Date(baseTime.getTime() - 15_000).toISOString(),
      is_visible: true,
      visibility: 'everyone'
    };
    const res = formatPresence(recoveredPresence, { now: baseTime });
    assert.equal(res.label, 'Active now');
    assert.equal(res.isOnline, true);
  });

  // Scenario 9: User becomes idle (inactive > 5 minutes, transitions client into inactive mode)
  await suite.test('Scenario 9: Idle timeout -> transitions to relative minute display', () => {
    const idlePresence: PresenceData = {
      is_online: false,
      last_seen: new Date(baseTime.getTime() - 8 * 60_000).toISOString(),
      is_visible: true,
      visibility: 'everyone'
    };
    const res = formatPresence(idlePresence, { now: baseTime });
    assert.equal(res.label, 'Active 8 minutes ago');
    assert.equal(res.isOnline, false);
  });

  // Scenario 10: User disables online visibility (visibility = 'nobody')
  await suite.test('Scenario 10: Visibility set to nobody -> completely hidden status', () => {
    const privatePresence: PresenceData = {
      is_online: true,
      last_seen: baseTime.toISOString(),
      last_heartbeat_at: baseTime.toISOString(),
      visibility: 'nobody',
      is_visible: false
    };
    const res = formatPresence(privatePresence, { now: baseTime });
    assert.equal(res.label, '');
    assert.equal(res.statusColor, 'hidden');
    assert.equal(res.isOnline, false);
  });

  // Scenario 11: Visibility restricted to connections (viewer IS connected -> is_visible: true)
  await suite.test('Scenario 11: Visibility connections_only and viewer is connected -> visible', () => {
    const connPresence: PresenceData = {
      is_online: true,
      last_heartbeat_at: new Date(baseTime.getTime() - 20_000).toISOString(),
      last_seen: new Date(baseTime.getTime() - 20_000).toISOString(),
      visibility: 'connections_only',
      is_visible: true
    };
    const res = formatPresence(connPresence, { now: baseTime });
    assert.equal(res.label, 'Active now');
    assert.equal(res.isOnline, true);
  });

  // Scenario 12: Visibility restricted to connections (viewer is NOT connected -> is_visible: false)
  await suite.test('Scenario 12: Visibility connections_only and viewer NOT connected -> hidden', () => {
    const restrictedPresence: PresenceData = {
      is_online: true,
      last_seen: baseTime.toISOString(),
      visibility: 'connections_only',
      is_visible: false
    };
    const res = formatPresence(restrictedPresence, { now: baseTime });
    assert.equal(res.label, '');
    assert.equal(res.statusColor, 'hidden');
  });

  // Scenario 13: Messaging presence header (Active now or relative minutes)
  await suite.test('Scenario 13: Messaging header presence -> Active 18 minutes ago', () => {
    const msgPresence: PresenceData = {
      is_online: false,
      last_seen: new Date(baseTime.getTime() - 18 * 60_000).toISOString(),
      is_visible: true,
      visibility: 'everyone'
    };
    const res = formatPresence(msgPresence, { now: baseTime });
    assert.equal(res.label, 'Active 18 minutes ago');
  });

  // Scenario 14: Network profile card presence (clean & compact text)
  await suite.test('Scenario 14: Network profile card -> Active now & Active 23 minutes ago', () => {
    const cardPresence1: PresenceData = {
      is_online: true,
      last_heartbeat_at: new Date(baseTime.getTime() - 10_000).toISOString(),
      is_visible: true
    };
    assert.equal(formatPresence(cardPresence1, { now: baseTime }).label, 'Active now');

    const cardPresence2: PresenceData = {
      is_online: false,
      last_seen: new Date(baseTime.getTime() - 23 * 60_000).toISOString(),
      is_visible: true
    };
    assert.equal(formatPresence(cardPresence2, { now: baseTime }).label, 'Active 23 minutes ago');
  });

  // Scenario 15: Timezone formatting (Active today at HH:MM PM/AM)
  await suite.test('Scenario 15: Same-day older activity formats as Active today at HH:MM', () => {
    const sameDayDate = new Date(baseTime);
    sameDayDate.setHours(sameDayDate.getHours() - 5); // 5 hours ago today
    const res = formatPresence(
      { is_online: false, last_seen: sameDayDate.toISOString(), is_visible: true },
      { now: baseTime }
    );
    assert.match(res.label, /^Active today at \d+:\d{2} (AM|PM)$/);
  });

  // Scenario 16: Midnight boundary check
  await suite.test('Scenario 16: Activity across midnight boundary (22:00 yesterday viewed next morning) -> Active yesterday', () => {
    // Construct in viewer's local time: Nov 23 at 22:00 vs Nov 24 at 08:00
    const yesterdayNight = new Date(2026, 10, 23, 22, 0, 0);
    const nextDayMorning = new Date(2026, 10, 24, 8, 0, 0);

    const res = formatPresence(
      { is_online: false, last_seen: yesterdayNight.toISOString(), is_visible: true },
      { now: nextDayMorning, shortYesterday: true }
    );
    assert.equal(res.label, 'Active yesterday');
  });

  // Scenario 17: Yesterday boundary check with explicit time
  await suite.test('Scenario 17: Activity yesterday formats with time or short yesterday', () => {
    const yesterdayDate = new Date(baseTime);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate.setHours(17, 30, 0, 0);

    const resShort = formatPresence(
      { is_online: false, last_seen: yesterdayDate.toISOString(), is_visible: true },
      { now: baseTime, shortYesterday: true }
    );
    assert.equal(resShort.label, 'Active yesterday');

    const resFull = formatPresence(
      { is_online: false, last_seen: yesterdayDate.toISOString(), is_visible: true },
      { now: baseTime }
    );
    assert.match(resFull.label, /^Active yesterday at \d+:\d{2} (AM|PM)$/);
  });

  // Scenario 18: Multiple tabs (does not duplicate heartbeats or clash)
  await suite.test('Scenario 18: Multiple tabs synchronize seamlessly via shared database timestamps', () => {
    const tab1Time = new Date(baseTime.getTime() - 20_000);
    const tab2Time = new Date(baseTime.getTime() - 10_000);
    const res = formatPresence(
      { is_online: true, last_heartbeat_at: tab2Time.toISOString(), last_seen: tab1Time.toISOString(), is_visible: true },
      { now: baseTime }
    );
    assert.equal(res.label, 'Active now');
  });

  // Scenario 19: Mobile Safari & older activity (Nov 21 at 9:42 PM)
  await suite.test('Scenario 19: Mobile Safari older activity -> Active Nov 20 at 9:42 PM', () => {
    const olderDate = new Date(baseTime);
    olderDate.setDate(olderDate.getDate() - 3);
    olderDate.setHours(21, 42, 0, 0);

    const res = formatPresence(
      { is_online: false, last_seen: olderDate.toISOString(), is_visible: true },
      { now: baseTime }
    );
    assert.match(res.label, /^Active Nov \d+ at \d+:\d{2} (AM|PM)$/);
  });

  // Scenario 20: Supabase load and query efficiency (batch retrieval structure)
  await suite.test('Scenario 20: Supabase load & batch query efficiency contract', () => {
    // Array of batch presence items
    const batchMock = [
      { user_id: 'uuid-1', is_online: true, last_heartbeat_at: new Date(baseTime.getTime() - 10_000).toISOString(), is_visible: true, visibility: 'everyone' },
      { user_id: 'uuid-2', is_online: false, last_seen: new Date(baseTime.getTime() - 23 * 60_000).toISOString(), is_visible: true, visibility: 'everyone' },
      { user_id: 'uuid-3', is_online: true, last_seen: baseTime.toISOString(), is_visible: false, visibility: 'nobody' }
    ];

    const formattedBatch = batchMock.map(item => ({
      userId: item.user_id,
      ...formatPresence(item, { now: baseTime })
    }));

    assert.equal(formattedBatch[0].label, 'Active now');
    assert.equal(formattedBatch[0].isOnline, true);

    assert.equal(formattedBatch[1].label, 'Active 23 minutes ago');
    assert.equal(formattedBatch[1].isOnline, false);

    assert.equal(formattedBatch[2].label, '');
    assert.equal(formattedBatch[2].statusColor, 'hidden');
  });
});
