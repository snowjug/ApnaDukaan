# ApnaDukaan

Fast, modern inventory and retail operations platform for neighborhood stores.

ApnaDukaan helps you run daily store workflows from one place: products, stock, sales, suppliers, customers, branches, reports, and audit trails.

## Why This Project

Most small-store software is either too basic or too heavy.
ApnaDukaan is built to be practical:

- Fast POS and billing flows
- Reliable stock visibility and movement tracking
- Role-based control for teams
- Supabase-backed data with secure access policies
- Clean React UI that works across desktop and tablet sizes

## Core Modules

- Dashboard: KPIs, trends, low-stock signals, recent activity
- POS: product search, barcode input, cart, checkout, receipt generation
- Inventory: stock movements, stocktakes, expiry and reorder visibility
- Products & Categories: structured catalog management with pricing
- Sales: transaction records and sales views
- Suppliers: purchase orders and supplier-product relationships
- Customers: customer history and custom pricing flows
- Branches: multi-branch inventory transfer and branch-level views
- User Management: role-based access and profile management
- Reports: sales and performance snapshots for decision-making
- Audit Logs: action history for accountability and debugging

## Tech Stack

- Frontend: React 18, TypeScript, Vite
- State/Data: Redux Toolkit, TanStack Query
- UI: Tailwind CSS, shadcn/ui, Radix UI
- Backend: Supabase (PostgreSQL, Auth, RLS, Realtime)
- Validation/Forms: Zod, React Hook Form
- Charts/Utilities: Recharts, date-fns, html5-qrcode

## Quick Start

### 1. Prerequisites

- Node.js 18+
- npm (or bun)
- A Supabase project

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file (or copy from `.env.example`) and set:

```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 4. Apply Database Migrations

Run SQL files from `supabase/migrations` in order using Supabase SQL Editor.

### 5. Start Development Server

```bash
npm run dev
```

### 6. Default Credentials

- Email: admin@gmail.com
- Password: admin123

Vite may auto-pick the next free port.
If `3000` is busy, it can move to `3001`, `3002`, etc.

## Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run build:dev  # Development-mode build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Project Structure

```text
src/
  components/      Reusable UI and domain components
  hooks/           Data and behavior hooks
  integrations/    External integrations (Supabase)
  lib/             Utilities
  pages/           Route-level pages
  store/           Redux store and slices
supabase/
  migrations/      SQL schema and policy migrations
public/            Static assets
```

## Security & Access

- Supabase Auth for identity
- Protected routes in the frontend
- Row Level Security (RLS) in database
- Role-based feature access (Admin, Manager, Staff, Viewer)

## Troubleshooting

### App not opening locally

- Start server with:

```bash
npm run dev
```

- Open the exact URL printed in terminal (for example `http://localhost:3004/`).
- If dependencies are broken on Windows:

```bash
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### Port already in use

Stop old dev servers or run on a fixed port:

```bash
npm run dev -- --host --port 3004
```

## Deployment

This project is compatible with Vercel and Netlify configurations included in the repository.

## License

Private and proprietary.
Unauthorized use or distribution is prohibited.

Copyright Atharv.
