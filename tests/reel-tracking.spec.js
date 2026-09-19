// Tracking di dwell/touch_side e le 4 casistiche di swipe calibrate rispetto
// a SWIPE_THRESHOLD=60px / VEL_THRESHOLD=0.25px/ms (reel.html).
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');
const { swipe, tapAt, xFrac } = require('./fixtures/touch-helpers');

test('touch_side/touch_x_avg riflettono la posizione X reale dei tocchi sulla slide', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  await tapAt(page, { x: xFrac(0.10) }); // tocco fermo vicino al bordo sinistro, non genera swipe
  await page.waitForTimeout(50);
  await swipe(page, { x: xFrac(0.10), dyTotal: 220, steps: 5, stepDelayMs: 30 }); // chiude il segmento

  await expect.poll(() => store.image_views.length).toBe(1);
  const v = store.image_views[0];
  expect(v.touch_side).toBe('left');
  expect(v.touch_x_avg).toBeLessThan(0.35);
});

test('swipe veloce (sopra entrambe le soglie) genera uno scroll_event "next"', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  await swipe(page, { x: xFrac(0.5), dyTotal: 220, steps: 5, stepDelayMs: 30 }); // dt~150ms, vel~1.47px/ms

  await expect.poll(() => store.scroll_events.length).toBe(1);
  const e = store.scroll_events[0];
  expect(e.direction).toBe('next');
  expect(e.from_index).toBe(0);
  expect(e.to_index).toBe(1);
  expect(Math.abs(e.velocity)).toBeGreaterThan(0.25);
});

test('swipe debole (sotto entrambe le soglie) NON genera navigazione', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  await swipe(page, { x: xFrac(0.5), dyTotal: 20, steps: 4, stepDelayMs: 100 }); // dy=20px<60, dt~400ms, vel~0.05<0.25

  await page.waitForTimeout(150);
  expect(store.scroll_events.length).toBe(0);
});

test('swipe lento ma ampio supera comunque la soglia px, indipendentemente dalla velocità', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  await swipe(page, { x: xFrac(0.5), dyTotal: 100, steps: 5, stepDelayMs: 180 }); // dy=100>60, dt~900ms, vel~0.11<0.25

  await expect.poll(() => store.scroll_events.length).toBe(1);
  expect(Math.abs(store.scroll_events[0].velocity)).toBeLessThan(0.25);
});

test('due swipe consecutivi ravvicinati (~50ms) vengono ENTRAMBI registrati (regressione fix isAnimating)', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  await swipe(page, { x: xFrac(0.15), dyTotal: 220, steps: 3, stepDelayMs: 15 }); // sinistra, veloce
  await page.waitForTimeout(50); // molto meno dei 400ms del vecchio gate isAnimating
  await swipe(page, { x: xFrac(0.85), dyTotal: 220, steps: 3, stepDelayMs: 15 }); // destra, veloce

  await expect.poll(() => store.scroll_events.length).toBe(2);
  expect(store.scroll_events[0].touch_x_pct).toBeLessThan(0.35);
  expect(store.scroll_events[1].touch_x_pct).toBeGreaterThan(0.65);
  expect(store.scroll_events[1].from_index).toBe(1);
  expect(store.scroll_events[1].to_index).toBe(2);
});
