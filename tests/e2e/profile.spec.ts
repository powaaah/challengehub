import { expect, request as createRequest, test } from "@playwright/test";

test("Benutzer ändert seinen eindeutigen Benutzernamen im Profil", async ({ page }) => {
  const unique = Date.now().toString();
  const oldName = `profil-${unique}`;
  const newName = `geändert-${unique}`;

  await page.goto("/");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(oldName);
  await registration.getByLabel("E-Mail-Adresse").fill(`${oldName}@example.test`);
  await registration.getByLabel("Passwort").fill("ChallengeHub-Test-2026");
  await registration.getByRole("button", { name: "Account erstellen" }).click();

  const profileButton = page.getByRole("button", { name: "Profilmenü öffnen" });
  await expect(profileButton).toBeVisible();
  await profileButton.click();
  await page.getByRole("menuitem", { name: "Profil bearbeiten" }).click();

  await expect(page).toHaveURL("/profil");
  await expect(page.getByRole("heading", { name: "Dein Profil" })).toBeVisible();
  await page.getByRole("textbox", { name: "Benutzername" }).fill(newName);
  await page.getByRole("button", { name: "Benutzername speichern" }).click();

  await expect(page.getByText("Benutzername gespeichert.")).toBeVisible();
  await page.getByRole("button", { name: "Profilmenü öffnen" }).click();
  await expect(page.getByRole("menu").getByText(newName, { exact: true })).toBeVisible();
});

test("anonyme Besucher erhalten keinen Zugriff auf die Profilseite", async ({ page }) => {
  await page.goto("/profil");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Dein Profil" })).toHaveCount(0);
});

test("anonymer Direktaufruf der Profil-Action verändert keinen Benutzernamen", async ({ page }) => {
  const unique = Date.now().toString();
  const name = `action-${unique}`;
  const capturedName = `captured-${unique}`;
  const tamperedName = `tampered-${unique}`;
  await register(page, name, `${name}@example.test`);
  await page.goto("/profil");

  const nameInput = page.getByRole("textbox", { name: "Benutzername" });
  const submit = page.getByRole("button", { name: "Benutzername speichern" });
  await nameInput.fill(capturedName);
  const requestPromise = page.waitForRequest((request) =>
    request.method() === "POST" && new URL(request.url()).pathname === "/profil"
  );
  const responsePromise = page.waitForResponse((response) =>
    response.request().method() === "POST" && new URL(response.url()).pathname === "/profil"
  );
  await submit.click();
  const actionRequest = await requestPromise;
  await responsePromise;
  const actionBody = actionRequest.postDataBuffer();
  expect(actionBody).not.toBeNull();
  await expect(nameInput).toHaveValue(capturedName);
  const tamperedBody = Buffer.from(actionBody!.toString("utf8").replace(capturedName, tamperedName));
  expect(tamperedBody.equals(actionBody!)).toBe(false);

  const anonymous = await createRequest.newContext({ baseURL: new URL(page.url()).origin });
  const requestHeaders = actionRequest.headers();
  const response = await anonymous.fetch("/profil", {
    method: "POST",
    data: tamperedBody,
    headers: Object.fromEntries(
      ["accept", "content-type", "next-action", "next-router-state-tree", "origin"]
        .flatMap((name) => requestHeaders[name] ? [[name, requestHeaders[name]]] : [])
    ),
    maxRedirects: 0
  });
  expect(response.status()).toBeLessThan(500);
  expect(response.headers()["x-action-redirect"] ?? response.headers().location)
    .toBe("/auth?next=/profil;push");
  await anonymous.dispose();

  await page.reload();
  await expect(nameInput).toHaveValue(capturedName);
});

test("Profilseite lehnt einen bereits vergebenen Unicode-Benutzernamen ab", async ({ page }) => {
  const unique = Date.now().toString();
  const reservedName = `Änne-${unique}`;

  await register(page, reservedName, `reserved-${unique}@example.test`);
  await page.getByRole("button", { name: "Profilmenü öffnen" }).click();
  await page.getByRole("menuitem", { name: "Logout" }).click();
  await register(page, `zweiter-${unique}`, `second-${unique}@example.test`);

  await page.getByRole("button", { name: "Profilmenü öffnen" }).click();
  await page.getByRole("menuitem", { name: "Profil bearbeiten" }).click();
  await page.getByRole("textbox", { name: "Benutzername" }).fill(reservedName.toLocaleLowerCase("de-DE"));
  await page.getByRole("button", { name: "Benutzername speichern" }).click();

  await expect(page.getByText("Dieser Benutzername ist bereits vergeben.", { exact: true })).toBeVisible();
});

async function register(page: import("@playwright/test").Page, name: string, email: string) {
  await page.goto("/");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();
  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(name);
  await registration.getByLabel("E-Mail-Adresse").fill(email);
  await registration.getByLabel("Passwort").fill("ChallengeHub-Test-2026");
  await registration.getByRole("button", { name: "Account erstellen" }).click();
  await expect(page.getByRole("button", { name: "Profilmenü öffnen" })).toBeVisible();
}
