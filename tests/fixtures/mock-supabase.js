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

function installSupabaseMock(context, { rlsMode = 'broken' } = {}) {
  const store = { sessions: [], image_views: [], hearts: [], scroll_events: [] };

  // reel.html chiama anche ipapi.co (terze parti, non Supabase) per dedurre
  // l'operatore/rete dall'IP pubblico: mockato qui perché i test devono
  // restare offline e deterministici, non dipendere da un servizio esterno.
  context.route('https://ipapi.co/**', (route) => route.fulfill({
    status: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ org: 'AS0000 Test Network Provider' }),
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
      const rows = [].concat(payload).map((r) => ({
        id: r.id ?? nextId++,
        created_at: r.created_at ?? new Date().toISOString(),
        // sessions.total_ms ha DEFAULT 0 nello schema reale (supabase-schema.sql);
        // il client non lo invia mai nell'insert iniziale.
        ...(table === 'sessions' ? { total_ms: 0 } : {}),
        ...r,
      }));
      store[table].push(...rows);
      return route.fulfill({ status: 201, headers: CORS_HEADERS, body: JSON.stringify(rows) });
    }

    if (method === 'GET') {
      let rows = store[table].slice();
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
      if (rlsMode === 'fixed' && idFilter !== null) {
        store[table].forEach((row) => {
          // eslint-disable-next-line eqeqeq
          if (String(row.id) == idFilter) {
            Object.assign(row, patch);
            updated.push(row);
          }
        });
      }
      // rlsMode === 'broken': nessuna riga viene toccata, ma la risposta è
      // comunque 200 con corpo vuoto — esattamente come il PATCH reale
      // osservato contro Supabase (200, body: []).
      return route.fulfill({ status: 200, headers: CORS_HEADERS, body: JSON.stringify(updated) });
    }

    return route.fulfill({ status: 405, headers: CORS_HEADERS, body: '[]' });
  });

  return store;
}

module.exports = { installSupabaseMock };
