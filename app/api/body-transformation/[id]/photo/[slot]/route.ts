import sharp from "sharp";
import { isSameOriginRequest } from "@/domain/security/same-origin";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ownsBody } from "@/infrastructure/sqlite/sqlite-body-transformation";
import { allowRateLimitedAction, RATE_LIMIT_POLICIES } from "@/lib/rate-limit";
type Context = { params: Promise<{ id: string; slot: string }> };
export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser(),
    { id, slot } = await params;
  const db = getDb();
  if (!user || !ownsBody(db, id, user.id))
    return new Response(null, { status: 404 });
  const photo = db
    .prepare(
      "SELECT image FROM body_transformation_photos WHERE participation_id=? AND slot=?",
    )
    .get(id, slot) as { image: Uint8Array } | undefined;
  if (!photo) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(photo.image), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function POST(request: Request, { params }: Context) {
  if (!isSameOriginRequest(request))
    return Response.json({ error: "Ungültige Anfrage." }, { status: 403 });
  const user = await getCurrentUser(),
    { id, slot } = await params,
    db = getDb();
  const participation = user && ownsBody(db, id, user.id);
  if (!participation || !["start", "end"].includes(slot))
    return Response.json({ error: "Nicht gefunden." }, { status: 404 });
  if (
    !allowRateLimitedAction([
      { policy: RATE_LIMIT_POLICIES.bodyPhoto, identifier: user!.id },
    ])
  )
    return Response.json(
      { error: "Bitte versuche es später erneut." },
      { status: 429 },
    );
  if (request.headers.get("x-remove-photo") === "yes") {
    db.prepare(
      "DELETE FROM body_transformation_photos WHERE participation_id=? AND slot=?",
    ).run(id, slot);
    return Response.json({ ok: true });
  }
  if (participation.status !== "active")
    return Response.json({ error: "Teilnahme beendet." }, { status: 409 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Bild fehlt." }, { status: 400 });
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 5 * 1024 * 1024) {
      await reader.cancel();
      return Response.json(
        { error: "Maximal 5 MB pro Bild." },
        { status: 413 },
      );
    }
    chunks.push(value);
  }
  try {
    const original = Buffer.concat(chunks);
    const meta = await sharp(original, {
      limitInputPixels: 25000000,
    }).metadata();
    if (
      !["jpeg", "png", "webp"].includes(meta.format ?? "") ||
      (meta.pages ?? 1) > 1
    )
      throw new Error("format");
    // Re-encode rather than serve arbitrary uploads; strip EXIF/location metadata.
    const image = await sharp(original, { limitInputPixels: 25000000 })
      .rotate()
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    db.prepare(
      `INSERT INTO body_transformation_photos VALUES (?,?,?,?) ON CONFLICT(participation_id,slot) DO UPDATE SET image=excluded.image,updated_at=excluded.updated_at`,
    ).run(id, slot, image, new Date().toISOString());
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        error:
          "Bitte lade ein gültiges JPG-, PNG- oder WebP-Bild mit höchstens 25 Megapixeln hoch.",
      },
      { status: 400 },
    );
  }
}
