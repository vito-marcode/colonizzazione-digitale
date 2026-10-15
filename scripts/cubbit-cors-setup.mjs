// Script una tantum (NON fa parte della suite di test): imposta la policy
// CORS sul bucket Cubbit via API S3 (PutBucketCors), perché la console web
// di Cubbit non sembra esporre questa impostazione da interfaccia grafica.
// Senza CORS il browser blocca la PUT di upload diretta da admin.html verso
// Cubbit, anche con credenziali e permessi corretti.
//
// Le credenziali vanno passate SOLO come variabili d'ambiente al momento di
// lanciare lo script, mai salvate nel repo:
//
//   CUBBIT_ACCESS_KEY_ID=... \
//   CUBBIT_SECRET_ACCESS_KEY=... \
//   CUBBIT_ENDPOINT=https://s3.cubbit.eu \
//   CUBBIT_BUCKET=montelago \
//   node scripts/cubbit-cors-setup.mjs
//
// (CUBBIT_REGION è opzionale, default eu-west-1 come nella function reale.)
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

const SITE_ORIGIN = 'https://presentazio.devmarco.it';

const required = ['CUBBIT_ACCESS_KEY_ID', 'CUBBIT_SECRET_ACCESS_KEY', 'CUBBIT_ENDPOINT', 'CUBBIT_BUCKET'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error('Mancano queste variabili d\'ambiente:', missing.join(', '));
  process.exit(1);
}

const s3 = new S3Client({
  region: process.env.CUBBIT_REGION || 'eu-west-1',
  endpoint: process.env.CUBBIT_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.CUBBIT_ACCESS_KEY_ID,
    secretAccessKey: process.env.CUBBIT_SECRET_ACCESS_KEY,
  },
});

async function main() {
  console.log(`1. Imposto la policy CORS sul bucket "${process.env.CUBBIT_BUCKET}" (origine consentita: ${SITE_ORIGIN})...`);
  await s3.send(new PutBucketCorsCommand({
    Bucket: process.env.CUBBIT_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: [SITE_ORIGIN],
          AllowedMethods: ['PUT', 'GET'],
          AllowedHeaders: ['*'],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }));
  console.log('   ✅ fatto.');

  console.log('\n2. Rileggo la policy CORS per confermare...');
  const res = await s3.send(new GetBucketCorsCommand({ Bucket: process.env.CUBBIT_BUCKET }));
  console.log(JSON.stringify(res.CORSRules, null, 2));

  console.log('\nOra puoi verificare l\'upload end-to-end con:');
  console.log('  node scripts/cubbit-upload-probe.mjs');
}

main().catch((e) => { console.error('❌ errore:', e); process.exit(1); });
