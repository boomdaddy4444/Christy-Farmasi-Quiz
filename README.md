# Christine Delgado Farmasi Training

A static, GitHub Pages–ready training platform for Farmasi product knowledge and sales technique quizzes.

## Deploy to GitHub Pages (boomdaddy4444)

1. Create (or use) a repo (example: `Christy-Farmasi-Quiz`).
2. Upload **all files and folders** from this ZIP to the repo root.
3. In GitHub: **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** (or master) / **root**
4. Save. Your site will publish at:
   `https://<username>.github.io/<repo>/`

## Data files

- `assets/data/catalog.json` — categories + product data
- `assets/data/quizzes.json` — quiz questions by category

### Update products
Edit `assets/data/catalog.json`.
Each product supports:
- `id` (use SKU if available)
- `sku`
- `name`
- `category` (skincare, makeup, nutrition, selfcare, haircare, men)
- `subcat`
- `size`, `price_usd`, `source_page`
- `hero_actives`, `highlights[]`, `notes`

### Update quizzes
Edit `assets/data/quizzes.json`.
Each quiz supports:
- `category`
- `skill` (`sales` or `product`)
- `prompt`
- `choices[]`
- `correctIndex`
- `explanation`
- `productRefs[]` (use product `id` values)

## SKU links
SKU pills in product cards link to the Farmasi product detail page:
`https://www.farmasius.com/christinedelgado/product-detail/...?...pid=<SKU>`

## Troubleshooting
- If you don't see new changes: hard refresh (**Ctrl/Cmd + Shift + R**)
- If categories don't load: confirm `assets/data/catalog.json` is accessible from the deployed URL.
- If quizzes are empty: confirm `assets/data/quizzes.json` has questions for that category.

## Repo structure
- `index.html` home
- `catalog.html` data links
- `category.html` category study page
- `quiz.html` quiz runner
- `progress.html` progress dashboard
- `assets/css/styles.css` styling
- `assets/js/app.js` app logic
- `assets/data/*.json` content
