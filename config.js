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
  supabaseUrl:  'https://khullbyufufxuozqbijt.supabase.co',
  supabaseKey:  'sb_publishable_H4HMprv63uZBCP1aQG3GqQ_Yvdd9I3L',

  // ── URL del sito deployato (per il QR code) ──────────
  // Esempio: 'https://colonizzazione-digitale.netlify.app'
  siteUrl: 'https://YOUR-SITE.netlify.app',

  // ── Analytics password (rivelata a sorpresa in classe) ─
  analyticsToken: 'colonizzazione2026',

  // ── Immagini del reel ────────────────────────────────
  // Aggiungi qui le tue immagini (metti i file in images/)
  // type: 'image' | 'text'
  slides: [
    { type: 'image', src: 'images/slide-01.png', label: 'Snowden' },
    { type: 'image', src: 'images/slide-02.png', label: 'prodotto' },
    { type: 'image', src: 'images/slide-03.png', label: 'petrolio' },
    { type: 'image', src: 'images/slide-04.png', label: 'zuboff' },
    { type: 'image', src: 'images/slide-05.png', label: 'internet' },
    { type: 'image', src: 'images/slide-06.png', label: 'tecnologia' },
    { type: 'image', src: 'images/slide-07.png', label: 'papa-francesco' },
    { type: 'image', src: 'images/slide-08.png', label: 'privacy' },
  ],
};
