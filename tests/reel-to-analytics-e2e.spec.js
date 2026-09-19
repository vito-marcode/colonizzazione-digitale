// Chiude il cerchio: due "visitatori" reali (pagine separate, stesso context/
// mock) interagiscono con reel.html via touch, poi analytics.html — nella
// STESSA sessione di rete mockata — mostra i totali corretti.
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');
const { swipe, xFrac } = require('./fixtures/touch-helpers');

const ANALYTICS_TOKEN = 'colonizzazione2026';

async function hidePage(page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

test('pipeline end-to-end: 2 sessioni reali via reel.html si riflettono in analytics.html', async ({ context }) => {
  const store = installSupabaseMock(context, { rlsMode: 'fixed' });

  // Visitatore 1: swipe rapido da sinistra + un cuore
  const page1 = await context.newPage();
  await page1.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);
  await swipe(page1, { x: xFrac(0.15), dyTotal: 220, steps: 5, stepDelayMs: 30 });
  await page1.locator('#heart-btn').tap();
  await hidePage(page1);

  // Visitatore 2: swipe da destra, nessun cuore
  const page2 = await context.newPage();
  await page2.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(2);
  await swipe(page2, { x: xFrac(0.85), dyTotal: 220, steps: 5, stepDelayMs: 30 });
  await hidePage(page2);

  await expect.poll(() => store.scroll_events.length).toBe(2);
  await expect.poll(() => store.hearts.length).toBe(1);
  await expect.poll(() => store.sessions.filter(s => s.total_ms > 0).length).toBe(2);

  const page3 = await context.newPage();
  await page3.goto(`/analytics.html#${ANALYTICS_TOKEN}`);
  await expect(page3.locator('.stat-card.blue .stat-value')).toHaveText('2');
  await expect(page3.locator('.stat-card.red .stat-value')).toContainText('1');
  await expect(page3.locator('.stat-card.yellow .stat-value')).toHaveText('2');
  // 2 image_views a testa: una dallo swipe (chiude la slide 0), una dal flush finale (chiude la slide 1)
  await expect(page3.locator('.stat-card.green .stat-value')).toHaveText('4');
});
