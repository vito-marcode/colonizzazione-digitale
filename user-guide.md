# Manuale utente — Colonizzazione Digitale

Guida pratica per chi presenta il lab in classe. Dominio del sito: **https://presentazio.devmarco.it**

## Le pagine del progetto

| Pagina | URL | Per chi | A cosa serve |
|---|---|---|---|
| Schermo principale | `https://presentazio.devmarco.it/` (o `/index.html`) | Il presentatore, sul proiettore | Mostra il QR code, poi la presentazione con le slide sulla sorveglianza digitale; riceve e mostra i cuori inviati dagli studenti |
| Reel mobile | `https://presentazio.devmarco.it/reel.html` | Gli studenti, sul telefono | Il carosello di immagini che scorrono verticalmente (stile Instagram/TikTok); qui avviene tutto il tracciamento |
| Dashboard analytics | `https://presentazio.devmarco.it/analytics.html#colonizzazione2026` | Solo il presentatore | Il "reveal" finale: mostra ai ragazzi cosa è stato tracciato di loro mentre guardavano il telefono |

L'URL della dashboard include già la password (`colonizzazione2026`, configurabile in `config.js` come `analyticsToken`) — basta aprirlo, non serve digitare nulla. Se invece apri `analytics.html` senza il codice dopo il cancelletto, ti chiede una password: inserisci lo stesso valore.

## Come si svolge una sessione in classe

1. **Apri lo schermo principale** (`index.html`) sul proiettore, meglio a tutto schermo.
2. Compare un **QR code**: gli studenti lo inquadrano col telefono e si apre automaticamente `reel.html`. Da quel momento ogni telefono crea una sessione anonima e inizia a essere tracciato.
3. Quando sono pronti, clicca **"▶ Inizia la presentazione"**: lo schermo principale passa dal QR alle slide vere e proprie (il contenuto sulla colonizzazione digitale, i video, ecc.).
4. Mentre gli studenti scorrono il reel sul telefono, possono premere il **cuore** in basso a destra per mettere "like" a una slide. Ogni cuore appare come animazione (cuoricini che salgono) e un suono sullo schermo principale del presentatore — è pensato per dare un feedback immediato e "gamificato" in aula.
5. In alto a destra sullo schermo principale c'è un **contatore di spettatori connessi** (pallino verde = connesso in tempo reale).
6. **Il momento del reveal**: quando vuoi rivelare agli studenti cosa è stato tracciato di loro, apri la dashboard analytics (vedi sotto) — è il cuore pedagogico dell'esperimento ("quello che l'algoritmo ha visto di voi").

### Impostazioni dei cuori (schermo principale)
In basso a destra sullo schermo principale c'è un'icona a ingranaggio (⚙️) che apre un pannello con:
- **Cuori attivi**: interruttore per disattivare del tutto l'animazione dei cuori (utile se dà fastidio durante un video).
- **Intervallo minimo**: quanto tempo deve passare tra un'animazione di cuori e la successiva (Nessuno / 5s / 10s — default / 30s / 1 min). Non limita i cuori inviati dagli studenti (quelli vengono comunque salvati), solo quanto spesso lo schermo del proiettore mostra l'animazione.
- **Volume suono**: volume dell'effetto sonoro che accompagna i cuori (Muto / Basso / Medio — default / Alto).

Queste impostazioni sono locali al browser del proiettore, non vanno salvate/sincronizzate altrove.

### Come rivelare la dashboard agli studenti
Due modi:
- Vai direttamente su `https://presentazio.devmarco.it/analytics.html#colonizzazione2026` (in un nuovo tab/finestra, magari proiettandola al posto della presentazione).
- Oppure, dallo schermo principale, c'è un piccolo simbolo `◆` quasi invisibile in basso a sinistra: cliccandolo si apre la dashboard in una nuova scheda (pensato per essere scoperto/rivelato "a sorpresa" durante il discorso, da non mostrare prima).

## Cosa viene raccolto (tutto anonimo, nessun dato personale)

Ogni telefono che apre il reel genera una sessione anonima (un ID casuale, non collegato a nome/email) con questi dati:

- **Sessione**: browser, sistema operativo, se è mobile o desktop, risoluzione schermo, lingua, durata totale della visita.
- **Per ogni slide vista**: quanto tempo ci si è fermati sopra (dwell time), se si è tornati indietro a rivederla, e — dalla posizione X del dito sullo schermo mentre si scorre — una stima di quale mano viene usata per tenere il telefono.
- **Cuori**: quale slide, a che ora del giorno.
- **Gesti di scroll**: avanti o indietro, veloce o lento.

Non viene mai chiesto né salvato nome, email o qualunque identificativo personale: è pensato apposta per mostrare quanto si può dedurre da un uso "anonimo" di un servizio (il punto centrale del talk).

## La dashboard: come leggerla

Aprendo `analytics.html` con il codice giusto trovi, in ordine:

- **5 numeri in alto**: spettatori unici, cuori totali, slide viste, gesti di scroll, durata media di una sessione.
- **Attenzione per slide**: una card per ognuna delle 8 slide con tempo medio di permanenza e numero di cuori ricevuti.
- **🤚 Rilevamento mano**: percentuale di utilizzo mano sinistra / centro / destra, stimata dalla posizione dei tocchi durante lo scroll (i cuori sono esclusi da questo calcolo perché il bottone è fisso in basso a destra e falserebbe il risultato).
- **Attività per ora del giorno**: istogramma di quando è avvenuta l'interazione.
- **Comportamento di scroll**: quanti scroll in avanti/indietro, quanti "veloci", velocità media, quante volte si è tornati su una slide già vista.
- **Classifiche**: tempo medio per slide e cuori per slide, in ordine.
- **Dispositivi & Browser**: quanti iPhone/Android, quanti Chrome/Safari/Firefox, ecc.
- **Sessioni recenti**: tabella con le ultime 30 sessioni, una riga per spettatore.

La dashboard si **auto-aggiorna ogni 30 secondi** da sola: puoi lasciarla aperta e proiettata mentre continuano ad arrivare dati, oppure premere "↺ Aggiorna" per forzare un refresh immediato.

## Come resettare i dati (prima di una nuova classe/sessione)

I dati **non si cancellano da soli**: se fai due lezioni di seguito senza resettare, la seconda dashboard mostrerà anche i dati della prima. Il sito stesso non permette di cancellare i dati (per motivi di sicurezza, il tasto/telefono degli studenti può solo scrivere e leggere, non cancellare), quindi il reset va fatto manualmente da chi amministra il progetto Supabase:

1. Vai su [supabase.com](https://supabase.com) → apri il progetto del lab → **SQL Editor**.
2. Esegui questa query per svuotare tutte le tabelle e ripartire da zero:
   ```sql
   TRUNCATE TABLE hearts, image_views, scroll_events, sessions;
   ```
3. Ricarica la dashboard: i contatori torneranno tutti a zero, pronti per la classe successiva.

Se invece vuoi tenere lo storico e togliere solo dei dati di prova (es. sessioni create testando tu stesso il sito prima della lezione), puoi cancellare righe puntuali dalla scheda **Table Editor** di Supabase, oppure con una `DELETE` mirata, ad esempio:
```sql
DELETE FROM sessions WHERE id = 'l-id-della-sessione-di-prova';
```
(cancellando una sessione da `sessions` non si cancellano automaticamente le sue righe in `image_views`/`hearts`/`scroll_events`: se vuoi ripulire per bene, cancella anche quelle con lo stesso `session_id`.)

## Domande frequenti

**Gli studenti vedono la dashboard?** Solo se gliela mostri tu (o gliela riveli col link/simbolo nascosto). Di default non è raggiungibile senza il codice.

**Serve che gli studenti si registrino o inseriscano dati?** No, basta scansionare il QR: la sessione è automatica e anonima.

**Cosa succede se uno studente chiude il reel a metà?** Va bene comunque: il tracciamento salva progressivamente quello che è successo fino a quel momento (anche se il telefono va in blocco schermo o cambia app a metà), non serve arrivare alla fine del reel.

**Posso riusare lo stesso link per più classi nello stesso giorno?** Sì, ma ricordati di **resettare i dati** (vedi sopra) tra una classe e l'altra se vuoi dashboard separate e non cumulative.
