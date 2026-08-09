import type {
  PublicChallengeApiEnvelope,
  PublicChallengeApiItem,
  PublicChallengeApiPage
} from "../domain/challenges/public-challenge-api.ts";
import { parseChallengeDefinition } from "../domain/challenges/challenge-definition.ts";

const API_VERSION = "v1" as const;
const MAX_PAGE_LIMIT = 100;
const CHALLENGE_LEVELS = new Set(["User", "Beginner", "Advanced", "Premium"]);

type Fetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type PublicChallengeListOptions = {
  limit?: number;
  cursor?: string;
  signal?: AbortSignal;
};

export type PublicChallengeApiClient = {
  list(options?: PublicChallengeListOptions): Promise<PublicChallengeApiPage>;
  findBySlug(
    slug: string,
    options?: { signal?: AbortSignal }
  ): Promise<PublicChallengeApiEnvelope<PublicChallengeApiItem>>;
};

export class PublicChallengeApiClientError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "PublicChallengeApiClientError";
    this.status = status;
    this.code = code;
  }
}

export function createPublicChallengeApiClient({
  baseUrl,
  fetchImpl = fetch
}: {
  baseUrl: string;
  fetchImpl?: Fetch;
}): PublicChallengeApiClient {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  return {
    async list(options = {}) {
      const url = new URL("api/v1/challenges", normalizedBaseUrl);

      if (options.limit !== undefined) {
        if (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > MAX_PAGE_LIMIT) {
          throw new PublicChallengeApiClientError(
            0,
            "invalid_pagination",
            "Das Limit muss eine ganze Zahl zwischen 1 und 100 sein."
          );
        }
        url.searchParams.set("limit", String(options.limit));
      }
      if (options.cursor) {
        url.searchParams.set("cursor", options.cursor);
      }

      const payload = await requestJson(url, options.signal, fetchImpl);
      if (!isPublicChallengeApiPage(payload)) {
        throw invalidResponseError();
      }
      return payload;
    },

    async findBySlug(slug, options = {}) {
      const normalizedSlug = slug.trim();
      if (!normalizedSlug) {
        throw new PublicChallengeApiClientError(0, "invalid_slug", "Ein Challenge-Slug fehlt.");
      }

      const url = new URL(`api/v1/challenges/${encodeURIComponent(normalizedSlug)}`, normalizedBaseUrl);
      const payload = await requestJson(url, options.signal, fetchImpl);
      if (!isPublicChallengeApiDetail(payload)) {
        throw invalidResponseError();
      }
      return payload;
    }
  };
}

function normalizeBaseUrl(baseUrl: string): URL {
  try {
    const url = new URL(baseUrl);
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    throw new PublicChallengeApiClientError(
      0,
      "invalid_base_url",
      "Die API-Basis-URL muss absolut sein."
    );
  }
}

async function requestJson(url: URL, signal: AbortSignal | undefined, fetchImpl: Fetch): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers: { Accept: "application/json" },
    signal
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    const error = getApiError(payload);
    throw new PublicChallengeApiClientError(
      response.status,
      error?.code ?? "request_failed",
      error?.message ?? `API-Anfrage fehlgeschlagen (HTTP ${response.status}).`
    );
  }

  return payload;
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw invalidResponseError();
  }
}

function getApiError(payload: unknown): { code: string; message: string } | null {
  if (!isRecord(payload) || payload.apiVersion !== API_VERSION || !isRecord(payload.error)) {
    return null;
  }
  return typeof payload.error.code === "string" && typeof payload.error.message === "string"
    ? { code: payload.error.code, message: payload.error.message }
    : null;
}

function isPublicChallengeApiDetail(
  payload: unknown
): payload is PublicChallengeApiEnvelope<PublicChallengeApiItem> {
  return isPublicChallengeApiEnvelope(payload) && isPublicChallengeApiItem(payload.data);
}

function isPublicChallengeApiPage(payload: unknown): payload is PublicChallengeApiPage {
  return (
    isPublicChallengeApiEnvelope(payload) &&
    Array.isArray(payload.data) &&
    payload.data.every(isPublicChallengeApiItem) &&
    isRecord(payload.pagination) &&
    Number.isInteger(payload.pagination.limit) &&
    typeof payload.pagination.limit === "number" &&
    payload.pagination.limit >= 1 &&
    payload.pagination.limit <= MAX_PAGE_LIMIT &&
    (payload.pagination.nextCursor === null || typeof payload.pagination.nextCursor === "string")
  );
}

function isPublicChallengeApiEnvelope(
  payload: unknown
): payload is PublicChallengeApiEnvelope<unknown> & Record<string, unknown> {
  return isRecord(payload) && payload.apiVersion === API_VERSION && "data" in payload;
}

function isPublicChallengeApiItem(value: unknown): value is PublicChallengeApiItem {
  return (
    isRecord(value) &&
    isNonEmptyString(value.slug) &&
    isNonEmptyString(value.title) &&
    typeof value.level === "string" &&
    CHALLENGE_LEVELS.has(value.level) &&
    (value.category === null || typeof value.category === "string") &&
    (value.durationDays === null || (typeof value.durationDays === "number" && Number.isInteger(value.durationDays))) &&
    isNonEmptyString(value.durationLabel) &&
    isNonEmptyString(value.goal) &&
    isNonEmptyString(value.description) &&
    isStringArray(value.rules) &&
    isStringArray(value.tips) &&
    isNonEmptyString(value.createdAt) &&
    isRecord(value.creator) &&
    isNonEmptyString(value.creator.name) &&
    isNonEmptyString(value.url) &&
    parseChallengeDefinition(value.definition) !== null
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function invalidResponseError() {
  return new PublicChallengeApiClientError(
    0,
    "invalid_response",
    "Die API-Antwort entspricht nicht dem erwarteten v1-Vertrag."
  );
}
