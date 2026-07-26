export type ChallengeDuplicateCandidate = {
  title: string;
  slug: string;
};

export type ChallengeDuplicateMatch = ChallengeDuplicateCandidate & {
  reason: "exact" | "similar";
};

const ignoredWords = new Set([
  "am",
  "challenge",
  "der",
  "die",
  "das",
  "eine",
  "einen",
  "jeden",
  "jede",
  "jeder",
  "pro"
]);

function normalizeTitle(value: string): string[] {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("de-DE")
    .replace(/ß/g, "ss")
    .replace(/(\d)[\s.](?=\d{3}\b)/g, "$1")
    .replace(/taeglich/g, "tag")
    .replace(/taglich/g, "tag")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word && !ignoredWords.has(word));
}

function compactTitle(value: string): string {
  return normalizeTitle(value).join(" ");
}

function isSimilarTitle(left: string[], right: string[]): boolean {
  const leftWords = new Set(left);
  const rightWords = new Set(right);
  const smallerSize = Math.min(leftWords.size, rightWords.size);

  if (smallerSize < 2) {
    return false;
  }

  let sharedWords = 0;
  for (const word of Array.from(leftWords)) {
    if (rightWords.has(word)) {
      sharedWords += 1;
    }
  }

  return sharedWords >= 2 && sharedWords / smallerSize >= 0.75;
}

export function findChallengeDuplicates(
  title: string,
  proposedSlug: string,
  candidates: ChallengeDuplicateCandidate[]
): ChallengeDuplicateMatch[] {
  const normalizedTitle = compactTitle(title);
  const titleWords = normalizeTitle(title);
  const seenSlugs = new Set<string>();

  return candidates
    .flatMap<ChallengeDuplicateMatch>((candidate) => {
      if (seenSlugs.has(candidate.slug)) {
        return [];
      }

      const exact = candidate.slug === proposedSlug || compactTitle(candidate.title) === normalizedTitle;
      const similar = !exact && isSimilarTitle(titleWords, normalizeTitle(candidate.title));
      if (!exact && !similar) {
        return [];
      }

      seenSlugs.add(candidate.slug);
      return [{ ...candidate, reason: exact ? "exact" : "similar" }];
    })
    .sort((left, right) => {
      if (left.reason !== right.reason) {
        return left.reason === "exact" ? -1 : 1;
      }
      return left.title.localeCompare(right.title, "de");
    })
    .slice(0, 3);
}
