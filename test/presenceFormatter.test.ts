import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPresence } from '../src/utils/presenceFormatter.ts';

test('Presence Formatter Tests', async (t) => {
  const baseTime = new Date('2026-11-23T18:00:00Z');

  await t.test('returns hidden when visibility is nobody or is_visible is false', () => {
    const res1 = formatPresence({ is_online: true, visibility: 'nobody' }, { now: baseTime });
    assert.equal(res1.label, '');
    assert.equal(res1.statusColor, 'hidden');

    const res2 = formatPresence({ is_online: true, is_visible: false }, { now: baseTime });
    assert.equal(res2.label, '');
    assert.equal(res2.statusColor, 'hidden');
  });

  await t.test('returns "Active now" when confirmed online with recent heartbeat', () => {
    const res = formatPresence(
      {
        is_online: true,
        last_heartbeat_at: new Date(baseTime.getTime() - 30_000).toISOString(),
        last_seen: new Date(baseTime.getTime() - 30_000).toISOString()
      },
      { now: baseTime }
    );
    assert.equal(res.label, 'Active now');
    assert.equal(res.isOnline, true);
    assert.equal(res.statusColor, 'green');
  });

  await t.test('does not return "Active now" if is_online is true but heartbeat is older than 2 minutes', () => {
    const res = formatPresence(
      {
        is_online: true,
        last_heartbeat_at: new Date(baseTime.getTime() - 150_000).toISOString(), // 2.5 minutes ago
        last_seen: new Date(baseTime.getTime() - 150_000).toISOString()
      },
      { now: baseTime }
    );
    assert.notEqual(res.label, 'Active now');
    assert.equal(res.isOnline, false);
    assert.equal(res.label, 'Active 2 minutes ago');
  });

  await t.test('returns "Active 1 minute ago" and "Active 18 minutes ago"', () => {
    const res1 = formatPresence(
      { is_online: false, last_seen: new Date(baseTime.getTime() - 65_000).toISOString() },
      { now: baseTime }
    );
    assert.equal(res1.label, 'Active 1 minute ago');

    const res18 = formatPresence(
      { is_online: false, last_seen: new Date(baseTime.getTime() - 18 * 60_000).toISOString() },
      { now: baseTime }
    );
    assert.equal(res18.label, 'Active 18 minutes ago');
  });

  await t.test('returns "Active X hours ago" or "Active today at HH:MM"', () => {
    // 2 hours ago on same day
    const res2h = formatPresence(
      { is_online: false, last_seen: new Date(baseTime.getTime() - 2 * 3600_000).toISOString() },
      { now: baseTime }
    );
    assert.equal(res2h.label, 'Active 2 hours ago');

    // 5 hours ago on same day
    const date5h = new Date(baseTime.getTime() - 5 * 3600_000);
    const res5h = formatPresence(
      { is_online: false, last_seen: date5h.toISOString() },
      { now: baseTime }
    );
    assert.match(res5h.label, /^Active today at /);
  });

  await t.test('returns "Active yesterday" or "Active yesterday at HH:MM"', () => {
    const yesterdayDate = new Date(baseTime);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate.setHours(14, 30, 0, 0);

    const resShort = formatPresence(
      { is_online: false, last_seen: yesterdayDate.toISOString() },
      { now: baseTime, shortYesterday: true }
    );
    assert.equal(resShort.label, 'Active yesterday');

    const resFull = formatPresence(
      { is_online: false, last_seen: yesterdayDate.toISOString() },
      { now: baseTime }
    );
    assert.match(resFull.label, /^Active yesterday at /);
  });

  await t.test('returns "Active [Month Day] at [Time]" for older timestamps', () => {
    const oldDate = new Date(baseTime);
    oldDate.setDate(oldDate.getDate() - 4);
    oldDate.setHours(21, 42, 0, 0);

    const res = formatPresence(
      { is_online: false, last_seen: oldDate.toISOString() },
      { now: baseTime }
    );
    assert.match(res.label, /^Active [A-Z][a-z]{2} \d+ at /);
  });
});
