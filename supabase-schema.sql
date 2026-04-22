-- ════════════════════════════════════════════════════════════
-- COLONIZZAZIONE DIGITALE — Supabase Schema
-- Esegui questo nel SQL Editor del tuo progetto Supabase
-- ════════════════════════════════════════════════════════════

-- Sessioni utente (una per dispositivo)
CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  browser      TEXT,
  os           TEXT,
  is_mobile    BOOLEAN DEFAULT TRUE,
  screen_w     INT,
  screen_h     INT,
  dpr          FLOAT,
  language     TEXT,
  timezone     TEXT,
  conn_type    TEXT,
  ended_at     TIMESTAMPTZ,
  total_ms     BIGINT DEFAULT 0
);

-- Visualizzazioni per slide (una riga per ogni slide visitata)
CREATE TABLE IF NOT EXISTS image_views (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  session_id        TEXT NOT NULL,
  image_index       INT  NOT NULL,
  image_label       TEXT,
  dwell_ms          INT  NOT NULL DEFAULT 0,   -- tempo trascorso sulla slide
  enter_hour        INT,                        -- ora del giorno (0-23)
  max_pause_ms      INT  DEFAULT 0,            -- pausa più lunga
  scroll_in_vel     FLOAT,                     -- velocità con cui è arrivato (px/ms)
  scroll_out_vel    FLOAT,                     -- velocità con cui è partito
  touch_side        TEXT,                      -- 'left' | 'right' | 'center'
  touch_x_avg       FLOAT,                     -- 0.0 → 1.0
  revisit_count     INT  DEFAULT 0             -- quante volte è tornato su questa slide
);

-- Cuori (like)
CREATE TABLE IF NOT EXISTS hearts (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  session_id    TEXT NOT NULL,
  image_index   INT  NOT NULL,
  image_label   TEXT,
  touch_x_pct   FLOAT,
  hour_of_day   INT
);

-- Scroll events (per analisi comportamentale)
CREATE TABLE IF NOT EXISTS scroll_events (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  session_id    TEXT NOT NULL,
  from_index    INT,
  to_index      INT,
  direction     TEXT,    -- 'next' | 'prev'
  velocity      FLOAT,   -- px/ms (positivo = verso il basso)
  duration_ms   INT,
  touch_x_pct   FLOAT   -- 0-1, per rilevamento mano
);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_views  ENABLE ROW LEVEL SECURITY;
ALTER TABLE hearts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE scroll_events ENABLE ROW LEVEL SECURITY;

-- Tutti possono inserire e leggere (dati anonimi)
CREATE POLICY "insert_open" ON sessions      FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "select_open" ON sessions      FOR SELECT TO anon USING (true);

CREATE POLICY "insert_open" ON image_views   FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "select_open" ON image_views   FOR SELECT TO anon USING (true);

CREATE POLICY "insert_open" ON hearts        FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "select_open" ON hearts        FOR SELECT TO anon USING (true);

CREATE POLICY "insert_open" ON scroll_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "select_open" ON scroll_events FOR SELECT TO anon USING (true);

-- ── Realtime: abilita sulle tabelle che serve ──────────────
-- (Supabase Dashboard → Database → Replication → hearts, sessions)
-- Oppure via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE hearts;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
