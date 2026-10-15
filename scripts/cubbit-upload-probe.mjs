// Probe una tantum (NON fa parte della suite di test): verifica end-to-end,
// contro l'ambiente REALE dopo il deploy, che l'upload su Cubbit funzioni:
// chiede un URL firmato alla Netlify Function, carica un file di prova
// minuscolo, poi rilegge l'URL pubblico per confermare che sia davvero
// accessibile. Non richiede le credenziali S3 (le ha solo la function
// server-side): usa solo l'interfaccia pubblica, la stessa di admin.html.
const SITE_URL = 'https://presentazio.devmarco.it';
const ADMIN_TOKEN = 'cesolouncapoclan'; // deve combaciare con config.js

async function main() {
  const filename = `probe-${Date.now()}.txt`;
  const content = `Probe di upload Cubbit — ${new Date().toISOString()}`;

  console.log('1. Richiedo un URL di upload firmato alla Netlify Function...');
  const res = await fetch(`${SITE_URL}/.netlify/functions/get-upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminToken: ADMIN_TOKEN, filename, contentType: 'text/plain' }),
  });
  console.log('   status:', res.status);
  if (!res.ok) {
    console.error('   ❌ fallito:', await res.text());
    process.exit(1);
  }
  const { uploadUrl, publicUrl } = await res.json();
  console.log('   uploadUrl ottenuto, publicUrl atteso:', publicUrl);

  console.log('2. Carico il file di prova direttamente su Cubbit...');
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/plain' },
    body: content,
  });
  console.log('   status:', putRes.status);
  if (!putRes.ok) {
    console.error('   ❌ upload fallito:', await putRes.text());
    process.exit(1);
  }

  console.log('3. Rileggo l\'URL pubblico per verificare che sia accessibile...');
  const getRes = await fetch(publicUrl);
  const body = await getRes.text();
  console.log('   status:', getRes.status);
  console.log('   contenuto:', body);

  console.log('\n=== ESITO ===');
  if (getRes.ok && body === content) {
    console.log('✅ Upload e lettura pubblica funzionano correttamente.');
  } else {
    console.log('❌ Qualcosa non torna: controlla ACL di lettura pubblica e CORS del bucket.');
  }

  console.log('\nQuesto file di prova resta sul bucket (lo script non ha le credenziali per cancellarlo).');
  console.log('Eliminalo a mano dalla console Cubbit quando vuoi, chiave oggetto:');
  console.log(' ', publicUrl.split('/').slice(3).join('/'));
}

main().catch((e) => { console.error(e); process.exit(1); });
