# Sito di Chiara Tangari

Sito portfolio (grafica ed eventi). Statico: nessuna installazione, basta aprire `index.html`.

## Come modificare i contenuti
Tutto è in `index.html`. Cerca i commenti **`MODIFICA`**:
- **Frase di presentazione**, **Chi sono**, **competenze**, **contatti**: sostituisci i testi d'esempio.
- **Foto di Chiara**: metti `img/chiara.jpg` e sostituisci il blocco `placeholder` come indicato nel commento.
- **Lavori**: due sezioni, `grafica` ed `eventi`. Copia un blocco `<figure class="work">`, cambia titolo/anno/descrizione e inserisci una riga `<img>` per ogni foto (la prima è la copertina); le foto vanno in `img/lavori/`.
- **CV scaricabile** (in "Chi sono"): metti il PDF in `docs/CV-Chiara-Tangari.pdf`.
- **Colori e font**: variabili all'inizio di `css/style.css`.

## Pubblicazione gratuita
GitHub → Settings → Pages → "Deploy from a branch" → branch principale, cartella `/ (root)`.
