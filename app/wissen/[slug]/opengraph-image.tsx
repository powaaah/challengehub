import { ImageResponse } from "next/og";
import { getHabitArticleBySlug, habitArticles } from "@/data/habit-articles";

export const alt = "Wissensartikel auf ChallengeHub";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export function generateStaticParams() {
  return habitArticles.map((article) => ({
    slug: article.slug
  }));
}

type SocialImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function KnowledgeSocialImage({ params }: SocialImageProps) {
  const { slug } = await params;
  const article = getHabitArticleBySlug(slug);
  const title = article?.title ?? "Wissen für deine nächste Challenge";
  const category = article?.category ?? "Wissen";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f4ee",
          color: "#18202b",
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
            <span style={{ fontSize: "32px", fontWeight: 700 }}>ChallengeHub Wissen</span>
          </div>
          <span
            style={{
              padding: "12px 20px",
              borderRadius: "999px",
              background: "#e3ecf8",
              color: "#1455a6",
              fontSize: "24px",
              fontWeight: 700
            }}
          >
            {category}
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
            Gewohnheiten verstehen. Challenges durchhalten.
          </span>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 58 ? "56px" : "68px",
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
            color: "#596779",
            fontSize: "25px"
          }}
        >
          <span>Praxisnah, quellenbasiert und direkt umsetzbar</span>
          <span style={{ color: "#1268dc", fontWeight: 700 }}>challengehub.de/wissen</span>
        </div>
      </div>
    ),
    size
  );
}
