// Un test per ciascun dato mostrato in analytics.html, con un dataset
// sintetico pre-seedato nel mock (nessun gesto reale: qui si verifica SOLO
// che la dashboard calcoli e renderizzi correttamente dei dati noti). I
// gesti touch reali su reel.html sono testati in reel-*.spec.js.
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');
const { seedDashboardFixture, expected } = require('./fixtures/dashboard-fixture');

// Deve combaciare con CFG.analyticsToken in config.js
const ANALYTICS_TOKEN = 'colonizzazione2026';

let currentStore;
test.beforeEach(async ({ context, page }) => {
  currentStore = installSupabaseMock(context);
  seedDashboardFixture(currentStore);
  await page.goto(`/analytics.html#${ANALYTICS_TOKEN}`);
  // Attende che il caricamento iniziale sia completo prima di ogni assert.
  await expect(page.locator('.stat-card.blue .stat-value')).toHaveText(String(expected.totalSessions));
});

test('Spettatori unici + conteggio mobile', async ({ page }) => {
  await expect(page.locator('.stat-card.blue .stat-value')).toHaveText(String(expected.totalSessions));
  await expect(page.locator('.stat-card.blue .stat-sub')).toHaveText(`${expected.mobileCount} da mobile`);
});

test('Cuori totali + media per utente', async ({ page }) => {
  await expect(page.locator('.stat-card.red .stat-value')).toContainText(String(expected.totalHearts));
  await expect(page.locator('.stat-card.red .stat-sub')).toHaveText(`media ${expected.heartsPerUser} / utente`);
});

test('Visualizzazioni slide + tempo medio dwell', async ({ page }) => {
  await expect(page.locator('.stat-card.green .stat-value')).toHaveText(String(expected.totalViews));
  await expect(page.locator('.stat-card.green .stat-sub')).toHaveText(`media ${expected.avgDwellFmt} / slide`);
});

test('Gesti di scroll + scroll veloci', async ({ page }) => {
  await expect(page.locator('.stat-card.yellow .stat-value')).toHaveText(String(expected.totalScrolls));
  await expect(page.locator('.stat-card.yellow .stat-sub')).toHaveText(`${expected.fastScrolls} scroll veloci`);
});

test('Durata media sessione (solo total_ms>0)', async ({ page }) => {
  await expect(page.locator('.stat-card.purple .stat-value')).toHaveText(expected.avgSessionFmt);
});

test('Slide heatmap: tempo medio + cuori per slide (tutte le 8 slide)', async ({ page }) => {
  const labels = ['Snowden', 'prodotto', 'petrolio', 'zuboff', 'internet', 'tecnologia', 'papa-francesco', 'privacy'];
  for (let i = 0; i < labels.length; i++) {
    const card = page.locator('.slide-card', { hasText: labels[i] });
    const { avgDwellMs, hearts } = expected.perSlide[i];
    const fmt = avgDwellMs < 1000 ? `${avgDwellMs}ms` : `${(avgDwellMs / 1000).toFixed(1)}s`;
    await expect(card.locator('.slide-dwell')).toHaveText(fmt);
    await expect(card.locator('.slide-hearts')).toHaveText(`❤️ ${hearts}`);
  }
});

test('Rilevamento mano: contributo combinato image_views + scroll_events + hearts', async ({ page }) => {
  const pcts = page.locator('.hand-pct');
  await expect(pcts.nth(0)).toHaveText(`${expected.handsLeftPct}%`);
  await expect(pcts.nth(1)).toHaveText(`${expected.handsRightPct}%`);
  await expect(page.getByText(`centro: ${expected.handsCenterPct}%`)).toBeVisible();
});

test('Attività per ora del giorno: bucket noti', async ({ page }) => {
  for (const [hour, count] of Object.entries(expected.byHourPeaks)) {
    const tip = `${hour}:00 — ${count} interazioni`;
    await expect(page.locator(`.timeline-bar[data-tip="${tip}"]`)).toHaveCount(1);
  }
});

test('Comportamento di scroll: next/prev/veloci/velocità media/ritorni', async ({ page }) => {
  const card = page.locator('.chart-card', { hasText: 'Comportamento di scroll' });
  await expect(card.locator('.scroll-stat', { hasText: 'Scorrimenti in avanti' }).locator('.scroll-stat-val')).toHaveText(String(expected.nextScrolls));
  await expect(card.locator('.scroll-stat', { hasText: 'Scorrimenti indietro' }).locator('.scroll-stat-val')).toHaveText(String(expected.prevScrolls));
  await expect(card.locator('.scroll-stat', { hasText: 'Scroll veloci' }).locator('.scroll-stat-val')).toHaveText(String(expected.fastScrolls));
  await expect(card.locator('.scroll-stat', { hasText: 'Velocità media' }).locator('.scroll-stat-val')).toHaveText(`${expected.avgVelocity} px/ms`);
  await expect(card.locator('.scroll-stat', { hasText: 'Ritorni a slide precedenti' }).locator('.scroll-stat-val')).toHaveText(String(expected.revisits));
});

test('Bar chart: tempo medio per slide', async ({ page }) => {
  const card = page.locator('.chart-card', { hasText: 'Tempo medio per slide' });
  // slide7 (privacy) ha il dwell medio piu' alto (3000ms) del dataset: verifichiamo il valore esatto.
  const item = card.locator('.bar-item', { hasText: 'privacy' });
  await expect(item.locator('.bar-val')).toHaveText('3.0s');
});

test('Bar chart: cuori per slide', async ({ page }) => {
  const card = page.locator('.chart-card', { hasText: 'Cuori per slide' });
  const item = card.locator('.bar-item', { hasText: 'privacy' });
  await expect(item.locator('.bar-val')).toHaveText(`${expected.perSlide[7].hearts} ❤️`);
});

test('Dispositivi & Browser: conteggio e ordinamento per frequenza', async ({ page }) => {
  const card = page.locator('.chart-card', { hasText: 'Dispositivi & Browser' });
  const rows = card.locator('.scroll-stat');
  const total = expected.browserOrder.length + expected.osOrder.length;
  await expect(rows).toHaveCount(total);
  for (let i = 0; i < expected.browserOrder.length; i++) {
    const [name, count] = expected.browserOrder[i];
    await expect(rows.nth(i).locator('.scroll-stat-label')).toHaveText(name);
    await expect(rows.nth(i).locator('.scroll-stat-val')).toHaveText(String(count));
  }
  const offset = expected.browserOrder.length;
  for (let i = 0; i < expected.osOrder.length; i++) {
    const [name, count] = expected.osOrder[i];
    await expect(rows.nth(offset + i).locator('.scroll-stat-label')).toHaveText(`📌 ${name}`);
    await expect(rows.nth(offset + i).locator('.scroll-stat-val')).toHaveText(String(count));
  }
});

test('Tabella sessioni recenti: righe, views e hearts per sessione', async ({ page }) => {
  const rows = page.locator('.sessions-table tr');
  // +1 per la riga di intestazione
  await expect(rows).toHaveCount(expected.totalSessions + 1);

  // s1: Chrome/Android, durata 42.0s, 2 views, 2 cuori (unica riga con 42.0s)
  const s1Row = page.locator('.sessions-table tr', { hasText: '42.0s' });
  await expect(s1Row).toContainText('Chrome');
  await expect(s1Row).toContainText('Android');
  await expect(s1Row.locator('td').nth(8)).toHaveText(String(expected.perSession.s1.views));
  await expect(s1Row.locator('td').nth(9)).toHaveText(String(expected.perSession.s1.hearts));
  await expect(s1Row.locator('td').nth(10)).toHaveText('Pixel 8 Pro');
  await expect(s1Row.locator('td').nth(11)).toHaveText('Vodafone Italia');

  // s3: Firefox/macOS/desktop, durata 18.0s
  const s3Row = page.locator('.sessions-table tr', { hasText: '18.0s' });
  await expect(s3Row).toContainText('Firefox');
  await expect(s3Row).toContainText('macOS');
  await expect(s3Row).toContainText('Desktop');
  await expect(s3Row.locator('td').nth(8)).toHaveText(String(expected.perSession.s3.views));
  await expect(s3Row.locator('td').nth(9)).toHaveText(String(expected.perSession.s3.hearts));
  // s3 non ha device_model/isp impostati nella fixture: deve mostrare il fallback
  await expect(s3Row.locator('td').nth(10)).toHaveText('—');
  await expect(s3Row.locator('td').nth(11)).toHaveText('—');

  // s2 (Chrome/Android, 0s) e s4 (Chrome/iOS, 0s) condividono "0s": distinti per OS.
  const s2Row = page.locator('.sessions-table tr').filter({ hasText: '0s' }).filter({ hasText: 'Android' });
  await expect(s2Row.locator('td').nth(8)).toHaveText(String(expected.perSession.s2.views));
  await expect(s2Row.locator('td').nth(9)).toHaveText(String(expected.perSession.s2.hearts));

  const s4Row = page.locator('.sessions-table tr').filter({ hasText: '0s' }).filter({ hasText: 'iOS' }).filter({ hasText: 'Chrome' });
  await expect(s4Row.locator('td').nth(8)).toHaveText(String(expected.perSession.s4.views));
  await expect(s4Row.locator('td').nth(9)).toHaveText(String(expected.perSession.s4.hearts));
});
