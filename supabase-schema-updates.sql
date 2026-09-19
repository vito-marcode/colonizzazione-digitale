-- ════════════════════════════════════════════════════════════
-- COLONIZZAZIONE DIGITALE — Aggiornamento schema
-- Esegui questo nel SQL Editor del progetto Supabase esistente
-- (in aggiunta a supabase-schema.sql, già eseguito in precedenza)
-- ════════════════════════════════════════════════════════════

-- reel.html chiama sb.from('sessions').update({ended_at, total_ms}).eq('id', ...)
-- con la anon key (flushOnHide, in visibilitychange/pagehide/beforeunload).
-- supabase-schema.sql definisce SOLO policy di INSERT e SELECT per anon:
-- senza una policy di UPDATE, Postgres RLS nega di default ogni riga in
-- scrittura. PostgREST risponde comunque 200 (nessun errore), ma con 0 righe
-- modificate — motivo per cui "Durata media sessione" in analytics.html è
-- sempre stata 0, indipendentemente da quanto affidabile sia il client.
-- Verificato con scripts/rls-probe.mjs il 2026-09-19: PATCH -> 200, body [],
-- riga non modificata.

CREATE POLICY "update_open" ON sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Pulizia della riga di probe usata per la verifica (facoltativo, sostituisci
-- l'id con quello stampato da scripts/rls-probe.mjs):
-- DELETE FROM sessions WHERE id = 'rls-probe-1789836250240';
