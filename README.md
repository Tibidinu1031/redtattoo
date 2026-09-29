# RED TATTOO

Site pentru RED TATTOO by Cristi Nitu. HTML, CSS și JavaScript, fără framework sau dependențe de instalat.

Designul folosește un portret amplu în prima secțiune, contrast negru–roșu, compoziții fotografice și tipografie editorială. Navigarea rămâne vizibilă la derulare; stilurile schimbă exemplul foto, iar procesul afișează numărul etapei selectate. Galeria urmărește gestul de tragere, are un indiciu vizual pentru cursor pe desktop. Mișcarea respectă preferința de reducere a animațiilor.

Pe mobil, titlul, portretul și acțiunile din hero au rânduri separate, astfel încât textul să nu acopere artistul. Săgețile din interfață sunt SVG-uri inline, pentru a avea același aspect și în Safari pe iPhone, fără conversie în emoji.

## Pornire

Deschide `index.html` direct în browser sau, cu Node.js 20+:

```sh
npm run dev
```

Previzualizare: http://127.0.0.1:5173.

## Structură

- `index.html` — pagina principală, în rădăcina repository-ului.
- `styles.css` — design responsive, galerie 3D și stări interactive.
- `app.js` — carusel, gesturi, grilă, vizualizator foto, zoom, meniu și taburi.
- `assets/gallery-data.js` — cele 20 de intrări ale galeriei.
- `assets/gallery/` — fotografiile reale și documentarea surselor.
- `scripts/` — server local și build static.
- `.github/workflows/pages.yml` — publicare automată GitHub Pages.
- `.nojekyll` — compatibilitate cu GitHub Pages.
- `.openai/hosting.json` — identificatorul previzualizării Sites de pe contul anterior; nu este necesar pentru GitHub Pages.

Toate căile sunt relative. Pagina funcționează la rădăcina unui domeniu, sub `/nume-repository/` și prin deschiderea locală a `index.html`.

## Galerie și interacțiuni

20 de fotografii reale: **18 lucrări și 2 imagini din studio**. Răsfoirea funcționează prin:

- săgețile de pe ecran, ←/→, Home/End sau tragerea fotografiilor;
- glisare orizontală pe telefon, fără blocarea derulării verticale;
- miniaturi sau modul „Toate imaginile”;
- clic pe fotografia activă pentru vizualizare completă, cu zoom și sursa fotografiei;
- Escape pentru închidere și revenire la controlul anterior.

Galeria nu avansează automat. Mișcarea respectă `prefers-reduced-motion`. Meniul mobil, acordeoanele și etapele procesului funcționează și din tastatură. Tab și Shift+Tab își păstrează rolul obișnuit de navigare.

## Fotografii și proveniență

Fotografiile sunt publicate în [advertorialul Ora de Sibiu dedicat RED TATTOO, 26 octombrie 2020](https://www.oradesibiu.ro/2020/10/26/povesti-pe-piele-la-red-tattoo-by-cristi-nitu-cel-mai-nou-salon-de-tatuaje-din-sibiu/). Utilizarea acestei surse a fost aleasă de utilizator deoarece conturile sociale nu au permis preluarea directă.

Galeria indică anul arhivei și sursa. Nu prezintă aceste imagini drept postări actuale de Instagram sau Facebook. Portretul din prima secțiune și fotografia artistului la lucru sunt reale, din aceeași sursă. În pagină nu sunt utilizate imaginile conceptuale ale versiunii precedente.

`source-manifest.json` conține sursele, dimensiunile și hash-urile fișierelor; `gallery-selection.json` documentează selecția. Nu există o licență deschisă explicită în sursă; drepturile fotografiilor rămân ale titularilor lor.

Pentru înlocuire sau adăugare, pune fotografia în `assets/gallery/` și modifică `assets/gallery-data.js`. Fiecare intrare are `src`, `title`, `alt`, `category`, `source`, `width` și `height`. Numărătoarea, miniaturile și grila se generează automat. Actualizează și descrierea „18 lucrări. 2 cadre din studio.” din HTML dacă selecția se schimbă.

## Verificare și build

```sh
npm run check
npm run build
```

Build-ul recreează `dist/` și copiază numai pagina, stilurile, scripturile și fotografiile folosite. Nu include cercetarea, capturile QA sau imaginile conceptuale vechi. Directorul `dist/` este ignorat de Git.

## Commit și push în GitHub

Repository-ul local este deja inițializat pe `main`. Creează un repository gol în GitHub și, din acest folder, configurează adresa ta:

```sh
git status
git remote add origin https://github.com/UTILIZATOR/REPOSITORY.git
git push -u origin main
```

Dacă există deja `origin`, verifică întâi `git remote -v`. Pentru editările viitoare:

```sh
git add .
git commit -m "Update RED TATTOO"
git push
```

## GitHub Pages

În repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Workflow-ul inclus publică la fiecare push pe `main`; poate fi pornit și manual din Actions.

Alternativ, dezactivează workflow-ul și alege **Deploy from a branch → main → / (root)**. `index.html` și `.nojekyll` sunt deja în rădăcină.

## Contact și personalizare

Linkurile Instagram și Facebook sunt cele furnizate de utilizator. Programările încep printr-o conversație pe paginile salonului; site-ul nu simulează trimiterea unui formular. Textul „Să creem ceva” este păstrat exact conform cererii.

Fonturile DM Sans, Barlow Condensed și Libre Caslon Display se încarcă din Google Fonts, cu fonturi locale de rezervă. Site-ul nu adaugă analytics sau stocare locală proprie. Harta încorporată încarcă un serviciu terț Google Maps, care are propriile politici de date și cookie-uri.

Logo-ul original furnizat de utilizator este păstrat fără modificări în `assets/red-tattoo-logo.png`. Emblema completă apare la artist și în subsol; monograma din antet folosește aceeași imagine, încadrată prin CSS. Fotografiile au colțuri discret rotunjite, iar liniile decorative dintre secțiuni sunt eliminate.

## Contact și recenzii

Ordinea noilor secțiuni este: recenzii (`#recenzii`), contact și hartă (`#locatie`), apoi secțiunea originală 05 pentru programări (`#contact`). Adresa **Strada Tilișca nr. 48, bloc 4, Sibiu** a fost confirmată de utilizator. Telefonul **0742 451 134** și pinul au fost verificate pe [Google Maps](https://www.google.com/maps?cid=2253711741192608784) la 29 septembrie 2026. Butonul de telefon folosește `tel:`, iar harta și indicațiile folosesc identificatorul locului pentru a evita confuzia cu vechea adresă de pe Strada Morilor.

Cele cinci recenzii au fost alese prin linkuri Google furnizate de utilizator și verificate la 29 septembrie 2026: Simi, Marcu Adrian, Andreea Andreea, Iulia Sălăgeanu și Bianca Ganea. Fiecare sursă afișează 5 stele. Numele și fotografiile de profil sunt cele publicate de autori. Textele rămân în româna originală, inclusiv formulările autorilor; două recenzii sunt afișate ca fragmente, marcate vizibil, cu link către textul complet.

`assets/reviews-data.js` conține datele, iar `assets/reviews/sources.json` păstrează sursele și proveniența fotografiilor. Componenta afișează cinci carduri cu fotografii locale, stele SVG, nume, text și link către sursă. Navigarea funcționează prin glisare nativă, butoane și tastatură, fără derulare automată. Build-ul include fotografiile referite în date.
