# Colonizzazione Digitale — Lab Interattivo

Progetto didattico: presentazione sulla sorveglianza digitale con reel interattivo tracciato.

## Setup in 5 passi

### 1. Crea il progetto Supabase
1. Vai su [supabase.com](https://supabase.com) → New project
2. **SQL Editor** → Incolla e lancia `supabase-schema.sql`, poi anche `supabase-schema-updates.sql` (aggiunge una policy RLS mancante nello schema iniziale, senza la quale la durata delle sessioni non viene mai salvata)
3. Vai su **Project Settings → API** → copia:
   - `Project URL`
   - `anon` public key

### 2. Configura `config.js`
```js
supabaseUrl:      'https://xxxx.supabase.co',
supabaseKey:      'eyJ...',
siteUrl:          'https://tuo-sito.netlify.app',
analyticsToken:   'colonizzazione2026',  // cambia a piacere
```

### 3. Aggiungi immagini al reel
- Metti i file in `images/`
- Aggiungile all'array `slides` in `config.js`:
```js
{ type: 'image', src: 'images/mia-foto.jpg', label: 'descrizione' }
```

### 4. Deploy su Netlify
1. Push su GitHub (già fatto)
2. [netlify.com](https://netlify.com) → "Import from Git" → seleziona questo repo
3. Deploy → ottieni l'URL del sito
4. Aggiorna `siteUrl` in `config.js` e ri-pusha

### 5. In classe
| Chi | Cosa fa |
|---|---|
| Professore | Apre `index.html` sul proiettore |
| Studenti | Scansionano il QR → aprono il reel sul telefono |
| Fine sessione | Il professore rivela l'URL analytics: `https://tuo-sito.netlify.app/analytics.html#colonizzazione2026` |

## Struttura
```
├── index.html                    # Schermo principale (QR + presentazione + cuori)
├── reel.html                     # Pagina mobile (carosello tracciato)
├── analytics.html                # Dashboard analytics (nascosta)
├── config.js                     # Configurazione (URL, immagini, token)
├── images/                       # Immagini del reel
│   └── slide-01.png
├── supabase-schema.sql           # Schema DB iniziale da caricare su Supabase
├── supabase-schema-updates.sql   # Aggiornamenti allo schema (esegui dopo il primo)
├── netlify.toml                  # Config Netlify
├── scripts/
│   └── rls-probe.mjs             # Verifica una tantum dei permessi RLS su Supabase
└── tests/                        # Suite di test automatici (vedi sotto)
```

## Sviluppo e test in locale

### Vedere il sito in locale
Nessun build step: basta un server statico qualsiasi puntato alla cartella del progetto, ad es.
```bash
python3 -m http.server 8080
```
poi apri `http://localhost:8080/index.html` (schermo principale), `.../reel.html` (versione mobile) o `.../analytics.html#<analyticsToken>` (dashboard). Attenzione: `config.js` punta al progetto Supabase vero, quindi ogni interazione fatta così scrive dati reali (utile per un test manuale rapido, non per provare cose a raffica).

### Suite di test automatici (Playwright)
Il progetto include una suite di test end-to-end che pilota `reel.html` con un **vero browser mobile emulato** (gesti touch reali, non semplici click) e verifica che ogni dato mostrato in `analytics.html` sia calcolato correttamente. Le richieste verso Supabase vengono intercettate e simulate in locale (`tests/fixtures/mock-supabase.js`): i test non toccano mai il database reale.

Setup (una tantum):
```bash
npm install
npx playwright install chromium
```

Eseguire i test:
```bash
npm test              # tutta la suite, headless
npm run test:headed   # con il browser visibile
npm run test:ui       # interfaccia grafica interattiva di Playwright
npm run report        # apre l'ultimo report HTML
```

### Verificare i permessi Supabase (RLS)
`scripts/rls-probe.mjs` è uno script separato (non fa parte di `npm test`) che scrive, aggiorna e rilegge **una singola riga di prova** sul progetto Supabase reale, per controllare che le policy RLS lascino davvero passare le scritture che l'app si aspetta di poter fare. Va eseguito a mano quando serve, non in automatico:
```bash
node scripts/rls-probe.mjs
```
Alla fine stampa la query SQL per eliminare la riga di prova appena creata.

## Dati raccolti (tutti anonimi)
- Tempo di attenzione per ogni slide
- Velocità di scorrimento
- Rilevamento mano (sinistra/destra) dalla posizione X del tocco
- Cuori per slide e ora del giorno
- Browser, OS, risoluzione (non personali)
- Pattern di scroll (avanti/indietro, veloce/lento)
