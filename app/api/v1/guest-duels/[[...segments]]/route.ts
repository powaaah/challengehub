import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { GuestDuels } from "../../../../../lib/guest-duels";
import { guestDuelHttp } from "../../../../../lib/guest-duel-http";
export const runtime = "nodejs";
let service: GuestDuels | undefined;
async function handle(request: Request) {
  if (process.env.CHALLENGEHUB_GUEST_DUELS_ENABLED !== "1")
    return Response.json({ error: "Nicht verfügbar." }, { status: 404 });
  if (!service) {
    const filename = resolve(
      process.env.CHALLENGEHUB_GUEST_DUELS_DB_PATH ||
        ".data/guest-duels.sqlite",
    );
    mkdirSync(dirname(filename), { recursive: true });
    service = new GuestDuels(new DatabaseSync(filename));
  }
  return guestDuelHttp(request, service, "next-global");
}
export { handle as GET, handle as POST };
