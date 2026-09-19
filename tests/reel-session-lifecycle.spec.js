// Ciclo di vita della sessione: creazione, flush su visibilitychange/pagehide,
// e il bug RLS confermato con scripts/rls-probe.mjs (manca la policy UPDATE
// su "sessions" per anon: il PATCH risponde 200 ma non modifica nulla).
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');

async function hidePage(page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

async function showPage(page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

test('crea una sessione con i campi del dispositivo mobile emulato (Pixel 7 / Android / Chrome)', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');

  await expect.poll(() => store.sessions.length).toBe(1);
  const s = store.sessions[0];
  expect(s.os).toBe('Android');
  expect(s.browser).toBe('Chrome');
  expect(s.is_mobile).toBe(true);
  expect(s.screen_w).toBe(412);
  // Chromium riporta screen.height = altezza del viewport (839), non il valore
  // "screen" nominale (915) del device descriptor Pixel 7 di Playwright.
  expect(s.screen_h).toBe(839);
  expect(s.language).toBeTruthy();
});

test('visibilitychange (hidden) flush una view parziale; al ritorno visibile il timer riprende (revisit)', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  await page.waitForTimeout(300); // dwell sulla slide 0
  await hidePage(page);

  await expect.poll(() => store.image_views.length).toBe(1);
  expect(store.image_views[0].image_index).toBe(0);
  expect(store.image_views[0].dwell_ms).toBeGreaterThanOrEqual(250);
  expect(store.image_views[0].revisit_count).toBe(0);

  await showPage(page);
  await page.waitForTimeout(200);
  await hidePage(page);

  await expect.poll(() => store.image_views.length).toBe(2);
  expect(store.image_views[1].image_index).toBe(0);
  expect(store.image_views[1].revisit_count).toBe(1); // seconda chiusura della stessa slide dopo un resume
});

test('BUG NOTO: manca la policy RLS di UPDATE su sessions — total_ms resta 0 dopo il flush', async ({ context, page }) => {
  const store = installSupabaseMock(context, { rlsMode: 'broken' }); // replica lo stato reale confermato da scripts/rls-probe.mjs
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  await page.waitForTimeout(200);
  await hidePage(page); // flushOnHide tenta il PATCH su sessions

  await page.waitForTimeout(100);
  expect(store.sessions[0].total_ms).toBe(0); // il client ha provato, ma RLS nega la scrittura
  expect(store.sessions[0].ended_at).toBeUndefined();
});

test('con la policy UPDATE aggiunta (supabase-schema-updates.sql), total_ms viene aggiornato correttamente', async ({ context, page }) => {
  const store = installSupabaseMock(context, { rlsMode: 'fixed' });
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  await page.waitForTimeout(200);
  await hidePage(page);

  await expect.poll(() => store.sessions[0].total_ms).toBeGreaterThan(0);
  expect(store.sessions[0].ended_at).toBeTruthy();
});
