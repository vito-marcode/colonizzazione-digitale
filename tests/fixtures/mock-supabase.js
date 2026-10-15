// Mock in-process del contratto REST di PostgREST usato da supabase-js@2.
// Intercetta a livello di networking del browser (context.route), PRIMA che
// la richiesta esca: config.js resta invariato (punta ancora al progetto
// Supabase reale), ma nulla lo raggiunge davvero durante i test.
//
// rlsMode:
//  - 'broken' (default): replica lo stato REALE del progetto Supabase oggi,
//    confermato con scripts/rls-probe.mjs — nessuna policy RLS di UPDATE su
//    nessuna tabella per il ruolo anon. Un PATCH risponde 200 ma non
//    modifica nulla (comportamento Postgres RLS: nessuna policy = nessuna
//    riga visibile in scrittura, non un errore).
//  - 'fixed': simula lo schema con la policy aggiunta (supabase-schema-updates.sql
//    applicata), per testare la formula di analytics.html indipendentemente
//    dal bug lato server.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

let nextId = 1;

function parseEqFilter(url, column) {
  const raw = url.searchParams.get(column);
  if (!raw || !raw.startsWith('eq.')) return null;
  return raw.slice(3);
}

// Stesse 8 slide di oggi (stessi label/ordine di quelle che erano in
// config.js), seedate di default nel mock: così tutti gli spec esistenti
// (scritti prima che le slide diventassero dinamiche) continuano a passare
// senza modifiche — reel.html trova lo stesso reel di 8 slide di sempre.
const DEFAULT_SLIDES = [
  { id: 1, position: 0, type: 'image', label: 'Snowden',        image_url: 'images/slide-01.jpg' },
  { id: 2, position: 1, type: 'image', label: 'prodotto',       image_url: 'images/slide-02.jpg' },
  { id: 3, position: 2, type: 'image', label: 'petrolio',       image_url: 'images/slide-03.jpg' },
  { id: 4, position: 3, type: 'image', label: 'zuboff',         image_url: 'images/slide-04.jpg' },
  { id: 5, position: 4, type: 'image', label: 'internet',       image_url: 'images/slide-05.jpg' },
  { id: 6, position: 5, type: 'image', label: 'tecnologia',     image_url: 'images/slide-06.jpg' },
  { id: 7, position: 6, type: 'image', label: 'papa-francesco', image_url: 'images/slide-07.jpg' },
  { id: 8, position: 7, type: 'image', label: 'privacy',        image_url: 'images/slide-08.jpg' },
];

const DEFAULT_SITE_CONFIG = {
  id: 1,
  qr_eyebrow: 'Scansiona con il telefono per partecipare',
  qr_subtitle: "Il tuo telefono diventerà parte dell'esperimento.",
  page_title: 'Colonizzazione Digitale',
};

function installSupabaseMock(context, { rlsMode = 'broken', seedSlides = true } = {}) {
  const store = {
    sessions: [], image_views: [], hearts: [], scroll_events: [],
    slides: seedSlides ? DEFAULT_SLIDES.map(s => ({ ...s })) : [],
    site_config: [{ ...DEFAULT_SITE_CONFIG }],
  };

  // reel.html chiama anche ipapi.co (terze parti, non Supabase) per dedurre
  // l'operatore/rete dall'IP pubblico: mockato qui perché i test devono
  // restare offline e deterministici, non dipendere da un servizio esterno.
  context.route('https://ipapi.co/**', (route) => route.fulfill({
    status: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ org: 'AS0000 Test Network Provider' }),
  }));

  // reel.html/admin.html passano le immagini da wsrv.nl (proxy di resize/
  // compressione, terze parti): mockato con un pixel trasparente, stesso
  // motivo di ipapi.co — i test restano offline e deterministici.
  const TRANSPARENT_PNG_1PX = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64'
  );
  context.route('https://wsrv.nl/**', (route) => route.fulfill({
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'image/png' },
    body: TRANSPARENT_PNG_1PX,
  }));

  context.route('**/rest/v1/**', async (route) => {
    const req = route.request();
    const method = req.method();

    if (method === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: CORS_HEADERS, body: '' });
    }

    const url = new URL(req.url());
    const table = url.pathname.split('/').filter(Boolean).pop();
    if (!store[table]) {
      return route.fulfill({ status: 404, headers: CORS_HEADERS, body: '[]' });
    }

    if (method === 'POST') {
      const payload = req.postDataJSON();
      const headers = req.headers();
      // .upsert(payload, {onConflict:'col'}) di supabase-js diventa un POST
      // con header Prefer: resolution=merge-duplicates + query on_conflict.
      const isUpsert = (headers['prefer'] || '').includes('resolution=merge-duplicates');
      const onConflictCol = url.searchParams.get('on_conflict');
      const rows = [].concat(payload).map((r) => {
        if (isUpsert && onConflictCol) {
          const existing = store[table].find((row) => row[onConflictCol] === r[onConflictCol]);
          if (existing) { Object.assign(existing, r); return existing; }
        }
        const row = {
          id: r.id ?? nextId++,
          created_at: r.created_at ?? new Date().toISOString(),
          // sessions.total_ms ha DEFAULT 0 nello schema reale (supabase-schema.sql);
          // il client non lo invia mai nell'insert iniziale.
          ...(table === 'sessions' ? { total_ms: 0 } : {}),
          ...r,
        };
        store[table].push(row);
        return row;
      });
      return route.fulfill({ status: 201, headers: CORS_HEADERS, body: JSON.stringify(rows) });
    }

    if (method === 'GET') {
      let rows = store[table].slice();
      for (const [key, val] of url.searchParams.entries()) {
        if (key === 'order' || key === 'select' || key === 'limit' || key === 'on_conflict') continue;
        if (val.startsWith('eq.')) {
          const want = val.slice(3);
          // eslint-disable-next-line eqeqeq
          rows = rows.filter((r) => String(r[key]) == want);
        }
      }
      const order = url.searchParams.get('order');
      if (order) {
        const [col, dir] = order.split('.');
        rows.sort((a, b) => {
          const av = a[col], bv = b[col];
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          return dir === 'desc' ? -cmp : cmp;
        });
      }
      return route.fulfill({ status: 200, headers: CORS_HEADERS, body: JSON.stringify(rows) });
    }

    if (method === 'PATCH') {
      const idFilter = parseEqFilter(url, 'id');
      const patch = req.postDataJSON();
      let updated = [];
      // Le tabelle introdotte con le slide dinamiche (slides, site_config)
      // sono scritte solo da admin.html, gated lato client da adminToken —
      // non dal bug RLS pinnato su sessions: qui l'update va sempre a buon
      // fine, a prescindere da rlsMode.
      const bypassRlsSim = table === 'slides' || table === 'site_config';
      if ((rlsMode === 'fixed' || bypassRlsSim) && idFilter !== null) {
        store[table].forEach((row) => {
          // eslint-disable-next-line eqeqeq
          if (String(row.id) == idFilter) {
            Object.assign(row, patch);
            updated.push(row);
          }
        });
      }
      // rlsMode === 'broken' sulle altre tabelle: nessuna riga viene toccata,
      // ma la risposta è comunque 200 con corpo vuoto — esattamente come il
      // PATCH reale osservato contro Supabase (200, body: []).
      return route.fulfill({ status: 200, headers: CORS_HEADERS, body: JSON.stringify(updated) });
    }

    if (method === 'DELETE') {
      const idFilter = parseEqFilter(url, 'id');
      const removed = [];
      if (idFilter !== null) {
        store[table] = store[table].filter((row) => {
          // eslint-disable-next-line eqeqeq
          if (String(row.id) == idFilter) { removed.push(row); return false; }
          return true;
        });
      }
      return route.fulfill({ status: 200, headers: CORS_HEADERS, body: JSON.stringify(removed) });
    }

    return route.fulfill({ status: 405, headers: CORS_HEADERS, body: '[]' });
  });

  return store;
}

module.exports = { installSupabaseMock };
