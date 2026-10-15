/**
 * ╔══════════════════════════════════════════════════════╗
 * ║         COLONIZZAZIONE DIGITALE — CONFIG             ║
 * ║  Compila questi valori prima del deploy su Netlify   ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * 1. Crea un progetto su https://supabase.com
 * 2. Vai su Project Settings → API
 * 3. Copia "Project URL" e "anon public" key qui sotto
 * 4. Esegui, in ordine, supabase-schema.sql, supabase-schema-updates.sql,
 *    supabase-schema-updates-2.sql, supabase-schema-updates-3.sql nel SQL
 *    Editor di Supabase
 * 5. Deploy su Netlify (connetti questo repo GitHub)
 *
 * Le slide del reel non si configurano più qui: si gestiscono da admin.html
 * (vai su admin.html#<adminToken> dopo aver eseguito il passo 4).
 */

window.APP_CONFIG = {
  // ── Supabase ─────────────────────────────────────────
  supabaseUrl:  'https://khullbyufufxuozqbijt.supabase.co',
  supabaseKey:  'sb_publishable_H4HMprv63uZBCP1aQG3GqQ_Yvdd9I3L',

  // ── URL del sito deployato (per il QR code) ──────────
  // Esempio: 'https://colonizzazione-digitale.netlify.app'
  siteUrl: 'https://presentazio.devmarco.it',

  // ── Analytics password (rivelata a sorpresa in classe) ─
  analyticsToken: 'colonizzazione2026',

  // ── Admin password (gestione slide e testi QR) ───────
  // Cambiala prima di usare il progetto: chiunque la legga da qui può
  // modificare le slide mostrate a tutti (stessa protezione "offuscamento
  // lato client" di analyticsToken, nessuna autenticazione reale).
  adminToken: 'cesolouncapoclan',
};
