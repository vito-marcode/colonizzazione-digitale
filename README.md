# Colonizzazione Digitale — Lab Interattivo

Progetto didattico: presentazione sulla sorveglianza digitale con reel interattivo tracciato.

## Setup in 5 passi

### 1. Crea il progetto Supabase
1. Vai su [supabase.com](https://supabase.com) → New project
2. **SQL Editor** → Incolla e lancia `supabase-schema.sql`
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
├── index.html          # Schermo principale (QR + presentazione + cuori)
├── reel.html           # Pagina mobile (carosello tracciato)
├── analytics.html      # Dashboard analytics (nascosta)
├── config.js           # Configurazione (URL, immagini, token)
├── images/             # Immagini del reel
│   └── slide-01.png
├── supabase-schema.sql # Schema DB da caricare su Supabase
└── netlify.toml        # Config Netlify
```

## Dati raccolti (tutti anonimi)
- Tempo di attenzione per ogni slide
- Velocità di scorrimento
- Rilevamento mano (sinistra/destra) dalla posizione X del tocco
- Cuori per slide e ora del giorno
- Browser, OS, risoluzione (non personali)
- Pattern di scroll (avanti/indietro, veloce/lento)
