import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  createPublicChallengeApiClient,
  PublicChallengeApiClientError
} from "../clients/public-challenge-api-client.ts";

const challenge = {
  slug: "10-000-schritte-am-tag",
  title: "10.000 Schritte am Tag",
  level: "Beginner",
  category: null,
  durationDays: null,
  durationLabel: "Fortlaufend",
  goal: "Jeden Tag 10.000 Schritte gehen.",
  description: "Eine tägliche Bewegungs-Challenge.",
  rules: ["Gehe jeden Tag 10.000 Schritte."],
  tips: ["Starte mit einem Spaziergang."],
  createdAt: "2026-07-01",
  creator: { name: "ChallengeHub" },
  url: "https://challengehub.de/challenges/10-000-schritte-am-tag",
  definition: {
    type: "daily_boolean",
    unit: "completion",
    targetValue: 1,
    frequency: "daily",
    direction: "at_least",
    completionCriterion: "daily_check_in"
  }
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("typisierter API-Client baut eine paginierte v1-Listenanfrage und validiert die Antwort", async () => {
  let requestedUrl = "";
  let requestedAccept = "";
  const client = createPublicChallengeApiClient({
    baseUrl: "https://challengehub.de/",
    fetchImpl: async (input, init) => {
      requestedUrl = String(input);
      requestedAccept = new Headers(init?.headers).get("Accept") ?? "";
      return jsonResponse({
        apiVersion: "v1",
        data: [challenge],
        pagination: { limit: 25, nextCursor: "naechste-seite" }
      });
    }
  });

  const page = await client.list({ limit: 25, cursor: "aktuelle-seite" });

  assert.equal(
    requestedUrl,
    "https://challengehub.de/api/v1/challenges?limit=25&cursor=aktuelle-seite"
  );
  assert.equal(requestedAccept, "application/json");
  assert.equal(page.data[0].slug, challenge.slug);
  assert.equal(page.pagination.nextCursor, "naechste-seite");
});

test("typisierter API-Client kodiert Challenge-Slugs und liefert den Detailvertrag", async () => {
  let requestedUrl = "";
  const client = createPublicChallengeApiClient({
    baseUrl: "https://example.test/challengehub",
    fetchImpl: async (input) => {
      requestedUrl = String(input);
      return jsonResponse({ apiVersion: "v1", data: challenge });
    }
  });

  const result = await client.findBySlug("challenge mit leerzeichen");

  assert.equal(
    requestedUrl,
    "https://example.test/challengehub/api/v1/challenges/challenge%20mit%20leerzeichen"
  );
  assert.equal(result.data.title, challenge.title);
});

test("typisierter API-Client reicht strukturierte API-Fehler mit Status und Code weiter", async () => {
  const client = createPublicChallengeApiClient({
    baseUrl: "https://challengehub.de",
    fetchImpl: async () =>
      jsonResponse(
        {
          apiVersion: "v1",
          error: { code: "challenge_not_found", message: "Challenge nicht gefunden." }
        },
        404
      )
  });

  await assert.rejects(client.findBySlug("fehlt"), (error: unknown) => {
    assert.ok(error instanceof PublicChallengeApiClientError);
    assert.equal(error.status, 404);
    assert.equal(error.code, "challenge_not_found");
    return true;
  });
});

test("typisierter API-Client verwirft Vertragsdrift und ungültige Limits vor Nutzung", async () => {
  let requests = 0;
  const client = createPublicChallengeApiClient({
    baseUrl: "https://challengehub.de",
    fetchImpl: async () => {
      requests += 1;
      return jsonResponse({ apiVersion: "v2", data: [challenge] });
    }
  });

  await assert.rejects(client.list({ limit: 101 }), { code: "invalid_pagination", status: 0 });
  assert.equal(requests, 0);

  await assert.rejects(client.list(), { code: "invalid_response", status: 0 });
  assert.equal(requests, 1);
});

test("typisierter API-Client verwirft widersprüchliche Challenge-Definitionen", async () => {
  const client = createPublicChallengeApiClient({
    baseUrl: "https://challengehub.de",
    fetchImpl: async () => jsonResponse({
      apiVersion: "v1",
      data: [{
        ...challenge,
        definition: { ...challenge.definition, frequency: "once" }
      }],
      pagination: { limit: 20, nextCursor: null }
    })
  });

  await assert.rejects(client.list(), { code: "invalid_response", status: 0 });
});
