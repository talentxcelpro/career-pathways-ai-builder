import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatVisitTimestamp } from '../src/utils/visitorDateFormatter.ts';

describe('visitorDateFormatter unit tests', () => {
  it('formats invalid or missing timestamps gracefully', () => {
    assert.strictEqual(formatVisitTimestamp(null).relativeText, 'Unknown date');
    assert.strictEqual(formatVisitTimestamp(undefined).relativeText, 'Unknown date');
    assert.strictEqual(formatVisitTimestamp('not-a-date').relativeText, 'Invalid date');
  });

  it('formats "Just now" for visits under 60 seconds', () => {
    const now = new Date();
    const tenSecondsAgo = new Date(now.getTime() - 15 * 1000);
    const result = formatVisitTimestamp(tenSecondsAgo);
    assert.strictEqual(result.relativeText, 'Just now');
    assert.strictEqual(result.dateText, 'Today');
  });

  it('formats minutes ago for visits between 1 and 59 minutes', () => {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const result = formatVisitTimestamp(twoMinutesAgo);
    assert.strictEqual(result.relativeText, '2 mins ago');
    assert.strictEqual(result.dateText, 'Today');

    const oneMinuteAgo = new Date(now.getTime() - 65 * 1000);
    const resOne = formatVisitTimestamp(oneMinuteAgo);
    assert.strictEqual(resOne.relativeText, '1 min ago');
  });

  it('formats hours ago for visits today under 6 hours', () => {
    const now = new Date();
    // Only test if current hour allows at least 2 hours earlier today
    if (now.getHours() >= 3) {
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const result = formatVisitTimestamp(twoHoursAgo);
      assert.strictEqual(result.relativeText, '2 hours ago');
      assert.strictEqual(result.dateText, 'Today');
    }
  });

  it('formats yesterday properly with local time', () => {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 30);
    const result = formatVisitTimestamp(yesterday);
    assert.ok(result.relativeText.startsWith('Yesterday at 2:30 PM'));
    assert.strictEqual(result.dateText, 'Yesterday');
    assert.strictEqual(result.timeText, '2:30 PM');
  });

  it('formats older dates with month, day and time', () => {
    const older = new Date(2025, 10, 15, 9, 45); // Nov 15, 2025 9:45 AM
    const result = formatVisitTimestamp(older);
    assert.ok(result.relativeText.includes('Nov 15'));
    assert.ok(result.relativeText.includes('9:45 AM'));
    assert.strictEqual(result.timeText, '9:45 AM');
  });
});
