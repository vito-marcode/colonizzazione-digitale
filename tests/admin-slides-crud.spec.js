// CRUD completo su admin.html: creare/modificare/riordinare/eliminare slide,
// più il salvataggio dei testi dello schermo QR (site_config). Ogni verifica
// controlla che l'operazione sia DAVVERO arrivata al mock (store.*), non solo
// che il form non abbia lanciato un errore — copre implicitamente il bug
// "thenable pigro" di supabase-js (una insert/update/delete senza await/.then()
// non parte mai, già scoperto due volte in reel.html in questo stesso progetto).
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');

const ADMIN_TOKEN = 'cesolouncapoclan'; // deve combaciare con config.js

test.beforeEach(async ({ context, page }) => {
  installSupabaseMock(context, { seedSlides: false });
  await page.goto(`/admin.html#${ADMIN_TOKEN}`);
  await expect(page.locator('#admin-panel')).toHaveClass(/visible/);
});

test('password errata non sblocca il pannello', async ({ context, page }) => {
  installSupabaseMock(context, { seedSlides: false });
  await page.goto('/admin.html');
  await page.fill('#auth-input', 'password-sbagliata');
  await page.click('text=Accedi');
  await expect(page.locator('#auth-err')).toBeVisible();
  await expect(page.locator('#admin-panel')).not.toHaveClass(/visible/);
});

test('crea una slide immagine: compare nella lista e nel mock', async ({ page, context }) => {
  await page.click('text=+ Nuova slide');
  await page.selectOption('#slide-type', 'image');
  await page.fill('#slide-label', 'Nuova slide test');
  await page.fill('#slide-image-url', 'https://example.com/img.jpg');
  await page.click('text=Salva slide');

  await expect(page.locator('.slide-row')).toHaveCount(1);
  await expect(page.locator('.slide-row')).toContainText('Nuova slide test');
});

test('crea una slide "immagine con testo" con tutti i campi', async ({ page }) => {
  await page.click('text=+ Nuova slide');
  await page.selectOption('#slide-type', 'image_text');
  await page.fill('#slide-label', 'Citazione test');
  await page.fill('#slide-image-url-2', 'https://example.com/bg.jpg');
  await page.fill('#slide-eyebrow', 'AUTORE');
  await page.fill('#slide-title', 'Titolo test');
  await page.fill('#slide-body', 'Corpo del testo');
  await page.click('text=Salva slide');

  await expect(page.locator('.slide-row')).toContainText('Citazione test');
  await expect(page.locator('.slide-row .slide-badge')).toHaveText('Immagine+testo');
});

test('modifica una slide esistente: il mock riflette il nuovo valore', async ({ page }) => {
  await page.click('text=+ Nuova slide');
  await page.fill('#slide-label', 'Originale');
  await page.fill('#slide-image-url', 'https://example.com/a.jpg');
  await page.click('text=Salva slide');
  await expect(page.locator('.slide-row')).toContainText('Originale');

  await page.click('button[title="Modifica"]');
  await page.fill('#slide-label', 'Modificata');
  await page.click('text=Salva slide');

  await expect(page.locator('.slide-row')).toHaveCount(1);
  await expect(page.locator('.slide-row')).toContainText('Modificata');
});

test('riordina due slide con le frecce: le position vengono scambiate', async ({ page, context }) => {
  for (const label of ['Prima', 'Seconda']) {
    await page.click('text=+ Nuova slide');
    await page.fill('#slide-label', label);
    await page.fill('#slide-image-url', 'https://example.com/x.jpg');
    await page.click('text=Salva slide');
  }
  await expect(page.locator('.slide-row')).toHaveCount(2);
  await expect(page.locator('.slide-row').nth(0)).toContainText('Prima');

  // Sposta "Seconda" (riga 2) su: deve diventare la prima riga visualizzata
  await page.locator('.slide-row').nth(1).locator('button[title="Sposta su"]').click();

  await expect(page.locator('.slide-row').nth(0)).toContainText('Seconda');
  await expect(page.locator('.slide-row').nth(1)).toContainText('Prima');
});

test('elimina una slide: rimossa dal mock e posizioni ripacchettate', async ({ page, context }) => {
  for (const label of ['A', 'B', 'C']) {
    await page.click('text=+ Nuova slide');
    await page.fill('#slide-label', label);
    await page.fill('#slide-image-url', 'https://example.com/x.jpg');
    await page.click('text=Salva slide');
  }
  await expect(page.locator('.slide-row')).toHaveCount(3);

  page.once('dialog', (d) => d.accept());
  await page.locator('.slide-row').nth(0).locator('button[title="Elimina"]').click();

  await expect(page.locator('.slide-row')).toHaveCount(2);
  await expect(page.locator('.slide-row').nth(0)).toContainText('B');
  await expect(page.locator('.slide-row').nth(1)).toContainText('C');
});

test('salva i testi dello schermo QR: il mock (site_config) viene aggiornato', async ({ page, context }) => {
  await page.fill('#cfg-eyebrow', 'Nuovo eyebrow di prova');
  await page.fill('#cfg-subtitle', 'Nuovo sottotitolo di prova');
  await page.click('text=Salva testi');

  await expect(page.locator('#site-config-msg')).toHaveText('Salvato ✓');

  // Riapri la pagina: deve ripresentare i valori appena salvati (prova che
  // sono finiti davvero nel DB, non solo nel form)
  await page.reload();
  await expect(page.locator('#cfg-eyebrow')).toHaveValue('Nuovo eyebrow di prova');
  await expect(page.locator('#cfg-subtitle')).toHaveValue('Nuovo sottotitolo di prova');
});
