// Helper per simulare gesti touch realistici su Chromium via CDP.
// Playwright non offre un'API nativa per uno "swipe con velocità calibrata":
// page.touchscreen/locator.tap() bastano per un tap, ma per un drag
// multi-step con dy/dt controllati serve Input.dispatchTouchEvent via CDP.

const VIEWPORT_WIDTH = 412; // devices['Pixel 7'].viewport.width

// Frazione orizzontale -> pixel, coerente con touch.clientX/window.innerWidth
// usato in reel.html per touch_side/touch_x_pct.
function xFrac(frac) {
  return Math.round(frac * VIEWPORT_WIDTH);
}

/**
 * Simula uno swipe verticale con velocità/durata controllate.
 * @param {import('@playwright/test').Page} page
 * @param {{x:number, dyTotal:number, steps?:number, stepDelayMs?:number, startY?:number}} opts
 *   dyTotal positivo = swipe verso l'alto (dito che sale) = touchStartY - clientY > 0 = 'next'.
 */
async function swipe(page, { x, dyTotal, steps = 5, stepDelayMs = 30, startY = 600 }) {
  const cdp = await page.context().newCDPSession(page);
  let y = startY;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  const stepDy = dyTotal / steps;
  for (let i = 0; i < steps; i++) {
    await page.waitForTimeout(stepDelayMs);
    y -= stepDy;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach().catch(() => {});
}

/** Tap semplice (nessun drag) in un punto preciso, via CDP — usato per i tap
 * di "attenzione" su una slide che non devono generare uno swipe. */
async function tapAt(page, { x, y = 600 }) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach().catch(() => {});
}

module.exports = { swipe, tapAt, xFrac, VIEWPORT_WIDTH };
