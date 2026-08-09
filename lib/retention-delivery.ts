import type { RetentionEmailJob } from "../domain/retention/retention-repository.ts";
import { sendRetentionEmail, type RetentionEmailMessage } from "./retention-email.ts";
import { getDueRetentionEmailJobs, markRetentionEmailDelivered } from "./retention.ts";
import { createRetentionUnsubscribeToken } from "./retention-unsubscribe.ts";
import { SITE_URL } from "./seo.ts";

type DeliveryResult =
  | { status: "delivered" }
  | { status: "not_configured" }
  | { status: "delivery_failed" };

export async function deliverRetentionEmailJobs(input: {
  jobs: RetentionEmailJob[];
  siteUrl: string;
  tokenSecret: string;
  send: (message: RetentionEmailMessage) => Promise<DeliveryResult>;
  markDelivered: (notificationId: string) => void;
}) {
  const result = { delivered: 0, deferred: 0, failed: 0 };
  for (const job of input.jobs) {
    const token = createRetentionUnsubscribeToken({
      userId: job.userId,
      participationId: job.participationId
    }, input.tokenSecret);
    const delivery = await input.send({
      email: job.email,
      subject: job.title,
      body: job.body,
      href: new URL(job.href, input.siteUrl).toString(),
      unsubscribeUrl: `${input.siteUrl}/notifications/abmelden?token=${encodeURIComponent(token)}`
    });
    if (delivery.status === "delivered") {
      input.markDelivered(job.id);
      result.delivered += 1;
    } else if (delivery.status === "not_configured") {
      result.deferred += 1;
    } else {
      result.failed += 1;
    }
  }
  return result;
}

export async function deliverDueRetentionEmails(limit = 50) {
  const tokenSecret = process.env.RETENTION_TOKEN_SECRET ?? process.env.RATE_LIMIT_SECRET;
  if (!tokenSecret) return { delivered: 0, deferred: 0, failed: 0, status: "not_configured" as const };
  const result = await deliverRetentionEmailJobs({
    jobs: getDueRetentionEmailJobs(limit),
    siteUrl: SITE_URL,
    tokenSecret,
    send: sendRetentionEmail,
    markDelivered: (notificationId) => markRetentionEmailDelivered(notificationId)
  });
  return { ...result, status: "processed" as const };
}
