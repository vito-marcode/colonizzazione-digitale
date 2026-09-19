// Il filtro "Mostra dati da..." non cancella nulla dal DB: nasconde solo,
// lato dashboard, le righe con created_at precedente all'istante scelto.
// Persistito in localStorage (solo su questo browser).
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');

const ANALYTICS_TOKEN = 'colonizzazione2026';
const OLD_TIME = '2020-01-01T00:00:00.000Z';
const CUTOFF = '2025-06-01T00:00:00.000Z';
const NEW_TIME = '2026-09-19T12:00:00.000Z'; // dopo CUTOFF

function seed(store) {
  store.sessions.push(
    { id: 'old', created_at: OLD_TIME, browser: 'Chrome', os: 'Android', is_mobile: true, total_ms: 0 },
    { id: 'new', created_at: NEW_TIME, browser: 'Chrome', os: 'Android', is_mobile: true, total_ms: 0 },
  );
  store.hearts.push(
    { session_id: 'old', created_at: OLD_TIME, image_index: 0, image_label: 'Snowden', touch_x_pct: 0.5, hour_of_day: 10 },
    { session_id: 'new', created_at: NEW_TIME, image_index: 0, image_label: 'Snowden', touch_x_pct: 0.5, hour_of_day: 10 },
  );
}

test('senza filtro, la dashboard mostra tutti i dati (vecchi e nuovi)', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  seed(store);
  await page.goto(`/analytics.html#${ANALYTICS_TOKEN}`);

  await expect(page.locator('.stat-card.blue .stat-value')).toHaveText('2');
  await expect(page.locator('.stat-card.red .stat-value')).toContainText('2');
  await expect(page.locator('#filter-status')).toHaveText('Nessun filtro: stai vedendo tutti i dati raccolti');
});

test('impostando un filtro via input, solo i dati successivi al cutoff restano visibili', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  seed(store);
  await page.goto(`/analytics.html#${ANALYTICS_TOKEN}`);
  await expect(page.locator('.stat-card.blue .stat-value')).toHaveText('2');

  // Il datetime-local va impostato in orario LOCALE del browser: convertiamo CUTOFF (UTC).
  const localValue = await page.evaluate((iso) => {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, CUTOFF);

  await page.locator('#filter-start').fill(localValue);
  await page.locator('#filter-start').dispatchEvent('change');

  await expect(page.locator('.stat-card.blue .stat-value')).toHaveText('1');
  await expect(page.locator('.stat-card.red .stat-value')).toContainText('1');
  await expect(page.locator('#filter-status')).toContainText('Sessione di analisi attiva dal');

  // "Mostra tutti i dati" rimuove il filtro senza toccare il database
  await page.locator('.filter-btn', { hasText: 'Mostra tutti i dati' }).click();
  await expect(page.locator('.stat-card.blue .stat-value')).toHaveText('2');
  expect(store.sessions.length).toBe(2); // nessuna riga persa dal mock/DB
});

test('"Nuova sessione da adesso" nasconde tutti i dati precedenti al click', async ({ context, page }) => {
  const store = installSupabaseMock(context);
  seed(store); // entrambe le sessioni sono nel passato rispetto ad "adesso"
  await page.goto(`/analytics.html#${ANALYTICS_TOKEN}`);
  await expect(page.locator('.stat-card.blue .stat-value')).toHaveText('2');

  await page.locator('.filter-btn', { hasText: 'Nuova sessione da adesso' }).click();

  await expect(page.locator('.stat-card.blue .stat-value')).toHaveText('0');
  expect(store.sessions.length).toBe(2); // ancora tutte presenti nel DB, solo nascoste

  await page.reload();
  await expect(page.locator('.stat-card.blue .stat-value')).toHaveText('0'); // il filtro persiste al refresh
});
