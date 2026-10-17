import test from 'node:test';
import assert from 'node:assert/strict';
import { getJourneyPeriod } from '../domain/challenges/journey-period.ts';
test('100 calendar days include the local start day and freeze after day 100', () => {
  const slug = '100-tage-body-transformation';
  assert.deepEqual(getJourneyPeriod(slug, '2026-01-01T12:00:00Z', '2026-04-10'), { today: '2026-04-10', ended: false, endDate: '2026-04-10' });
  assert.deepEqual(getJourneyPeriod(slug, '2026-01-01T12:00:00Z', '2026-04-11'), { today: '2026-04-10', ended: true, endDate: '2026-04-10' });
  assert.equal(getJourneyPeriod(slug, '2025-12-31T23:30:00Z', '2026-04-11').endDate, '2026-04-10');
  assert.equal(getJourneyPeriod('10000-schritte-am-tag', '2026-01-01T00:00:00Z', '2026-10-17').ended, false);
});
