# RED TATTOO
Site de prezentare pentru RED TATTOO by Cristi Nitu. HTML, CSS și JavaScript, fără framework și fără dependențe de instalat.

## Structură
- `index.html` — pagina principală, **în rădăcina repository-ului**.
- `styles.css` — design, responsive, animații și stări interactive.
- `app.js` — meniu mobil, navigare în pașii procesului, animații și progres la derulare.
- `assets/` — imagini WebP optimizate.
- `scripts/` — server local și pregătirea fișierelor pentru publicare.
- `.github/workflows/pages.yml` — publicare automată prin GitHub Actions.
- `.nojekyll` — compatibilitate cu publicarea statică GitHub Pages.
- `.openai/hosting.json` — identificatorul publicării private prin Sites; GitHub Pages nu depinde de acest fișier.

Toate referințele locale sunt relative. Site-ul funcționează atât la rădăcina unui domeniu, cât și sub `/nume-repository/`.

## Previzualizare
Deschide `index.html` direct în browser sau, cu Node.js 20+:
```sh
npm run dev
```
Adresa locală: http://127.0.0.1:5173. Nu este necesar `npm install`.

## Verificare și build
```sh
npm run check
npm run build
```
Build-ul copiază exclusiv fișierele publice în `dist/`. Acest director nu se comite; sursa rămâne în rădăcină.

## Commit și push în GitHub
Creează un repository gol în contul tău GitHub. Apoi rulează în acest folder, înlocuind `UTILIZATOR` și `REPOSITORY`:
```sh
git init
git add .
git commit -m "Build RED TATTOO website"
git branch -M main
git remote add origin https://github.com/UTILIZATOR/REPOSITORY.git
git push -u origin main
```
Dacă există deja un commit și nu sunt modificări, pasul `git commit` poate fi omis. Dacă ai deja un remote `origin`, verifică `git remote -v` și folosește repository-ul potrivit fără a suprascrie unul existent.

## GitHub Pages
Varianta automată: în repository, **Settings → Pages → Build and deployment → Source: GitHub Actions**. Workflow-ul inclus publică site-ul la fiecare push pe `main`; îl poți porni și manual din tabul Actions.

Alternativ, pentru publicarea directă din sursă, dezactivează workflow-ul Pages și alege **Deploy from a branch → main → / (root)**. `index.html` și `.nojekyll` sunt deja în locul potrivit.

[Documentație oficială GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## Conținut și personalizare
- Linkurile de Instagram și Facebook duc direct la conturile furnizate.
- Programările pornesc prin conversație pe paginile salonului. Nu există formular sau backend care să simuleze trimiterea unei rezervări.
- Fotografiile sunt imagini conceptuale generate pentru atmosfera site-ului, **nu lucrări reale realizate de Cristi Nitu**. Pagina semnalează acest lucru și direcționează către portofoliul real de pe Instagram.
- Stilurile prezentate sunt direcții de inspirație; detaliile proiectului se stabilesc cu artistul.
- Nu sunt publicate date de contact, prețuri, recenzii, certificări sau adrese neverificate.
- Fonturile Barlow Condensed și Manrope se încarcă din Google Fonts; sunt definite și fonturi de rezervă.
- Nu există analytics, formulare sau cookie-uri. O preferință locală opțională reține oprirea animației.
- Imaginile se înlocuiesc în `assets/`, iar textele și linkurile în `index.html`.

## Accesibilitate
Meniu cu stare ARIA și închidere cu Escape, acordeoane native, taburi cu săgeți/Home/End, focus vizibil, link de salt la conținut, texte alternative, animații care respectă `prefers-reduced-motion` și buton de pauză.
