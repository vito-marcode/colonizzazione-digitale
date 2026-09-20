// getDeviceModel() deve filtrare i valori inutilizzabili invece di mostrarli
// come se fossero un vero modello di dispositivo: scenari osservati dal vivo
// in produzione (Brave che restituisce "Brave" come model fasullo, renderer
// SwiftShader/software) simulati qui iniettando via addInitScript i valori
// che Client Hints / WebGL restituirebbero su browser reali.
const { test, expect } = require('@playwright/test');
const { installSupabaseMock } = require('./fixtures/mock-supabase');

function mockClientHintsModel(page, model) {
  return page.addInitScript((model) => {
    Object.defineProperty(navigator, 'userAgentData', {
      value: { getHighEntropyValues: async () => ({ model }) },
      configurable: true,
    });
  }, model);
}

function mockWebglRenderer(page, renderer) {
  return page.addInitScript((renderer) => {
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'experimental-webgl') {
        return {
          getExtension: (name) => (name === 'WEBGL_debug_renderer_info' ? { UNMASKED_RENDERER_WEBGL: 'RENDERER' } : null),
          getParameter: () => renderer,
        };
      }
      return origGetContext.call(this, type, ...args);
    };
  }, renderer);
}

async function getModel(context, page) {
  const store = installSupabaseMock(context);
  await page.goto('/reel.html');
  await expect.poll(() => store.sessions.length).toBe(1);
  return store.sessions[0].device_model;
}

test('Brave: il finto "model" viene scartato, si passa al WebGL', async ({ context, page }) => {
  await mockClientHintsModel(page, 'Brave');
  await mockWebglRenderer(page, 'ANGLE (ARM, Mali-G78 MP20, OpenGL ES 3.2)');
  expect(await getModel(context, page)).toBe('Mali-G78 MP20');
});

test('Brave con WEBGL_debug_renderer_info bloccato: nessun modello inventato', async ({ context, page }) => {
  await mockClientHintsModel(page, 'Brave');
  await page.addInitScript(() => {
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'experimental-webgl') {
        return { getExtension: () => null, getParameter: () => null };
      }
      return origGetContext.call(this, type, ...args);
    };
  });
  expect(await getModel(context, page)).toBeNull();
});

test('renderer SwiftShader (software, nessuna GPU reale): scartato', async ({ context, page }) => {
  await mockWebglRenderer(page, 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)');
  expect(await getModel(context, page)).toBeNull();
});

test('renderer ANGLE reale: estrae solo il nome del chip', async ({ context, page }) => {
  await mockWebglRenderer(page, 'ANGLE (ARM, Mali-G57 MC2, OpenGL ES 3.2)');
  expect(await getModel(context, page)).toBe('Mali-G57 MC2');
});

test('renderer generico Apple (Safari/Firefox anonimizzano di proposito): mostrato cosi com\'e\'', async ({ context, page }) => {
  await mockWebglRenderer(page, 'Apple GPU');
  expect(await getModel(context, page)).toBe('Apple GPU');
});
