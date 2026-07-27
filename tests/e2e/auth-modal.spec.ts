import { expect, test } from "@playwright/test";

test("Login akzeptiert E-Mail-Adresse oder Benutzernamen", async ({ page }) => {
  await page.goto("/challenges/10000-schritte-am-tag");
  await page.getByRole("button", { name: "Login" }).click();

  const dialog = page.getByRole("dialog", { name: "Bei ChallengeHub anmelden" });
  await expect(dialog.getByLabel("E-Mail-Adresse oder Benutzername")).toBeVisible();
});

test("neu registrierter Account kann sich mit dem Benutzernamen anmelden", async ({ page }) => {
  const unique = Date.now().toString();
  const username = `e2e-${unique}`;
  const email = `e2e-${unique}@example.com`;
  const password = "ChallengeHub-Test-2026";

  await page.goto("/challenges/10000-schritte-am-tag");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(username);
  await registration.getByLabel("E-Mail-Adresse").fill(email);
  await registration.getByLabel("Passwort").fill(password);
  await registration.getByRole("button", { name: "Account erstellen" }).click();

  const profileButton = page.getByRole("button", { name: "Profilmenü öffnen" });
  await expect(profileButton).toBeVisible();
  await profileButton.click();
  await expect(page.getByRole("menu").getByText(username, { exact: true })).toBeVisible();
  await page.getByRole("menuitem", { name: "Logout" }).click();

  await page.getByRole("button", { name: "Login", exact: true }).click();
  const login = page.getByRole("dialog", { name: "Bei ChallengeHub anmelden" });
  await login.getByLabel("E-Mail-Adresse oder Benutzername").fill(username.toUpperCase());
  await login.getByLabel("Passwort").fill(password);
  await login.getByRole("button", { name: "Anmelden" }).click();

  const loggedInProfileButton = page.getByRole("button", { name: "Profilmenü öffnen" });
  await expect(loggedInProfileButton).toBeVisible();
  await loggedInProfileButton.click();
  await expect(page.getByRole("menu").getByText(username, { exact: true })).toBeVisible();
});

test("Registrieren wechselt den Login-Dialog in das Registrierungsformular", async ({ page }) => {
  await page.goto("/challenges/10000-schritte-am-tag");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Benutzername")).toBeVisible();
  await expect(dialog.getByLabel("E-Mail-Adresse")).toBeVisible();
  await expect(dialog.getByLabel("Passwort")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Account erstellen" })).toBeVisible();
});

test("Jetzt teilnehmen oeffnet denselben Login- und Registrierungsdialog", async ({ page }) => {
  await page.goto("/challenges/10000-schritte-am-tag");
  await page.getByRole("button", { name: "Jetzt teilnehmen" }).click();

  const loginDialog = page.getByRole("dialog", { name: "Bei ChallengeHub anmelden" });
  await expect(loginDialog.getByText(/^login$/i)).toBeVisible();
  await loginDialog.getByRole("button", { name: "Registrieren" }).click();
  await expect(page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" })).toBeVisible();
});

test("Registrierung ueber Jetzt teilnehmen startet die Challenge und zeigt die Bestaetigung", async ({ page }) => {
  const unique = Date.now().toString();

  await page.goto("/challenges/10000-schritte-am-tag");
  await page.getByRole("button", { name: "Jetzt teilnehmen" }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill(`Teilnahme-${unique}`);
  await registration.getByLabel("E-Mail-Adresse").fill(`teilnahme-${unique}@example.test`);
  await registration.getByLabel("Passwort").fill("sicheres-test-passwort");
  await registration.getByRole("button", { name: "Account erstellen" }).click();

  await expect(page).toHaveURL(
    /\/challenges\/10000-schritte-am-tag\/teilnahme-bestaetigt\?teilnahme=[^&]+$/
  );
  await expect(page.getByRole("heading", { name: "Danke für deine Teilnahme." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Zum Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Zurück zur Challenge" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Challenge-Partner finden" })).toBeVisible();
});

test("Registrierung prüft die Benutzernamenlänge nach Unicode-Normalisierung", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();

  const registration = page.getByRole("dialog", { name: "Bei ChallengeHub registrieren" });
  await registration.getByLabel("Benutzername").fill("ﬃ".repeat(11));
  await registration.getByLabel("E-Mail-Adresse").fill(`nfkc-${Date.now()}@example.test`);
  await registration.getByLabel("Passwort").fill("ChallengeHub-Test-2026");
  await registration.getByRole("button", { name: "Account erstellen" }).click();

  await expect(registration.getByText(/Bitte gib einen gültigen Benutzernamen/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Profilmenü öffnen" })).toHaveCount(0);
});

test("die alte Auth-Seite wird nicht mehr dargestellt", async ({ page }) => {
  await page.goto("/auth");

  await expect(page).not.toHaveURL(/\/auth/);
  await expect(page.getByRole("heading", { name: "Dein Fortschritt gehoert dir." })).toHaveCount(0);
});

test("Passwort-Reset-Anfrage bleibt für unbekannte E-Mail-Adressen neutral", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "Passwort vergessen?" }).click();

  await expect(page).toHaveURL("/auth/passwort-vergessen");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.getByLabel("E-Mail-Adresse").fill(`unbekannt-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Reset-Link anfordern" }).click();

  await expect(page.getByText("Falls ein Konto zu dieser E-Mail-Adresse existiert")).toBeVisible();
});
