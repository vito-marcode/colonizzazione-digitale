// analytics.html deve mostrare tante card quante sono le slide ATTUALI nel
// DB (non più fisse a 8 come quando venivano da config.js), attribuire
// correttamente sia le righe nuove (via slide_id, stabile) sia quelle
// storiche pre-migrazione (via fallback image_index===position), e ignorare
// senza errori le righe "orfane" (slide_id che punta a una slide cancellata).
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');

const ANALYTICS_TOKEN = 'colonizzazione2026';

test('dashboard con N slide dinamiche: card corrette, match per slide_id e per fallback posizionale, righe orfane ignorate', async ({ context, page }) => {
  const store = installSupabaseMock(context, { seedSlides: false });

  store.slides.push(
    { id: 11, position: 0, type: 'image', label: 'Alpha', image_url: 'a.jpg' },
    { id: 12, position: 1, type: 'image', label: 'Beta',  image_url: 'b.jpg' },
    { id: 13, position: 2, type: 'image', label: 'Gamma', image_url: 'c.jpg' },
  );

  store.sessions.push({ id: 's1', created_at: new Date().toISOString(), browser: 'Chrome', os: 'Android', is_mobile: true, total_ms: 0 });

  store.image_views.push(
    // Riga nuova: attribuita via slide_id (stabile), non via image_index
    { session_id: 's1', slide_id: 11, image_index: 99, dwell_ms: 4000, enter_hour: 10 },
    // Riga storica pre-migrazione: nessun slide_id, fallback su image_index===position
    { session_id: 's1', slide_id: null, image_index: 1, dwell_ms: 2000, enter_hour: 10 },
    // Riga orfana: slide_id punta a una slide ormai cancellata (non è tra le 3 sopra)
    { session_id: 's1', slide_id: 999, image_index: 0, dwell_ms: 9999, enter_hour: 10 },
  );
  store.hearts.push(
    { session_id: 's1', slide_id: 12, image_index: 99, hour_of_day: 10 },
    { session_id: 's1', slide_id: null, image_index: 2, hour_of_day: 10 },
  );

  await page.goto(`/analytics.html#${ANALYTICS_TOKEN}`);
  await expect(page.locator('.stat-card.blue .stat-value')).toHaveText('1');

  // Esattamente 3 card (una per slide reale), non più fisse a 8
  await expect(page.locator('.slide-card')).toHaveCount(3);

  // Alpha: dwell via slide_id=11 -> 4000ms = "4.0s"
  const alphaCard = page.locator('.slide-card', { hasText: 'Alpha' });
  await expect(alphaCard.locator('.slide-dwell')).toHaveText('4.0s');
  await expect(alphaCard.locator('.slide-hearts')).toHaveText('❤️ 0');

  // Beta: nessun dwell diretto via slide_id, ma la riga storica con
  // image_index=1===position(Beta) la attribuisce comunque -> 2000ms; 1 cuore via slide_id=12
  const betaCard = page.locator('.slide-card', { hasText: 'Beta' });
  await expect(betaCard.locator('.slide-dwell')).toHaveText('2.0s');
  await expect(betaCard.locator('.slide-hearts')).toHaveText('❤️ 1');

  // Gamma: solo il cuore storico (image_index=2===position Gamma)
  const gammaCard = page.locator('.slide-card', { hasText: 'Gamma' });
  await expect(gammaCard.locator('.slide-hearts')).toHaveText('❤️ 1');

  // La riga orfana (slide_id:999, dwell 9999ms) non deve comparire da
  // nessuna parte: la somma totale dei dwell visibili nelle card è
  // 4000+2000+0 = 6000ms, mai 9999 incluso.
  const totalShown = (await page.locator('.slide-dwell').allTextContents()).join(' ');
  expect(totalShown).not.toContain('9999');
});
