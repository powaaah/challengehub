import { NextResponse } from "next/server";
import { parsePublicChallengeApiPagination } from "@/domain/challenges/public-challenge-api";
import { listPublicChallengesForApi } from "@/lib/public-challenge-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = {
    "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    "X-Robots-Tag": "noindex"
  };
  const pagination = parsePublicChallengeApiPagination(new URL(request.url).searchParams);

  if (!pagination) {
    return NextResponse.json(
      {
        apiVersion: "v1",
        error: {
          code: "invalid_pagination",
          message: "Limit oder Cursor ist ungültig."
        }
      },
      { status: 400, headers }
    );
  }

  return NextResponse.json(await listPublicChallengesForApi(pagination), { headers });
}
