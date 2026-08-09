import { getCurrentUser } from "@/lib/auth";
import { exportAccountData } from "@/lib/account-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const data = exportAccountData(user.id);
  if (!data) {
    return Response.json({ error: "Konto nicht gefunden." }, { status: 404 });
  }

  const date = data.exportedAt.slice(0, 10);
  return new Response(`${JSON.stringify(data, null, 2)}\n`, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="challengehub-datenexport-${date}.json"`,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
