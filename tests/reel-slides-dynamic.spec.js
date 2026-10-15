// Le slide del reel vivono nel DB (tabella `slides`), non più in config.js:
// questo verifica che reel.html le legga da lì, con un set di slide custom
// (non le 8 di default) diverso da quello che era hardcoded prima.
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');

test('reel.html renderizza esattamente le slide presenti nel DB, non un set fisso', async ({ context, page }) => {
  const store = installSupabaseMock(context, { seedSlides: false });
  store.slides.push(
    { id: 101, position: 0, type: 'image', label: 'Prima', image_url: 'images/slide-01.jpg' },
    { id: 102, position: 1, type: 'image', label: 'Seconda', image_url: 'images/slide-02.jpg' },
  );

  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  await expect(page.locator('.slide')).toHaveCount(2);
  await expect(page.locator('.dot')).toHaveCount(2);

  // Il tracking usa le label/gli id custom, non quelli di config.js
  await page.locator('#heart-btn').tap();
  await expect.poll(() => store.hearts.length).toBe(1);
  expect(store.hearts[0].image_label).toBe('Prima');
  expect(store.hearts[0].slide_id).toBe(101);
});

test('ordine delle slide segue "position", non l\'ordine di inserimento nel DB', async ({ context, page }) => {
  const store = installSupabaseMock(context, { seedSlides: false });
  // Inserite fuori ordine: la seconda (position 0) deve comunque apparire per prima.
  store.slides.push(
    { id: 202, position: 1, type: 'image', label: 'Seconda', image_url: 'images/slide-02.jpg' },
    { id: 201, position: 0, type: 'image', label: 'Prima', image_url: 'images/slide-01.jpg' },
  );

  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  const firstSlideImg = page.locator('.slide').first().locator('img');
  await expect(firstSlideImg).toHaveAttribute('alt', 'Prima');
});

test('nessuna slide configurata: messaggio invece di un reel rotto', async ({ context, page }) => {
  installSupabaseMock(context, { seedSlides: false });
  await page.goto('/reel.html');
  await expect(page.getByText('Nessuna slide configurata.')).toBeVisible();
});
