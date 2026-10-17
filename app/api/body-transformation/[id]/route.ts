import { randomUUID } from "node:crypto";
import { isSameOriginRequest } from "@/domain/security/same-origin";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bodyWindow } from "@/lib/body-transformation";
import {
  ownsBody,
  readBody,
  writeBody,
} from "@/infrastructure/sqlite/sqlite-body-transformation";
import { updateBody } from "@/domain/challenges/body-update";
import { allowRateLimitedAction, RATE_LIMIT_POLICIES } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request))
    return Response.json({ error: "Ungültige Anfrage." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user)
    return Response.json({ error: "Bitte melde dich an." }, { status: 401 });
  const { id } = await params;
  const db = getDb(),
    participation = ownsBody(db, id, user.id);
  if (!participation)
    return Response.json(
      { error: "Teilnahme nicht gefunden." },
      { status: 404 },
    );
  if (
    !allowRateLimitedAction([
      { policy: RATE_LIMIT_POLICIES.checkIn, identifier: user.id },
    ])
  )
    return Response.json(
      { error: "Bitte versuche es später erneut." },
      { status: 429 },
    );
  if (participation.status !== "active")
    return Response.json(
      { error: "Diese Teilnahme ist beendet." },
      { status: 409 },
    );
  // Bound the actual stream, not only the client-supplied Content-Length.
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json({ error: "Angaben fehlen." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 16384) {
      await reader.cancel();
      return Response.json({ error: "Anfrage zu groß." }, { status: 413 });
    }
    chunks.push(value);
  }
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw new Error("Ungültige Angaben.");
    db.exec("BEGIN IMMEDIATE");
    try {
      const updated = updateBody(
        readBody(db, id),
        input,
        bodyWindow(participation.startedAt),
        randomUUID(),
      );
      writeBody(db, id, updated);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Bitte prüfe deine Angaben.",
      },
      { status: 400 },
    );
  }
}
