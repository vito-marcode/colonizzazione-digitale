// Upload di file da admin.html verso il bucket S3 Cubbit via URL presigned.
// La function reale (netlify/functions/get-upload-url.js, con le credenziali
// vere) non è testabile offline: qui è mockata (tests/fixtures/mock-supabase.js),
// stesso trattamento già riservato a ipapi.co/wsrv.nl. La funzione reale è
// verificabile a mano con scripts/cubbit-upload-probe.mjs dopo il deploy.
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');

const ADMIN_TOKEN = 'cesolouncapoclan'; // deve combaciare con config.js

test.beforeEach(async ({ context, page }) => {
  installSupabaseMock(context, { seedSlides: false });
  await page.goto(`/admin.html#${ADMIN_TOKEN}`);
  await expect(page.locator('#admin-panel')).toHaveClass(/visible/);
  await page.click('text=+ Nuova slide');
});

test('carica un\'immagine: il campo URL si popola con l\'URL pubblico restituito', async ({ page }) => {
  await page.setInputFiles('#fields-image input[type="file"]', {
    name: 'foto.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('contenuto finto di una immagine'),
  });

  await expect(page.locator('#upload-status-slide-image-url')).toHaveText('Caricato ✓');
  await expect(page.locator('#slide-image-url')).toHaveValue(/^https:\/\/fake-cubbit-public\.test\/slides\/.*foto\.jpg$/);

  // L'URL caricato finisce davvero nella slide salvata
  await page.fill('#slide-label', 'Con upload');
  await page.click('text=Salva slide');
  await expect(page.locator('.slide-row')).toHaveCount(1);
});

test('carica un video per il tipo "video": stesso meccanismo, campo dedicato', async ({ page }) => {
  await page.selectOption('#slide-type', 'video');
  await page.setInputFiles('#fields-video input[type="file"]', {
    name: 'clip.mp4',
    mimeType: 'video/mp4',
    buffer: Buffer.from('contenuto finto di un video'),
  });

  await expect(page.locator('#upload-status-slide-video-url')).toHaveText('Caricato ✓');
  await expect(page.locator('#slide-video-url')).toHaveValue(/^https:\/\/fake-cubbit-public\.test\/slides\/.*clip\.mp4$/);
});

test('rifiuta un file di tipo sbagliato prima ancora di contattare la function', async ({ page, context }) => {
  let uploadCalled = false;
  await context.route('**/.netlify/functions/get-upload-url', (route) => { uploadCalled = true; route.continue(); });

  await page.setInputFiles('#fields-image input[type="file"]', {
    name: 'documento.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('non è un\'immagine'),
  });

  await expect(page.locator('#upload-status-slide-image-url')).toHaveText('Il file scelto non è un\'immagine');
  expect(uploadCalled).toBe(false); // bloccato lato client, nessuna chiamata di rete sprecata
});

test('rifiuta un file troppo grande (oltre il limite immagini)', async ({ page }) => {
  const tooLarge = Buffer.alloc(11 * 1024 * 1024); // 11MB > limite 10MB per le immagini
  await page.setInputFiles('#fields-image input[type="file"]', {
    name: 'gigante.jpg',
    mimeType: 'image/jpeg',
    buffer: tooLarge,
  });

  await expect(page.locator('#upload-status-slide-image-url')).toHaveText('File troppo grande (max 10MB)');
  await expect(page.locator('#slide-image-url')).toHaveValue('');
});

test('upload "immagine con testo": il campo sfondo dedicato si popola correttamente', async ({ page }) => {
  await page.selectOption('#slide-type', 'image_text');
  await page.setInputFiles('#fields-image-text input[type="file"]', {
    name: 'sfondo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('sfondo finto'),
  });

  await expect(page.locator('#upload-status-slide-image-url-2')).toHaveText('Caricato ✓');
  await expect(page.locator('#slide-image-url-2')).toHaveValue(/^https:\/\/fake-cubbit-public\.test\//);
  // L'altro campo URL immagine (tipo "image" semplice) non viene toccato
  await expect(page.locator('#slide-image-url')).toHaveValue('');
});
