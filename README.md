# Expense Tracker

A free personal finance web app to track monthly salary, income, expenses, and balance — built for India (INR). Sign up, log transactions by category, browse previous months, and export reports.

**Live site:** [shravanweb-expence-tracker.vercel.app](https://shravanweb-expence-tracker.vercel.app)

## Features

- **Dashboard** — credits, debits, net balance, and monthly charts
- **Transactions** — add income/expense entries with categories
- **Month history** — switch between months to review past spending
- **Import / export** — CSV import, CSV export, and PDF monthly reports
- **Auth** — Firebase email signup & login with email verification
- **UI** — responsive layout, dark mode, toast notifications

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [TanStack Start](https://tanstack.com/start) & [TanStack Router](https://tanstack.com/router)
- [Vite](https://vite.dev) + [Tailwind CSS 4](https://tailwindcss.com)
- [Firebase](https://firebase.google.com) (Auth + Firestore)
- [Recharts](https://recharts.org) for charts
- Deployed on [Vercel](https://vercel.com) with Analytics & Speed Insights

## Getting started

**Requirements:** Node.js `>=22.12.0`, npm

```bash
git clone https://github.com/shravanweb/expence-tracker.git
cd expence-tracker
npm install
cp .env.example .env
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

## Environment variables

Copy `.env.example` to `.env` and fill in your Firebase config:

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_*` | Firebase project credentials |
| `VITE_SITE_URL` | Public site URL (SEO) |
| `VITE_GA_MEASUREMENT_ID` | Optional Google Analytics ID |
| `VITE_GOOGLE_ADS_ID` | Optional Google Ads ID |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## License

Private project.
