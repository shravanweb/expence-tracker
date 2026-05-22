# SEO & Google Ads — Expense - Tracker

## 1. Environment variables (Vercel + local `.env`)

```env
VITE_SITE_URL=https://your-domain.vercel.app
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX
```

- **VITE_SITE_URL** — Your live site URL (canonical links, sitemap).
- **VITE_GA_MEASUREMENT_ID** — Google Analytics 4 property ID.
- **VITE_GOOGLE_ADS_ID** — Google Ads conversion tag ID (optional, starts with `AW-`).

Redeploy after adding variables on Vercel.

---

## 2. Google Search Console (SEO)

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property → **URL prefix** → your Vercel URL
3. Verify ownership (HTML tag or DNS — Vercel DNS easiest if custom domain)
4. Submit sitemap: `https://your-site.vercel.app/sitemap.xml`
5. Request indexing for home page `/`

---

## 3. Google Analytics 4

1. [analytics.google.com](https://analytics.google.com) → Create property
2. Web stream → copy **Measurement ID** (`G-...`)
3. Add to Vercel as `VITE_GA_MEASUREMENT_ID`
4. Redeploy — page views track automatically

---

## 4. Google Ads

1. [ads.google.com](https://ads.google.com) → New campaign
2. Goal: **Website traffic** or **Leads**
3. Landing page: `https://your-site.vercel.app/` or `/signup`
4. Keywords (examples):
   - expense tracker
   - money tracker app
   - personal finance tracker india
   - monthly budget app
5. Link Google Ads to Analytics (Tools → Linked accounts)

### Conversion tracking (signup)

1. Google Ads → **Goals** → Conversions → New
2. Website → use same `gtag` as `VITE_GOOGLE_ADS_ID`
3. After deploy, fire conversion on signup success (optional code event)

---

## 5. Update sitemap if domain changes

Edit `public/sitemap.xml` and `public/robots.txt` with your real domain, or set `VITE_SITE_URL` and regenerate sitemap manually.

---

## 6. What is already in the app

- Meta title, description, keywords per page
- Open Graph + Twitter cards
- Canonical URLs
- `robots.txt` + `sitemap.xml`
- JSON-LD (WebSite, App, FAQ) on home page
- Dashboard blocked from indexing (`noindex`)
- GA4 / Ads script when env IDs are set

---

**Author:** Shravan Rasamalla · © 2026
