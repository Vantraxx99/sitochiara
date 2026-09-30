# Sito di Chiara Tangari

Sito portfolio + curriculum. Statico: nessuna installazione, basta aprire `index.html`.

## Come modificare i contenuti
Tutto è in `index.html`. Cerca i commenti **`MODIFICA`**:
- **Frase di presentazione**, **Chi sono**, **competenze**, **curriculum**, **contatti**: sostituisci i testi d'esempio.
- **Foto di Chiara**: metti `img/chiara.jpg` e sostituisci il blocco `placeholder` come indicato nel commento.
- **Lavori**: copia un blocco `<figure class="work">`, cambia titolo/anno/descrizione e metti la foto in `img/lavori/` (al posto del `placeholder`, usa `<img src="img/lavori/nome.jpg" alt="descrizione">`).
- **CV scaricabile**: metti il PDF in `docs/CV-Chiara-Tangari.pdf`.
- **Colori e font**: variabili all'inizio di `css/style.css`.

## Pubblicazione gratuita
GitHub → Settings → Pages → "Deploy from a branch" → branch principale, cartella `/ (root)`.
