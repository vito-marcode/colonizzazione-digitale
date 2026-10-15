-- ════════════════════════════════════════════════════════════
-- COLONIZZAZIONE DIGITALE — Aggiornamento schema #3
-- Esegui questo nel SQL Editor del progetto Supabase esistente
-- (dopo supabase-schema.sql, supabase-schema-updates.sql, supabase-schema-updates-2.sql)
--
-- Introduce:
--  1. la tabella `slides` — le slide del reel (prima hardcoded in config.js)
--     diventano righe modificabili da admin.html, con 3 tipi: image,
--     image_text (immagine + testo sovrapposto), video. Tutti e tre usano
--     SOLO url esterni (nessun upload / Supabase Storage).
--  2. la tabella `site_config` — riga singola con i microtesti personalizzabili
--     dello schermo QR (index.html).
--  3. la colonna slide_id (BIGINT, FK) su image_views e hearts: riferimento
--     STABILE alla slide, che sopravvive a riordini/cancellazioni future —
--     a differenza di image_index/image_label, che restano POSIZIONALI
--     (la posizione nell'array di allora) e NON vengono toccati, per non
--     corrompere il significato dei dati già raccolti. analytics.html userà
--     slide_id quando presente, altrimenti ricadrà sul confronto per
--     posizione (solo per le righe storiche pre-migrazione).
--     scroll_events NON viene toccata: le sue statistiche in analytics.html
--     sono sempre globali, mai per-slide.
-- ════════════════════════════════════════════════════════════

-- ── 1. Tabella slides ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS slides (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  position    INT NOT NULL,                  -- ordine di visualizzazione, 0-based.
                                              -- NESSUN vincolo UNIQUE: il riordino in
                                              -- admin.html scambia due valori con due
                                              -- UPDATE separati (non in una transazione);
                                              -- un vincolo UNIQUE romperebbe lo swap.
  type        TEXT NOT NULL CHECK (type IN ('image','image_text','video')),
  label       TEXT,                          -- etichetta breve per analytics.html (come oggi)

  image_url   TEXT,                          -- image / image_text: url esterno (no upload)
  video_url   TEXT,                          -- video: url esterno, es. .mp4 pubblico (no upload)

  -- image_text: testo sovrapposto allo sfondo immagine (riusa il ramo
  -- "slide-text" già presente in reel.html)
  eyebrow     TEXT,
  title       TEXT,
  body        TEXT,
  footer      TEXT,
  accent      TEXT                           -- colore testo, es. '#ffffff'
);

CREATE INDEX IF NOT EXISTS slides_position_idx ON slides (position);

-- Migrazione delle 8 slide attuali di config.js, per non perdere nulla nel
-- passaggio a DB. Guardia WHERE NOT EXISTS: rende il file ri-eseguibile in
-- sicurezza come gli altri file di update, invece di duplicare le righe se
-- lo rilanci per sbaglio.
INSERT INTO slides (position, type, label, image_url)
SELECT * FROM (VALUES
  (0, 'image', 'Snowden',        'images/slide-01.jpg'),
  (1, 'image', 'prodotto',       'images/slide-02.jpg'),
  (2, 'image', 'petrolio',       'images/slide-03.jpg'),
  (3, 'image', 'zuboff',         'images/slide-04.jpg'),
  (4, 'image', 'internet',       'images/slide-05.jpg'),
  (5, 'image', 'tecnologia',     'images/slide-06.jpg'),
  (6, 'image', 'papa-francesco', 'images/slide-07.jpg'),
  (7, 'image', 'privacy',        'images/slide-08.jpg')
) AS v(position, type, label, image_url)
WHERE NOT EXISTS (SELECT 1 FROM slides);

-- ── 2. Tabella site_config (riga singola: testi schermo QR) ─
CREATE TABLE IF NOT EXISTS site_config (
  id           SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- singleton forzato
  qr_eyebrow   TEXT,
  qr_subtitle  TEXT,
  page_title   TEXT,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_config (id, qr_eyebrow, qr_subtitle, page_title) VALUES (
  1,
  'Scansiona con il telefono per partecipare',
  'Il tuo telefono diventerà parte dell''esperimento.',
  'Colonizzazione Digitale — Schermo Principale'
) ON CONFLICT (id) DO NOTHING;

-- ── 3. Riferimento stabile alla slide nei dati di tracking ──
ALTER TABLE image_views ADD COLUMN IF NOT EXISTS slide_id BIGINT REFERENCES slides(id) ON DELETE SET NULL;
ALTER TABLE hearts      ADD COLUMN IF NOT EXISTS slide_id BIGINT REFERENCES slides(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS image_views_slide_id_idx ON image_views (slide_id);
CREATE INDEX IF NOT EXISTS hearts_slide_id_idx       ON hearts (slide_id);

-- ── RLS ───────────────────────────────────────────────────────
-- Stessa impostazione delle altre tabelle: nessuna autenticazione reale, solo
-- un secondo token (CFG.adminToken) verificato lato client in admin.html
-- prima di mostrare l'interfaccia — esattamente come CFG.analyticsToken oggi
-- per analytics.html. La "sicurezza" è quindi solo offuscamento client-side:
-- le policy restano aperte ad anon anche in scrittura, scelta già accettata
-- per analyticsToken e qui estesa per coerenza (decisione dell'utente).
ALTER TABLE slides       ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_open" ON slides FOR SELECT TO anon USING (true);
CREATE POLICY "insert_open" ON slides FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_open" ON slides FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_open" ON slides FOR DELETE TO anon USING (true);

CREATE POLICY "select_open" ON site_config FOR SELECT TO anon USING (true);
CREATE POLICY "insert_open" ON site_config FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_open" ON site_config FOR UPDATE TO anon USING (true) WITH CHECK (true);
