-- ════════════════════════════════════════════════════════════
-- COLONIZZAZIONE DIGITALE — Aggiornamento schema #2
-- Esegui questo nel SQL Editor del progetto Supabase esistente
-- (dopo supabase-schema.sql e supabase-schema-updates.sql)
-- ════════════════════════════════════════════════════════════

-- Nuovi campi raccolti in sessions:
--  - device_model: modello del dispositivo, quando rilevabile (Client Hints
--    su Android/Chrome, o come indizio il renderer GPU via WebGL; su iOS
--    Safari non è recuperabile, Apple lo anonimizza deliberatamente dal
--    2019 — nessun trucco lato client può aggirarlo).
--  - isp: operatore/rete dedotto dall'IP pubblico tramite un lookup di
--    terze parti (ipapi.co), non dal browser.
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS device_model TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS isp TEXT;
