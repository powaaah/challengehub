import * as assert from "node:assert/strict";
import { test } from "node:test";
import { PostgresqlChallengeWriteRepository } from "../infrastructure/postgresql/postgresql-challenge-write-repository.ts";
import type { PostgresQueryClient } from "../infrastructure/postgresql/postgres-query-client.ts";

type Query = { text: string; values?: unknown[] };
type StoredChallenge = { id: string; creatorId: string; slug: string; title: string; status: string };

const input = {
  id: "challenge-1",
  creatorId: "u1",
  slug: "morgenroutine",
  title: "Morgenroutine",
  level: "User" as const,
  category: "Mindset",
  durationDays: 30,
  goal: "Jeden Morgen bewusst starten",
  description: "Eine einfache Morgenroutine für einen klaren Tagesbeginn.",
  rules: ["Direkt nach dem Aufstehen starten"],
  tips: ["Am Vorabend vorbereiten"],
  definition: {
    type: "cumulative_metric" as const,
    unit: "repetitions" as const,
    targetValue: 1000,
    frequency: "challenge_period" as const,
    direction: "at_least" as const,
    completionCriterion: "cumulative_target" as const
  }
};

function createClient() {
  const queries: Query[] = [];
  const users = new Set(["u1"]);
  const challenges = new Map<string, StoredChallenge>([
    ["published", {
      id: "published", creatorId: "u1", slug: "abendroutine", title: "Abendroutine", status: "published"
    }],
    ["draft", {
      id: "draft", creatorId: "u1", slug: "privater-entwurf", title: "Privater Entwurf", status: "draft"
    }]
  ]);

  const client: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });
      if (text.includes("SELECT slug, title")) {
        return {
          rows: [...challenges.values()]
            .filter((challenge) => challenge.status === "published")
            .map(({ slug, title }) => ({ slug, title }))
        };
      }
      if (text.includes("SELECT slug") && !text.includes("title")) {
        return { rows: [...challenges.values()].map(({ slug }) => ({ slug })) };
      }
      if (text.includes("INSERT INTO challenges")) {
        const [id, creatorId, slug, title] = values ?? [];
        const conflict = [...challenges.values()].some(
          (challenge) => challenge.id === id || challenge.slug === slug
        );
        if (!users.has(String(creatorId)) || conflict) return { rows: [] };
        challenges.set(String(id), {
          id: String(id), creatorId: String(creatorId), slug: String(slug), title: String(title), status: "pending"
        });
        return { rows: [{ slug }] };
      }
      if (text.includes("SELECT 1 AS found")) {
        return { rows: users.has(String(values?.[0])) ? [{ found: 1 }] : [] };
      }
      throw new Error(`Unerwartete Abfrage: ${text}`);
    }
  };

  return { client, challenges, queries };
}

test("PostgreSQL-Challenge-Adapter listet Slugs und nur veröffentlichte öffentliche Kandidaten", async () => {
  const { client, queries } = createClient();
  const repository = new PostgresqlChallengeWriteRepository(client);

  assert.deepEqual(await repository.listSlugs(), ["abendroutine", "privater-entwurf"]);
  assert.deepEqual(await repository.listPublishedChallenges(), [
    { slug: "abendroutine", title: "Abendroutine" }
  ]);
  const publishedQuery = queries.find((query) => query.text.includes("SELECT slug, title"));
  assert.match(publishedQuery?.text ?? "", /visibility = 'public'/);
  assert.match(publishedQuery?.text ?? "", /status = 'published'/);
});

test("PostgreSQL-Challenge-Adapter legt Einreichungen moderationspflichtig und parametrisiert an", async () => {
  const { client, challenges, queries } = createClient();
  const repository = new PostgresqlChallengeWriteRepository(
    client,
    () => "2026-09-02T08:00:00.000Z"
  );

  assert.deepEqual(await repository.createPending(input), {
    status: "created", slug: "morgenroutine"
  });
  assert.equal(challenges.get(input.id)?.status, "pending");

  const insert = queries.find((query) => query.text.includes("INSERT INTO challenges"));
  assert.deepEqual(insert?.values, [
    input.id, input.creatorId, input.slug, input.title, input.level, input.category,
    input.durationDays, input.goal, input.description, JSON.stringify(input.rules),
    JSON.stringify(input.tips), "2026-09-02T08:00:00.000Z", input.definition.type,
    input.definition.unit, input.definition.targetValue, input.definition.frequency,
    input.definition.direction, input.definition.completionCriterion
  ]);
  assert.match(insert?.text ?? "", /'public', 'pending'/);
  assert.match(insert?.text ?? "", /WHERE users\.id = \$2/);
  assert.match(insert?.text ?? "", /ON CONFLICT DO NOTHING/);
  assert.match(insert?.text ?? "", /\$10::jsonb/);
});

test("PostgreSQL-Challenge-Adapter unterscheidet Slug-Konflikt und unbekannten Ersteller", async () => {
  const { client, challenges } = createClient();
  const repository = new PostgresqlChallengeWriteRepository(client);

  assert.deepEqual(await repository.createPending({ ...input, slug: "abendroutine" }), {
    status: "slug_conflict"
  });
  assert.deepEqual(await repository.createPending({
    ...input, id: "challenge-2", creatorId: "missing", slug: "neuer-slug"
  }), { status: "creator_not_found" });
  assert.equal(challenges.size, 2);
});
