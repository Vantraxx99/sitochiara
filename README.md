# Sito di Chiara Tangari

Portfolio di Chiara Tangari (Event Manager & Designer). Sito statico su più pagine:

| Pagina | File |
| --- | --- |
| Home (scena 3D) | `index.html` |
| Chi sono + CV | `chi-sono.html` |
| Lavori (Grafica / Eventi) | `lavori.html` |
| Contatti | `contatti.html` |
| Area admin (non linkata nel menu) | `admin.html` |

## Modificare i contenuti senza codice
Tutti i testi, le foto, i lavori e il CV stanno nella cartella `content/` (file JSON) e si modificano da **Pages CMS**:

1. Chiara serve un account GitHub con accesso al repository (Settings → Collaborators → invito).
2. Va su `tuosito/admin.html` oppure direttamente su https://app.pagescms.org, accede con GitHub e apre `sitochiara`.
3. Modifica i campi, carica le foto (finiscono in `img/uploads/`) e preme **Save**.

I moduli dell'editor sono definiti in `.pages.yml`.

## Pubblicazione (GitHub Pages)
GitHub → Settings → Pages → "Deploy from a branch" → `main`, cartella `/ (root)`.
Ogni salvataggio dall'editor aggiorna il sito in circa un minuto.

> Il sito legge i contenuti con `fetch`, quindi va aperto da un server (GitHub Pages, oppure `python3 -m http.server` in locale), non con doppio clic sul file.

## Struttura
- `css/style.css`: stile (colori e font nelle variabili all'inizio)
- `js/main.js`: caricamento dei contenuti, animazioni, filtri, galleria, transizioni
- `js/scene3d.js`: scene 3D di tutte le pagine (Three.js)
- `docs/`: CV in PDF
