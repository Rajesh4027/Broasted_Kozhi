# Broasted Kozhi — Billing Admin

React + Vite POS/billing admin panel for **Broasted Kozhi (BK)**.

## Features
- Collapsible admin sidebar (hamburger toggle) with category navigation
- Category → item selection with Normal / Nashville / Korean pricing tiers
- Live order cart with quantity controls, payment mode, customer name
- One-click invoice generation matching your printed bill format
- Print-isolated invoice (only the invoice prints, not the whole page)
- Save invoice as **PDF** (jsPDF + html2canvas)
- Export orders to **Excel** (SheetJS) — single invoice or full filtered list
- Recent Orders page with search, payment-mode, and date-range filters
- Brand colors pulled from your BK logo (red / gold / charcoal)
- Orders persist in the browser (localStorage) — no backend required

## Run it
```bash
npm install
npm run dev
```
Then open the printed local URL (usually http://localhost:5173).

## Build for production
```bash
npm run build
```
Output goes to `dist/` — deploy to Netlify/Vercel as usual.

## Notes
- Menu data lives in `src/data/menuData.js` — edit prices/items there.
- Store details (name, address, phone, FSSAI) are in the same file under `STORE_INFO`.
- Drop your logo PNG into `src/assets/logo.png` and `public/logo.png` if you want the
  actual logo image instead of the "Bk" badge (the badge was used since the logo file
  wasn't available in this build).
- To connect this to a real backend later, swap the `localStorage` calls in
  `src/context/BillingContext.jsx` for API calls — the rest of the UI won't need to change.
