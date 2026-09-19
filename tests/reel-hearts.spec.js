// Bottone cuore: cooldown 2s per slide e la fix del bug touches/changedTouches
// (su touchend il dito appena alzato è in changedTouches, non in touches).
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');

test('due tap entro il cooldown (2s) sulla stessa slide contano come un solo cuore', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  const heart = page.locator('#heart-btn');
  await heart.tap();
  await page.waitForTimeout(300);
  await heart.tap();

  await page.waitForTimeout(150);
  expect(store.hearts.length).toBe(1);
});

test('dopo il cooldown (>2s) un secondo tap genera un secondo cuore', async ({ context, page }) => {
  test.setTimeout(15000);
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  const heart = page.locator('#heart-btn');
  await heart.tap();
  await page.waitForTimeout(2100);
  await heart.tap();

  await expect.poll(() => store.hearts.length).toBe(2);
});

test('fix changedTouches: touch_x_pct del cuore riflette la posizione reale del tap, non il vecchio fallback 0.5', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  await page.locator('#heart-btn').tap();

  await expect.poll(() => store.hearts.length).toBe(1);
  // il bottone e' fisso in basso a destra (right:1.5rem): un tap reale finisce
  // quindi a X alto (>0.65), mai esattamente 0.5 (il vecchio fallback rotto,
  // confermato su dati di produzione: 272/295 cuori reali con touch_x_pct===0.5)
  expect(store.hearts[0].touch_x_pct).not.toBe(0.5);
  expect(store.hearts[0].touch_x_pct).toBeGreaterThan(0.65);
});
