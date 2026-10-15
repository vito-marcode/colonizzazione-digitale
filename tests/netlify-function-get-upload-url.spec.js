// Test diretto della Netlify Function (nessun browser necessario): verifica
// la logica di validazione/autorizzazione con credenziali Cubbit finte —
// mai quelle vere, questo file gira anche in CI senza segreti configurati.
// Il comportamento reale verso Cubbit (bucket/credenziali vere) si verifica
// a mano con scripts/cubbit-upload-probe.mjs dopo il deploy.
const { test, expect } = require('@playwright/test');
const { handler } = require('../netlify/functions/get-upload-url.js');

test.beforeEach(() => {
  process.env.ADMIN_TOKEN = 'test-admin-token';
  process.env.CUBBIT_REGION = 'eu-west-1';
  process.env.CUBBIT_ENDPOINT = 'https://s3.cubbit.eu';
  process.env.CUBBIT_BUCKET = 'test-bucket';
  process.env.CUBBIT_ACCESS_KEY_ID = 'fake-key-id';
  process.env.CUBBIT_SECRET_ACCESS_KEY = 'fake-secret';
  process.env.CUBBIT_PUBLIC_BASE_URL = 'https://test-bucket.s3.cubbit.eu';
});

test('OPTIONS (preflight CORS) risponde 204 senza controllare nulla', async () => {
  const res = await handler({ httpMethod: 'OPTIONS' });
  expect(res.statusCode).toBe(204);
});

test('rifiuta metodi diversi da POST/OPTIONS', async () => {
  const res = await handler({ httpMethod: 'GET' });
  expect(res.statusCode).toBe(405);
});

test('rifiuta un body non JSON', async () => {
  const res = await handler({ httpMethod: 'POST', body: 'non è json' });
  expect(res.statusCode).toBe(400);
});

test('rifiuta adminToken assente o sbagliato', async () => {
  const resMissing = await handler({ httpMethod: 'POST', body: JSON.stringify({ filename: 'a.jpg' }) });
  expect(resMissing.statusCode).toBe(401);

  const resWrong = await handler({ httpMethod: 'POST', body: JSON.stringify({ adminToken: 'sbagliato', filename: 'a.jpg' }) });
  expect(resWrong.statusCode).toBe(401);
});

test('rifiuta filename assente', async () => {
  const res = await handler({ httpMethod: 'POST', body: JSON.stringify({ adminToken: 'test-admin-token' }) });
  expect(res.statusCode).toBe(400);
});

test('con adminToken corretto genera uploadUrl e publicUrl, sanificando il filename', async () => {
  const res = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ adminToken: 'test-admin-token', filename: 'la mia foto!.jpg', contentType: 'image/jpeg' }),
  });
  expect(res.statusCode).toBe(200);
  const body = JSON.parse(res.body);

  expect(body.uploadUrl).toContain('test-bucket'); // path-style (forcePathStyle:true)
  expect(body.uploadUrl).toContain('X-Amz-Signature='); // è davvero un URL firmato
  expect(body.publicUrl).toMatch(/^https:\/\/test-bucket\.s3\.cubbit\.eu\/slides\/\d+-la_mia_foto_\.jpg$/);
});
