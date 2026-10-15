// I due nuovi tipi di slide oltre alla semplice immagine: 'image_text'
// (immagine di sfondo + testo sovrapposto) e 'video' (autoplay silenzioso
// inline, come richiesto per un'esperienza stile reel su mobile).
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');

test('slide "image_text": sfondo + testo sovrapposto renderizzati correttamente', async ({ context, page }) => {
  const store = installSupabaseMock(context, { seedSlides: false });
  store.slides.push({
    id: 301, position: 0, type: 'image_text', label: 'Citazione',
    image_url: 'images/slide-01.jpg',
    eyebrow: 'EDWARD SNOWDEN', title: 'La privacy non è un\'opzione',
    body: 'I dati sono il nuovo petrolio.', footer: 'fonte: discorso 2015',
    accent: '#38bdf8',
  });

  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  const slide = page.locator('.slide').first();
  await expect(slide).toHaveClass(/slide-text-bg/);
  // L'url passa dal proxy wsrv.nl per il resize/compressione: contiene
  // ancora l'url originale (url-encoded) come parametro.
  await expect(slide.locator('img.slide-bg-image')).toHaveAttribute('src', /wsrv\.nl.*slide-01\.jpg/);
  await expect(slide.locator('.slide-eyebrow')).toHaveText('EDWARD SNOWDEN');
  await expect(slide.locator('.slide-title')).toHaveText('La privacy non è un\'opzione');
  await expect(slide.locator('.slide-body')).toHaveText('I dati sono il nuovo petrolio.');
  await expect(slide.locator('.slide-footer')).toHaveText('fonte: discorso 2015');
});

test('slide "video": tag <video> con autoplay silenzioso inline', async ({ context, page }) => {
  const store = installSupabaseMock(context, { seedSlides: false });
  store.slides.push({
    id: 302, position: 0, type: 'video', label: 'Video intro',
    video_url: 'https://example.com/video.mp4',
  });

  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);

  const video = page.locator('.slide').first().locator('video');
  await expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
  await expect(video).toHaveAttribute('playsinline', '');
  await expect(video).toHaveAttribute('muted', '');
  const isLoopAutoplay = await video.evaluate((v) => v.autoplay && v.loop && v.muted);
  expect(isLoopAutoplay).toBe(true);
});
