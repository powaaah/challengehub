import { GuestDuels, DuelError } from "./guest-duels.ts";
export async function guestDuelHttp(
  request: Request,
  service: GuestDuels,
  address = "local",
): Promise<Response> {
  const reply = (value: unknown, status = 200) =>
    Response.json(value, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  try {
    const url = new URL(request.url),
      origin = request.headers.get("origin");
    if (origin && origin !== url.origin)
      throw new DuelError(403, "Fremder Ursprung nicht erlaubt.");
    const path = url.pathname
      .replace(/^\/api\/v1\/guest-duels\/?/, "")
      .split("/")
      .filter(Boolean);
    if (!["GET", "POST"].includes(request.method))
      throw new DuelError(405, "Methode nicht erlaubt.");
    service.rate(`ip:${address}`, 180);
    let body: Record<string, unknown> = {};
    if (request.method === "POST") {
      if (!request.headers.get("content-type")?.startsWith("application/json"))
        throw new DuelError(415, "JSON erforderlich.");
      const reader = request.body?.getReader();
      let size = 0;
      const chunks: Uint8Array[] = [];
      if (reader)
        for (;;) {
          const part = await reader.read();
          if (part.done) break;
          size += part.value.length;
          if (size > 16384) {
            await reader.cancel();
            throw new DuelError(413, "Anfrage zu groß.");
          }
          chunks.push(part.value);
        }
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString());
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
          throw Error();
        body = parsed;
      } catch {
        throw new DuelError(400, "Ungültige Anfrage.");
      }
    }
    const post = request.method === "POST";
    if (post && path.join("/") === "sessions") {
      service.rate(`sessions:${address}`, 20);
      return reply(service.session(), 201);
    }
    const guest = service.authenticate(
      request.headers.get("authorization")?.replace(/^Bearer /, "") ?? null,
    );
    service.rate(`guest:${guest}`, 120);
    if (!path.length)
      return reply(
        post
          ? service.create(guest, {
              source: body.source,
              name: body.name,
              days: body.days,
              requestId: body.requestId,
            })
          : service.list(guest),
      );
    if (post && path.join("/") === "join")
      return reply(service.join(guest, body.token, body.name));
    if (!post && path.length === 1) return reply(service.view(guest, path[0]));
    if (post && path.length === 2) {
      const [id, action] = path;
      if (action === "invite") return reply(service.invite(guest, id));
      if (action === "start") return reply(service.start(guest, id));
      if (action === "entries")
        return reply(
          service.entry(guest, id, {
            requestId: body.requestId,
            value: body.value,
          }),
        );
      if (action === "finish") return reply(service.finish(guest, id));
    }
    throw new DuelError(404, "Nicht gefunden.");
  } catch (error) {
    return reply(
      {
        error:
          error instanceof DuelError
            ? error.message
            : "Duell konnte nicht verarbeitet werden.",
      },
      error instanceof DuelError ? error.status : 500,
    );
  }
}
