import { NextResponse } from "next/server";
import { findPublicChallengeForApi } from "@/lib/public-challenge-api";

export const dynamic = "force-dynamic";

type ChallengeApiRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: ChallengeApiRouteProps) {
  const { slug } = await params;
  const challenge = await findPublicChallengeForApi(slug);
  const headers = {
    "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    "X-Robots-Tag": "noindex"
  };

  if (!challenge) {
    return NextResponse.json(
      {
        apiVersion: "v1",
        error: {
          code: "challenge_not_found",
          message: "Challenge nicht gefunden."
        }
      },
      { status: 404, headers }
    );
  }

  return NextResponse.json(challenge, { headers });
}
