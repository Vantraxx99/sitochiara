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

1. Serve un account GitHub con accesso al repository: il proprietario e ogni collaboratore (Settings → Collaborators) possono usare l'editor.
2. Si va su `chiaratangari.com/admin.html` oppure direttamente su https://app.pagescms.org, accede con GitHub e apre `sitochiara`.
3. Modifica i campi, carica le foto (finiscono in `img/uploads/`) e preme **Save**.

I moduli dell'editor sono definiti in `.pages.yml`.

## Pubblicazione su chiaratangari.com (GitHub Pages)
Il sito è pubblicato dal ramo `main`. Il file `CNAME` contiene già il dominio.

**Su GitHub** (una volta sola): Settings → Pages → Source "Deploy from a branch" → `main`, cartella `/ (root)` → Custom domain `chiaratangari.com` → quando il certificato è pronto, spunta "Enforce HTTPS".

**Su Aruba** (Pannello → Gestione DNS del dominio), eliminando prima i record A/CNAME già presenti per `@` e `www`:

| Tipo | Nome | Valore |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | vantraxx99.github.io. |

La propagazione dei DNS può richiedere da pochi minuti a qualche ora.
Ogni salvataggio dall'editor aggiorna il sito in circa un minuto.

> Il sito legge i contenuti con `fetch`, quindi va aperto da un server (GitHub Pages, oppure `python3 -m http.server` in locale), non con doppio clic sul file.

## Struttura
- `css/style.css`: stile (colori e font nelle variabili all'inizio)
- `js/main.js`: caricamento dei contenuti, animazioni, filtri, galleria, transizioni
- `js/scene3d.js`: scene 3D di tutte le pagine (Three.js)
- `docs/`: CV in PDF
