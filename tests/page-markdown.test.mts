import test from "node:test";
import assert from "node:assert/strict";
import { loadPageFiles, parsePageMarkdown } from "../lib/page-markdown.ts";

test("page markdown reads edited text, CRLF and comments without executing markup", () => {
  const page = parsePageMarkdown("# Startseite\r\n\r\n<!-- Hinweis -->\r\n## hero\r\n\r\nNeuer Text\r\nzweite Zeile <script>kein Code</script>\r\n");
  assert.equal(page.hero, "Neuer Text zweite Zeile <script>kein Code</script>");
});

test("page markdown rejects duplicate, empty and invalid sections", () => {
  for (const source of [
    "# Seite\n## hero\nText\n## hero\nAnderer Text",
    "# Seite\n## hero\n ",
    "# Seite\n## Hero Titel\nText",
    "# Seite\nOhne Abschnitt",
    "## hero\nOhne Titel",
  ]) assert.throws(() => parsePageMarkdown(source));
});

test("all seven public page sources are available", () => {
  const pages = loadPageFiles("content/pages");
  assert.deepEqual(Object.keys(pages), ["challenges", "datenschutz", "impressum", "karriere", "sicherheit", "startseite", "wissen"]);
  assert.ok(Object.values(pages).every((page) => Object.keys(page).length > 0));
});
