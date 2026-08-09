import { headers } from "next/headers";
import { resolveRateLimitClientIp } from "@/domain/security/request-ip";

export async function getRateLimitClientIp() {
  const requestHeaders = await headers();
  return resolveRateLimitClientIp({
    nodeEnv: process.env.NODE_ENV,
    trustProxy: process.env.TRUST_PROXY,
    forwardedFor: requestHeaders.get("x-forwarded-for"),
    realIp: requestHeaders.get("x-real-ip")
  });
}
