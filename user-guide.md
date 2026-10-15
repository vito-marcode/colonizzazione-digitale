# Manuale utente — Colonizzazione Digitale

Guida pratica per chi presenta il lab in classe. Dominio del sito: [presentazio.devmarco.it](https://presentazio.devmarco.it)

## Le pagine del progetto

| Pagina | URL | Per chi | A cosa serve |
|---|---|---|---|
| Schermo principale | [presentazio.devmarco.it](https://presentazio.devmarco.it/) | Il presentatore, sul proiettore | Mostra solo il QR code; riceve e mostra i cuori inviati dagli studenti e il contatore di chi è connesso |
| Reel mobile | [presentazio.devmarco.it/reel.html](https://presentazio.devmarco.it/reel.html) | Gli studenti, sul telefono | Il carosello (immagini, immagini con citazioni, video) che scorre verticalmente (stile Instagram/TikTok); qui avviene tutto il tracciamento |
| Dashboard analytics | [presentazio.devmarco.it/analytics.html#colonizzazione2026](https://presentazio.devmarco.it/analytics.html#colonizzazione2026) | Solo il presentatore | Il "reveal" finale: mostra ai ragazzi cosa è stato tracciato di loro mentre guardavano il telefono |
| Admin | `presentazio.devmarco.it/admin.html#<adminToken>` | Solo il presentatore | Gestisce le slide del reel (crea/modifica/riordina/elimina) e i testi dello schermo QR — da usare prima della lezione |

Il link della dashboard qui sopra include già la password (`colonizzazione2026`) — basta cliccarlo, non serve digitare nulla. Se invece apri `analytics.html` senza il codice dopo il cancelletto, ti chiede una password: inserisci lo stesso valore. Lo stesso vale per `admin.html`, con il suo codice separato (`adminToken` in `config.js`) — a differenza della dashboard, non c'è alcun link/simbolo nascosto che ci porta: va aperto digitando l'URL per intero, proprio perché permette di modificare contenuti e non solo di leggerli.

## Come si svolge una sessione in classe

0. **Prima della lezione**, apri `admin.html` (vedi sotto) e controlla che le slide del reel siano quelle che vuoi mostrare.
1. **Apri lo schermo principale** ([presentazio.devmarco.it](https://presentazio.devmarco.it/)) sul proiettore, meglio a tutto schermo. Mostra solo il QR code: non c'è più nessuna presentazione da avviare.
2. Gli studenti inquadrano il **QR code** col telefono e si apre automaticamente il reel. Da quel momento ogni telefono crea una sessione anonima e inizia a essere tracciato.
3. Mentre gli studenti scorrono il reel sul telefono, possono premere il **cuore** in basso a destra per mettere "like" a una slide. Ogni cuore appare come animazione (cuoricini che salgono) e un suono sullo schermo principale del presentatore — è pensato per dare un feedback immediato e "gamificato" in aula.
4. In alto a destra sullo schermo principale c'è un **contatore di connessi in tempo reale** (pallino verde = tutto ok): mostra esattamente quanti telefoni hanno il reel aperto in questo momento, e scende da solo appena qualcuno chiude la pagina.
5. **Il momento del reveal**: quando vuoi rivelare agli studenti cosa è stato tracciato di loro, apri la dashboard analytics (vedi sotto) — è il cuore pedagogico dell'esperimento ("quello che l'algoritmo ha visto di voi").

### Gestire le slide del reel (admin.html)
Apri `admin.html#<adminToken>` per:
- **Testi schermo QR**: cambiare l'eyebrow, il sottotitolo e il titolo della pagina che compaiono sopra/sotto il QR code sul proiettore.
- **Slide del reel**: aggiungere una nuova slide scegliendo tra tre tipi — **immagine** (solo una foto), **immagine con testo sovrapposto** (una foto di sfondo più una citazione/titolo scritti sopra) o **video** (parte in automatico, senza audio, in loop, quando lo studente ci arriva sopra). Per ogni immagine/video puoi **incollare un URL** già pronto (es. un file già presente in `images/` su questo stesso sito, oppure ospitato altrove) **oppure premere "📤 Carica file"** per caricarlo direttamente dal tuo computer o telefono — il campo URL si riempie da solo col link del file appena caricato. Dalla stessa pagina puoi modificare, riordinare (frecce su/giù), vedere un'anteprima o eliminare una slide esistente.

  Non devi preoccuparti della risoluzione dell'immagine: viene automaticamente ridimensionata e compressa per il telefono (non succede per i video, che vanno quindi scelti già di dimensione ragionevole — limite di caricamento 10MB per le immagini, 150MB per i video).

- **Anteprima mobile**: il pulsante 👁 (sia nella lista delle slide sia dentro il form di modifica) mostra, dentro una cornice a forma di telefono, esattamente come apparirà quella slide sul reel — comodo per controllare leggibilità/colori prima di mostrarla in classe.
- **Colore del testo**: nelle slide "immagine con testo", il pallino accanto al campo colore apre una tavolozza di colori già pronti; il testo ha sempre un contorno automatico (scuro su sfondo chiaro, chiaro su sfondo scuro) per restare leggibile sopra qualunque foto.

Nota: eliminando una slide, i dati già raccolti su quella slide (tempo di permanenza, cuori) restano nel database e continuano a far parte dei totali in dashboard — semplicemente non comparirà più come card separata.

### Impostazioni dei cuori (schermo principale)
In basso a destra sullo schermo principale c'è un'icona a ingranaggio (⚙️) che apre un pannello con:
- **Cuori attivi**: interruttore per disattivare del tutto l'animazione dei cuori (utile se dà fastidio durante un video).
- **Intervallo minimo**: quanto tempo deve passare tra un'animazione di cuori e la successiva (Nessuno / 5s / 10s — default / 30s / 1 min). Non limita i cuori inviati dagli studenti (quelli vengono comunque salvati), solo quanto spesso lo schermo del proiettore mostra l'animazione.
- **Volume suono**: volume dell'effetto sonoro che accompagna i cuori (Muto / Basso / Medio — default / Alto).

Queste impostazioni sono locali al browser del proiettore, non vanno salvate/sincronizzate altrove.

### Come rivelare la dashboard agli studenti
Due modi:
- Vai direttamente su [presentazio.devmarco.it/analytics.html#colonizzazione2026](https://presentazio.devmarco.it/analytics.html#colonizzazione2026) (in un nuovo tab/finestra, magari proiettandola al posto della presentazione).
- Oppure, dallo schermo principale, c'è un piccolo simbolo `◆` quasi invisibile in basso a sinistra: cliccandolo si apre la dashboard in una nuova scheda (pensato per essere scoperto/rivelato "a sorpresa" durante il discorso, da non mostrare prima).

## Cosa viene raccolto (tutto anonimo, nessun dato personale)

Ogni telefono che apre il reel genera una sessione anonima (un ID casuale, non collegato a nome/email) con questi dati:

- **Sessione**: browser, sistema operativo, se è mobile o desktop, risoluzione schermo, lingua, durata totale della visita, modello del telefono (quando rilevabile — su iPhone non è possibile, Apple lo nasconde di proposito, e anche browser attenti alla privacy come Brave lo bloccano deliberatamente) e operatore/rete usata.
- **Per ogni slide vista**: quanto tempo ci si è fermati sopra (dwell time), se si è tornati indietro a rivederla, e — dalla posizione X del dito sullo schermo mentre si scorre — una stima di quale mano viene usata per tenere il telefono.
- **Cuori**: quale slide, a che ora del giorno.
- **Gesti di scroll**: avanti o indietro, veloce o lento.

Non viene mai chiesto né salvato nome, email o qualunque identificativo personale: è pensato apposta per mostrare quanto si può dedurre da un uso "anonimo" di un servizio (il punto centrale del talk).

## La dashboard: come leggerla

Aprendo [analytics.html](https://presentazio.devmarco.it/analytics.html#colonizzazione2026) con il codice giusto trovi, in ordine:

- **Barra "Mostra dati da"**: vedi la sezione sotto, serve a far ripartire la dashboard pulita tra una classe e l'altra.
- **5 numeri in alto**: spettatori unici, cuori totali, slide viste, gesti di scroll, durata media di una sessione.
- **Attenzione per slide**: una card per ciascuna slide attualmente configurata (vedi `admin.html`) con tempo medio di permanenza e numero di cuori ricevuti.
- **🤚 Rilevamento mano**: percentuale di utilizzo mano sinistra / centro / destra, stimata dalla posizione dei tocchi durante lo scroll (i cuori sono esclusi da questo calcolo perché il bottone è fisso in basso a destra e falserebbe il risultato).
- **Attività per ora del giorno**: istogramma di quando è avvenuta l'interazione.
- **Comportamento di scroll**: quanti scroll in avanti/indietro, quanti "veloci", velocità media, quante volte si è tornati su una slide già vista.
- **Classifiche**: tempo medio per slide e cuori per slide, in ordine.
- **Dispositivi & Browser**: quanti iPhone/Android, quanti Chrome/Safari/Firefox, ecc.
- **Sessioni recenti**: tabella con le ultime 30 sessioni, una riga per spettatore — include anche modello del dispositivo e operatore/rete, quando disponibili.

La dashboard si **auto-aggiorna ogni 30 secondi** da sola: puoi lasciarla aperta e proiettata mentre continuano ad arrivare dati, oppure premere **"↺ Aggiorna"** in alto a destra per forzare un refresh immediato.

## Come ripartire con dati puliti tra una classe e l'altra

I dati **non si cancellano da soli**: se fai due lezioni di seguito senza intervenire, la seconda dashboard mostrerà anche i dati della prima. Nella barra in cima alla dashboard trovi tre controlli:

- **"Mostra dati da"** (campo data/ora): puoi impostare manualmente da quando vuoi vedere i dati.
- **"🆕 Nuova sessione da adesso"**: il pulsante da usare prima di ogni nuova classe. Imposta il filtro all'istante in cui lo premi — da quel momento la dashboard mostra e conta solo ciò che arriva dopo, come se ripartisse da zero.
- **"Mostra tutti i dati"**: rimuove il filtro e torna a vedere tutto, incluse le classi precedenti.

Nessuno di questi pulsanti cancella qualcosa: i dati delle classi passate restano tutti raccolti, semplicemente non vengono più mostrati finché non premi di nuovo "Mostra tutti i dati". Il filtro è salvato solo nel browser che stai usando in quel momento (sopravvive a un refresh della pagina), non è condiviso con altri dispositivi: se apri la dashboard da un altro telefono/computer non lo troverai impostato, e dovrai premere di nuovo "Nuova sessione da adesso" lì.

## Domande frequenti

**Gli studenti vedono la dashboard?** Solo se gliela mostri tu (o gliela riveli col link/simbolo nascosto). Di default non è raggiungibile senza il codice.

**Serve che gli studenti si registrino o inseriscano dati?** No, basta scansionare il QR: la sessione è automatica e anonima.

**Cosa succede se uno studente chiude il reel a metà?** Va bene comunque: il tracciamento salva progressivamente quello che è successo fino a quel momento (anche se il telefono va in blocco schermo o cambia app a metà), non serve arrivare alla fine del reel.

**Posso riusare lo stesso link per più classi nello stesso giorno?** Sì, ma premi **"🆕 Nuova sessione da adesso"** nella dashboard (vedi sopra) tra una classe e l'altra se vuoi vedere i dati di ogni classe separatamente invece che sommati insieme.
