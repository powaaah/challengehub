export type StatusTone = "empty" | "error" | "success" | "loading";

type StatusPanelSemantics = {
  role: "alert" | "status" | undefined;
  ariaLive: "assertive" | "polite" | undefined;
  label: string;
};

const statusPanelSemantics: Record<StatusTone, StatusPanelSemantics> = {
  empty: { role: undefined, ariaLive: undefined, label: "Noch nichts vorhanden" },
  error: { role: "alert", ariaLive: "assertive", label: "Fehler" },
  success: { role: "status", ariaLive: "polite", label: "Erledigt" },
  loading: { role: "status", ariaLive: "polite", label: "Wird geladen" }
};

export function getStatusPanelSemantics(tone: StatusTone): StatusPanelSemantics {
  return statusPanelSemantics[tone];
}
