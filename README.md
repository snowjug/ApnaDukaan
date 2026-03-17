# ApnaDukaan Inventory Management System (IMS)

A modern, full‑featured **Inventory Management System** designed specifically for **Kirana / Grocery Stores**, built with **React, TypeScript, and Supabase**. This application provides end‑to‑end tools for managing products, inventory, sales, suppliers, customers, and store operations efficiently.

---

## 🚀 Features

### Core Functionality

* **Dashboard** – Real‑time overview of sales, stock status, and key business metrics
* **Product Management** – Complete CRUD operations with SKU, barcode, category, batch, and expiry support
* **Inventory Tracking** – Real‑time stock monitoring, stock adjustments, and low‑stock alerts
* **Point of Sale (POS)** – Fast and intuitive billing interface with barcode scanning
* **Sales Management** – Track daily sales, transactions, and payment methods
* **Categories** – Organize products using structured categories

### Advanced Features

* **Supplier Management** – Manage suppliers, purchase orders, and supplier pricing
* **Customer Management** – Maintain customer profiles, purchase history, and custom pricing
* **User Management** – Role‑based access control (Admin, Manager, Staff, Viewer)
* **Audit Logs** – Full activity tracking for accountability and compliance
* **Reports & Analytics** – Sales, inventory, and financial reports
* **Stocktakes** – Physical inventory counting and reconciliation
* **User Profiles** – Personalized preferences and settings

### Technical Features

* **Authentication** – Secure authentication using Supabase Auth
* **Row Level Security (RLS)** – Database‑level security enforcement
* **Real‑time Updates** – Live synchronization across users
* **Responsive Design** – Optimized for desktop, tablet, and mobile
* **Dark Mode** – Theme customization
* **Barcode Support** – Integrated barcode and QR code scanning

---

## 🛠️ Technology Stack

### Frontend

* **React 18** – Modern component‑based UI
* **TypeScript** – Strong type safety
* **Vite** – Fast development and build tooling
* **React Router** – Client‑side routing
* **Redux Toolkit** – Global state management
* **TanStack Query** – Server‑state synchronization
* **Tailwind CSS** – Utility‑first styling
* **shadcn/ui** – Pre‑built, accessible UI components
* **Radix UI** – Headless, accessible primitives

### Backend

* **Supabase (BaaS)**

  * PostgreSQL database
  * Authentication
  * Row Level Security (RLS)
  * Real‑time subscriptions
  * File storage

### Key Libraries

* **React Hook Form** – Form handling and validation
* **Zod** – Schema‑based validation
* **Recharts** – Data visualization
* **Lucide React** – Icon library
* **date‑fns** – Date utilities
* **html5‑qrcode** – Barcode / QR scanning
* **jspdf‑autotable** – PDF report generation

---

## 📋 Prerequisites

* **Node.js** – v18 or higher
* **npm** or **bun** – Package manager
* **Supabase Account** – Backend services

---

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd kirana-store-ims
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables**

   Copy the example file:

   ```bash
   cp .env.example .env
   ```

   Update with your Supabase credentials:

   ```env
   VITE_SUPABASE_PROJECT_ID=your-project-id
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. **Set up Supabase**

   * Open your Supabase dashboard
   * Navigate to **SQL Editor**
   * Run all migration files from `supabase/migrations` in chronological order

---

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
# or
bun run dev
```

Application runs at:

```
http://localhost:5173
```

### Production Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
kirana-store-ims/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/         # shadcn/ui components
│   │   └── layout/     # Layout components
│   ├── hooks/          # Custom hooks
│   ├── integrations/   # External integrations
│   ├── lib/            # Utilities and helpers
│   ├── pages/          # Page‑level components
│   ├── store/          # Redux store and slices
│   ├── App.tsx         # Root component
│   └── main.tsx        # Entry point
├── supabase/
│   └── migrations/     # Database migrations
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 🗄️ Database Schema (Key Tables)

* **categories** – Product categorization
* **products** – Product catalog and pricing
* **stock_movements** – Inventory tracking
* **sales**, **sale_items** – Sales transactions
* **suppliers**, **supplier_products** – Supplier data
* **purchase_orders**, **purchase_order_items** – Procurement
* **customers**, **customer_pricing** – Customer management
* **profiles**, **user_roles** – User access control
* **stocktakes**, **stocktake_items** – Physical stock audits
* **audit_logs** – System activity logs

---

## 👥 User Roles

1. **Admin** – Full system control
2. **Manager** – Operational and reporting access
3. **Staff** – POS and inventory operations
4. **Viewer** – Read‑only access

---

## 🔐 Authentication & Security

* Supabase Email / Password authentication
* Protected routes
* Secure session handling
* Database‑level Row Level Security (RLS)

---

## 📱 Key Modules

### Dashboard

* Sales overview
* Low‑stock alerts
* Recent transactions
* KPIs

### Products & Inventory

* Product CRUD
* Batch & expiry tracking
* Stock adjustments
* Movement history

### POS (Billing)

* Barcode scanning
* Fast checkout
* Multiple payment methods
* Receipt generation

### Reports

* Sales reports
* Inventory valuation
* Financial summaries
* Export to PDF

### Suppliers & Customers

* Supplier management
* Purchase orders
* Customer history
* Custom pricing

---

## 🧪 Code Quality

* ESLint for linting
* TypeScript strict typing
* Consistent formatting

```bash
npm run lint
```

---

## 📝 License

This project is **private and proprietary**. Unauthorized use or distribution is prohibited.

Copyright Atharv.

---

## 🔄 Recent Updates

* Added batch and expiry tracking
* Improved stocktake workflow
* Enhanced audit logging
* User profile management
* Simplified to **single ApnaDukaan system**

---

## 🚧 Roadmap

* Advanced analytics dashboard
* Mobile application
* Barcode label printing
* Accounting software integration
* Multi‑currency support
* Advanced reporting

---

**ApnaDukaan IMS** – Built with React, TypeScript, and Supabase for modern retail management.
