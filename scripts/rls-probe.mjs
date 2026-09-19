// Probe una tantum (NON fa parte della suite di test): verifica se la anon key
// di Supabase può davvero eseguire l'UPDATE che reel.html tenta su `sessions`
// in flushOnHide(), dato che supabase-schema.sql non definisce alcuna policy
// RLS di UPDATE per il ruolo anon. Inserisce, aggiorna e rilegge UNA riga di
// test chiaramente taggata; stampa l'SQL per pulirla a mano.
const SUPA_URL = 'https://khullbyufufxuozqbijt.supabase.co';
const SUPA_KEY = 'sb_publishable_H4HMprv63uZBCP1aQG3GqQ_Yvdd9I3L';
const PROBE_ID = `rls-probe-${Date.now()}`;

const headers = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
};

async function main() {
  console.log('Probe id:', PROBE_ID);

  const insertRes = await fetch(`${SUPA_URL}/rest/v1/sessions`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({
      id: PROBE_ID,
      browser: 'RLS-PROBE', os: 'RLS-PROBE', is_mobile: false,
      screen_w: 1, screen_h: 1, dpr: 1, language: 'xx', timezone: 'UTC',
      conn_type: 'probe', total_ms: 0,
    }),
  });
  console.log('INSERT status:', insertRes.status);
  if (!insertRes.ok) {
    console.error('INSERT fallito:', await insertRes.text());
    process.exit(1);
  }

  const patchRes = await fetch(`${SUPA_URL}/rest/v1/sessions?id=eq.${PROBE_ID}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ ended_at: new Date().toISOString(), total_ms: 999999 }),
  });
  const patchBody = await patchRes.text();
  console.log('PATCH status:', patchRes.status, '| body:', patchBody);

  const selectRes = await fetch(`${SUPA_URL}/rest/v1/sessions?id=eq.${PROBE_ID}&select=*`, {
    headers,
  });
  const rows = await selectRes.json();
  console.log('SELECT dopo il PATCH:', JSON.stringify(rows, null, 2));

  const row = rows[0];
  const updateApplied = row && row.total_ms === 999999;

  console.log('\n=== ESITO ===');
  if (updateApplied) {
    console.log('✅ L\'UPDATE con la anon key HA FUNZIONATO (total_ms = 999999). Nessuna policy mancante rilevata.');
  } else {
    console.log('❌ L\'UPDATE con la anon key NON ha modificato la riga (total_ms =', row?.total_ms, '). Confermato: manca la policy RLS di UPDATE su "sessions" per anon.');
  }

  console.log('\nPer pulire la riga di probe, esegui nell\'SQL editor di Supabase:');
  console.log(`DELETE FROM sessions WHERE id = '${PROBE_ID}';`);
}

main().catch(e => { console.error(e); process.exit(1); });
