import assert from 'node:assert/strict';
import test from 'node:test';
import { buildChallengeShare } from '../domain/challenges/challenge-share.ts';
import { getCuratedChallengeDefinition } from '../domain/challenges/challenge-definition.ts';

test('only completed timed performances invite someone to beat a time', () => {
  const definition = getCuratedChallengeDefinition('100-liegestuetze-am-stueck');
  assert.equal(buildChallengeShare('100 Liegestütze', definition).label, 'Jemanden herausfordern');
  assert.equal(buildChallengeShare('100 Liegestütze', definition, { completed: true, rankingTimeSeconds: null }).label, 'Jemanden herausfordern');
  assert.equal(buildChallengeShare('100 Liegestütze', definition, { completed: false, rankingTimeSeconds: 100 }).label, 'Jemanden herausfordern');
  const timed = buildChallengeShare('100 Liegestütze', definition, { completed: true, rankingTimeSeconds: 132 });
  assert.match(timed.text, /2:12 min/);
  assert.match(timed.text, /schneller/);
});
test('duration challenges invite a longer hold rather than a faster finish', () => {
  const share = buildChallengeShare('Plank', getCuratedChallengeDefinition('10min-am-stueck-planken-challenge'), { completed: true, rankingTimeSeconds: 610 });
  assert.match(share.text, /länger/);
  assert.doesNotMatch(share.text, /schneller/);
});
