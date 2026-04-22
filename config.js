/**
 * ╔══════════════════════════════════════════════════════╗
 * ║         COLONIZZAZIONE DIGITALE — CONFIG             ║
 * ║  Compila questi valori prima del deploy su Netlify   ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * 1. Crea un progetto su https://supabase.com
 * 2. Vai su Project Settings → API
 * 3. Copia "Project URL" e "anon public" key qui sotto
 * 4. Esegui supabase-schema.sql nel SQL Editor di Supabase
 * 5. Deploy su Netlify (connetti questo repo GitHub)
 */

window.APP_CONFIG = {
  // ── Supabase ─────────────────────────────────────────
  supabaseUrl:  'https://YOUR-PROJECT-ID.supabase.co',
  supabaseKey:  'YOUR-ANON-PUBLIC-KEY',

  // ── URL del sito deployato (per il QR code) ──────────
  // Esempio: 'https://colonizzazione-digitale.netlify.app'
  siteUrl: 'https://YOUR-SITE.netlify.app',

  // ── Analytics password (rivelata a sorpresa in classe) ─
  analyticsToken: 'colonizzazione2026',

  // ── Immagini del reel ────────────────────────────────
  // Aggiungi qui le tue immagini (metti i file in images/)
  // type: 'image' | 'text'
  slides: [
    {
      type: 'image',
      src: 'images/slide-01.png',
      label: 'Snowden',
    },
    {
      type: 'text',
      label: 'prodotto',
      bg: 'linear-gradient(160deg,#0f0c29,#302b63,#24243e)',
      accent: '#38bdf8',
      eyebrow: 'L\'illusione del gratis',
      title: 'Se non paghi il prodotto…',
      body: 'il prodotto sei tu.',
      footer: '— Andrew Lewis, 2010',
    },
    {
      type: 'text',
      label: 'scroll',
      bg: 'linear-gradient(160deg,#0d0d0d,#1a1a2e,#16213e)',
      accent: '#f97316',
      eyebrow: 'Surplus comportamentale',
      title: 'Il tuo scroll\nracconta tutto.',
      body: 'Quanto ti sei fermato. Quanto veloce hai scorso. Da che lato tieni il telefono.',
      footer: '— Shoshana Zuboff, The Age of Surveillance Capitalism',
    },
    {
      type: 'text',
      label: 'mano',
      bg: 'linear-gradient(160deg,#0a0a0a,#1f1f1f,#0d1b2a)',
      accent: '#22c55e',
      eyebrow: 'Biometria comportamentale',
      title: 'Con quale mano\ntieni il telefono?',
      body: 'Lo sa già. Dall\'angolo in cui tocchi lo schermo.\nDalla direzione in cui scorri.',
      footer: '→ Lo vediamo anche noi, in diretta.',
    },
    {
      type: 'text',
      label: 'dato-eterno',
      bg: 'linear-gradient(160deg,#1a0000,#3d0000,#0d0000)',
      accent: '#ef4444',
      eyebrow: 'Olanda, 1940',
      title: 'Il dato\nnon ha scadenza.',
      body: 'I dati del censimento del 1939 divennero uno strumento di sterminio.\nChi userà i tuoi tra 20 anni?',
      footer: '— Max Moszkowicz, storico',
    },
    {
      type: 'text',
      label: 'dopamina',
      bg: 'linear-gradient(160deg,#0f0f23,#1e1b4b,#312e81)',
      accent: '#a78bfa',
      eyebrow: 'Neuroscienze',
      title: 'Ogni like\nè una dose.',
      body: 'L\'algoritmo ha studiato il tuo cervello più di qualsiasi psicologo.\nSa esattamente quando premere il tasto.',
      footer: '→ Quanti cuori hai premuto oggi?',
    },
  ],
};
