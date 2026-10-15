// Genera un URL di upload firmato (presigned PUT) verso il bucket S3 di
// Cubbit, così admin.html può caricare un file DIRETTAMENTE su Cubbit senza
// far passare i byte da questa funzione (niente limiti di payload) e senza
// che la secret key S3 tocchi mai il browser — l'unico posto dove può stare
// in sicurezza è qui, come variabile d'ambiente lato server.
//
// Variabili d'ambiente richieste (Netlify → Site settings → Environment
// variables, MAI nel repo):
//   CUBBIT_ACCESS_KEY_ID, CUBBIT_SECRET_ACCESS_KEY, CUBBIT_BUCKET,
//   CUBBIT_ENDPOINT (es. https://s3.cubbit.eu), CUBBIT_REGION,
//   CUBBIT_PUBLIC_BASE_URL (base per l'URL pubblico di un oggetto caricato),
//   ADMIN_TOKEN (stesso valore di CFG.adminToken in config.js)
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MAX_FILENAME_LENGTH = 100;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'json non valido' }) };
  }

  const { adminToken, filename, contentType } = payload;

  // Stessa logica "offuscamento lato client" già usata ovunque nel progetto
  // (analyticsToken/adminToken): non è autenticazione vera, ma qui protegge
  // almeno l'unico endpoint che tocca credenziali reali da abusi casuali.
  if (!process.env.ADMIN_TOKEN || adminToken !== process.env.ADMIN_TOKEN) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: 'non autorizzato' }) };
  }
  if (!filename || typeof filename !== 'string') {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'filename mancante' }) };
  }

  const safeName = filename
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .slice(-MAX_FILENAME_LENGTH);
  const key = `slides/${Date.now()}-${safeName}`;

  try {
    const s3 = new S3Client({
      region: process.env.CUBBIT_REGION || 'eu-west-1',
      endpoint: process.env.CUBBIT_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.CUBBIT_ACCESS_KEY_ID,
        secretAccessKey: process.env.CUBBIT_SECRET_ACCESS_KEY,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.CUBBIT_BUCKET,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
      // Nessuna ACL qui: il bucket è già configurato con lettura pubblica a
      // livello di bucket, non serve impostarla per-oggetto.
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `${process.env.CUBBIT_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadUrl, publicUrl }),
    };
  } catch (err) {
    console.error('[get-upload-url] errore:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'errore generazione URL' }) };
  }
};
