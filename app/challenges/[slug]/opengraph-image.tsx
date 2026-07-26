import { ImageResponse } from "next/og";
import { getChallengeBySlug, levelLabels } from "@/data/challenges";
import { getPublishedChallengeBySlug } from "@/lib/public-challenges";

export const alt = "Challenge auf ChallengeHub";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

type SocialImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ChallengeSocialImage({ params }: SocialImageProps) {
  const { slug } = await params;
  const curatedChallenge = getChallengeBySlug(slug);
  const communityChallenge = curatedChallenge ? null : await getPublishedChallengeBySlug(slug);
  const title = curatedChallenge?.title ?? communityChallenge?.title ?? "Challenge entdecken";
  const label = curatedChallenge
    ? levelLabels[curatedChallenge.level]
    : communityChallenge?.category ?? "Challenge";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f7fb",
          color: "#111827",
          padding: "72px 80px",
          borderTop: "18px solid #1268dc",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                background: "#1268dc",
                color: "white",
                fontSize: "30px",
                fontWeight: 700
              }}
            >
              C
            </div>
            <span style={{ fontSize: "32px", fontWeight: 700 }}>ChallengeHub</span>
          </div>
          <span
            style={{
              padding: "12px 20px",
              borderRadius: "999px",
              background: "#e1ebfa",
              color: "#1455a6",
              fontSize: "24px",
              fontWeight: 700
            }}
          >
            {label}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px", maxWidth: "1040px" }}>
          <span
            style={{
              color: "#1268dc",
              fontSize: "25px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase"
            }}
          >
            Gemeinsam starten. Dranbleiben. Vergleichen.
          </span>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 55 ? "58px" : "70px",
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: "-0.035em"
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#526174",
            fontSize: "25px"
          }}
        >
          <span>Regeln, Fortschritt und echtes Ranking</span>
          <span style={{ color: "#1268dc", fontWeight: 700 }}>challengehub.de</span>
        </div>
      </div>
    ),
    size
  );
}