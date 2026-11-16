# One source of truth at the store counter

An interactive UX case study: Nykaa Retail POS, covering offers, exchanges and auto-replenishment for frontline retail teams.

It's a plain static site (HTML, CSS and vanilla JS) with no build step and no dependencies.

## What's interactive
- Scroll progress bar, sticky nav with scrollspy, reveal animations, animated stat counters
- Discovery toggle: *today's workaround* ↔ *what they actually need*
- Pain-point filter by stakeholder; principles accordion
- V1 vs V2 drag-to-compare slider (mouse, touch or keyboard)
- A live rebuild of the Offers & Discounts board: status tabs, quick filters, search, and design-note annotations
- Exchange flow stepper (click or use ← →) showing the shipped screens
- ARS upload simulator, with valid-file and format-error outcomes
- Concept switcher (phones, replenishment console, manager tablet)
- Automation flows that animate trigger → AI → human → outcome
- Click any screen to open it in a lightbox

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy
**Vercel**
1. Push this folder to a GitHub repo.
2. In Vercel, choose *Add New → Project*, import the repo, set *Framework preset: Other*, and leave the build command empty. Then deploy.
   Or run `npx vercel` from this folder.

**GitHub Pages**: Settings → Pages → Deploy from branch → `main` / root.

## Structure
```
index.html
assets/css/style.css
assets/js/main.js
assets/img/*.webp   # exported from the Figma file
vercel.json         # clean URLs + long cache for assets
```

## Editing
- Copy is in `index.html`. Data for the board, steps, concepts and flows is at the top of each block in `assets/js/main.js`.
- Brand tokens are CSS variables at the top of `style.css`. Pink `#F2007D` / `#FFEFF7` is for the case study chrome; teal `#2C9BB6` and the dark rail are for the Nykaa POS UI.
- Rows marked **No evidence** in the Impact table have no measured result; replace them if data becomes available.
