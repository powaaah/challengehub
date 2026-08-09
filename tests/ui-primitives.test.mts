import assert from "node:assert/strict";
import test from "node:test";
import { getStatusPanelSemantics } from "../components/ui/status-panel-semantics.ts";

test("Status-Primitives liefern passende Live-Regionen und Standardlabels", () => {
  assert.deepEqual(getStatusPanelSemantics("empty"), {
    role: undefined,
    ariaLive: undefined,
    label: "Noch nichts vorhanden"
  });
  assert.deepEqual(getStatusPanelSemantics("error"), {
    role: "alert",
    ariaLive: "assertive",
    label: "Fehler"
  });
  assert.deepEqual(getStatusPanelSemantics("success"), {
    role: "status",
    ariaLive: "polite",
    label: "Erledigt"
  });
  assert.deepEqual(getStatusPanelSemantics("loading"), {
    role: "status",
    ariaLive: "polite",
    label: "Wird geladen"
  });
});
