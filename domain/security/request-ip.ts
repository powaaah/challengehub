import { isIP } from "node:net";

type ResolveRateLimitClientIpInput = {
  nodeEnv?: string;
  trustProxy?: string;
  forwardedFor: string | null;
  realIp: string | null;
};

export function resolveRateLimitClientIp(input: ResolveRateLimitClientIpInput) {
  if (input.trustProxy !== "true") {
    if (input.nodeEnv === "production") {
      throw new Error("TRUST_PROXY=true must be configured for production IP rate limits.");
    }
    return "local-development";
  }

  const forwardedIps = input.forwardedFor
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const forwardedIp = forwardedIps?.[forwardedIps.length - 1];
  const clientIp = forwardedIp || input.realIp?.trim();

  if (!clientIp || clientIp.length > 64 || isIP(clientIp) === 0) {
    throw new Error("Trusted proxy did not provide a valid client IP.");
  }

  return clientIp;
}
