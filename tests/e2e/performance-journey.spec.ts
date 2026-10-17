import { expect, test, type Page } from '@playwright/test';
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';

async function login(page: Page) {
  const db = new DatabaseSync(process.env.CHALLENGEHUB_DB_PATH!);
  const id = randomUUID(), token = randomBytes(32).toString('hex'), now = new Date().toISOString();
  db.prepare('INSERT INTO users (id,email,name,name_key,password_hash,created_at) VALUES (?,?,?,?,?,?)').run(id, `${id}@example.test`, 'Journey Tester', id, '!disabled', now);
  db.prepare('INSERT INTO sessions (id,user_id,token_hash,expires_at,created_at) VALUES (?,?,?,?,?)').run(randomUUID(), id, createHash('sha256').update(token).digest('hex'), new Date(Date.now()+3600000).toISOString(), now);
  db.close();
  await page.context().addCookies([{name:'challengehub_session',value:token,url:new URL(page.url()).origin,httpOnly:true,sameSite:'Lax'}]);
  await page.reload();
}

test('performance shares a real saved time, including after completion', async ({ page }) => {
  await page.goto('/challenges/100-liegestuetze-am-stueck');
  const hero = page.locator('[data-detail-section="hero"]');
  await expect(hero.getByRole('link', {name:/ChallengeMate finden/})).toHaveCount(0);
  await page.getByRole('button', {name:/Jemanden herausfordern/}).click();
  await expect(page.getByRole('dialog').getByLabel('Deine Herausforderung')).toHaveValue(/100 Liegestütze am Stück/);
  await page.keyboard.press('Escape');
  await login(page);
  await page.getByRole('button',{name:'Jetzt teilnehmen'}).click();
  await page.getByRole('link',{name:'Zum Dashboard'}).click();
  await page.getByLabel('Ziel vollständig geschafft').check();
  await page.getByLabel('Deine Zeit in Sekunden (optional)').fill('132');
  await page.getByRole('button',{name:'Erfolg speichern'}).click();
  await page.getByRole('button',{name:/Schlage meine Zeit/}).click();
  await expect(page.getByLabel('Deine Herausforderung')).toHaveValue(/2:12 min/);
  await page.keyboard.press('Escape');
  await page.goto('/challenges/100-liegestuetze-am-stueck');
  await page.getByRole('button',{name:/Schlage meine Zeit/}).click();
  await page.getByRole('button',{name:'Text und Link kopieren'}).click();
  await expect(page.getByRole('status')).toContainText('Herausforderung kopiert');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('2:12 min');
  expect((await new AxeBuilder({page}).include('[role="dialog"]').analyze()).violations).toEqual([]);
});

test('journeys retain Mate action and body transformation accepts Navy measurements', async ({page}) => {
  await page.goto('/challenges/100-tage-body-transformation');
  await expect(page.getByRole('heading',{level:1})).toHaveText('100 Tage Body Transformation Challenge');
  await expect(page.getByRole('link',{name:/ChallengeMate finden/})).toBeVisible();
  await login(page);
  await page.getByRole('button',{name:'Jetzt teilnehmen'}).click();
  await page.getByRole('link',{name:'Zum Dashboard'}).click();
  await expect(page.getByText(/Deine 100 Tage laufen bis/)).toBeVisible();
  await page.getByLabel('Körpergröße (cm)').fill('180');
  await page.getByLabel('Gewicht (kg)').fill('90');
  await page.getByLabel('Bauchumfang (cm)').fill('100');
  await page.getByLabel('Halsumfang (cm)').fill('40');
  await page.getByRole('button',{name:'Messwerte speichern'}).click();
  await expect(page.getByRole('status')).toHaveText('Gespeichert.');
  await expect(page.getByRole('table')).toContainText('90,0 kg');
  const id = page.url().split('/').at(-1)!;
  const db = new DatabaseSync(process.env.CHALLENGEHUB_DB_PATH!);
  db.prepare('UPDATE participations SET started_at=? WHERE id=?').run('2025-01-01T12:00:00Z',id);
  db.close();
  await page.reload();
  await expect(page.getByText(/Deine 100 Tage sind beendet/)).toBeVisible();
  await expect(page.getByRole('button',{name:'Challenge heute durchgeführt'})).toHaveCount(0);
  await page.goto('/meine-challenges');
  await expect(page.locator('article').filter({hasText:'100 Tage Body Transformation Challenge'})).toContainText('Beendet');
  expect((await page.goto('/challenges/journey-100-liegestuetze'))!.status()).toBe(404);
  expect((await page.goto('/challenges/10000-kalorien-challenge'))!.status()).toBe(404);
});

test('new pages and share dialog fit desktop and mobile', async ({page}) => {
  for (const width of [1440,390,320]) {
    await page.setViewportSize({width,height:900});
    for (const slug of ['100-tage-body-transformation','100-liegestuetze-am-stueck']) {
      await page.goto(`/challenges/${slug}`);
      await expect(page.locator('[data-detail-section="hero"] img')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({path:`output/playwright/journey-${slug}-${width}.png`});
    }
    await page.getByRole('button',{name:/Jemanden herausfordern/}).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path:`output/playwright/share-${width}.png`});
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button',{name:/Jemanden herausfordern/})).toBeFocused();
  }
});
