import type { MetadataRoute } from "next";
import { getPublishedChallenges } from "@/lib/public-challenges";
import { buildSitemap } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(await getPublishedChallenges());
}
