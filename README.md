# Korziva — Full-Stack E-Commerce Platform

A production-minded, modular e-commerce web platform for small businesses built using a clean monorepo architecture.

---

## 🏗️ Architecture Overview

The repository is organized as an **npm workspaces** monorepo:

```
korziva/
├── apps/
│   ├── api/                    # Express.js REST API (Node.js + TypeScript)
│   │   ├── src/
│   │   │   ├── config/         # Environment variables validation (Zod)
│   │   │   ├── controllers/    # Route controllers
│   │   │   ├── middleware/     # Helmet, CORS, Rate Limit, Auth, CartSession, Error Handling
│   │   │   ├── routes/         # Modular REST endpoints (/api/health, /api/auth, /api/products, ...)
│   │   │   ├── services/       # Core business logic, transactional checkouts, payments
│   │   │   ├── utils/          # Standard response formatters & token generators
│   │   │   ├── app.ts          # Express application setup
│   │   │   └── index.ts        # Server entrypoint with graceful shutdown
│   │   ├── prisma/             # PostgreSQL Schema, Migrations, and Realistic Seeder
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── web/                    # Next.js 15 App Router Frontend (React 19 + Tailwind CSS)
│       ├── src/
│       │   ├── app/            # App Router pages and layouts (Storefront + Executive Dark Admin)
│       │   ├── components/     # High-polish UI components, Modals, Category Filters
│       │   ├── context/        # Auth and Cart state management
│       │   └── lib/            # HTTP API client for backend communication
│       ├── tailwind.config.ts
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       ├── .env.example
│       └── package.json
│
├── .gitignore                  # Monorepo ignore rules
├── package.json                # Root package.json managing workspaces
├── REQUIREMENTS.md             # Full platform specifications
└── README.md                   # Getting started & operational guide
```

---

## ⚙️ Ports and Services

| Application | Technology | Default Port | Health / Status Endpoint |
| :--- | :--- | :--- | :--- |
| **Storefront & Admin** (`apps/web`) | Next.js 15 App Router | `http://localhost:3000` | `/` |
| **REST API** (`apps/api`) | Express.js + TypeScript | `http://localhost:5000` | `/api/health` |

---

## 🚀 Getting Started

### 1. Install Dependencies
From the repository root:
```bash
npm install
```

### 2. Configure Environment Variables
- `apps/api/.env` (pre-configured for local PostgreSQL database)
- `apps/web/.env.local` (pre-configured with `NEXT_PUBLIC_API_URL=http://localhost:5000/api`)

### 3. Database Migration & Realistic Seed
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Both Applications Concurrently
```bash
npm run dev
```

Or run applications individually:
```bash
# Run Express API only
npm run dev:api

# Run Next.js Web Storefront only
npm run dev:web
```

---

## 🛠️ Monorepo Root Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs both API and Web concurrently |
| `npm run dev:api` | Runs API development server with hot-reload (`tsx watch`) |
| `npm run dev:web` | Runs Next.js development server on port 3000 |
| `npm run build` | Compiles both API (`tsc`) and Next.js frontend (`next build`) |
| `npm run build:api` | Builds API TypeScript to `apps/api/dist` |
| `npm run build:web` | Builds Next.js production bundle |
| `npm run test` | Runs automated unit and integration tests via Vitest across all test suites |
| `npm run db:migrate` | Runs Prisma database migrations |
| `npm run db:seed` | Populates database with sample products, categories, demo users, and orders |

---

## 📖 API Documentation & Swagger UI

Interactive OpenAPI 3.0 documentation is served directly from the Express backend:
- **Interactive UI**: `http://localhost:5000/api/docs/`
- **Raw OpenAPI Spec**: `apps/api/src/docs/openapi.json`

Covers all 26+ endpoints including authentication token rotation, product queries, cart management, atomic checkout, and admin metrics.

---

## 🛡️ Security Hardening

- **Input Validation**: Strict schema enforcement using Zod on every payload and query parameter.
- **Rate Limiting**: Rate limiter with standard RFC headers protecting public endpoints.
- **Security Headers**: Managed by `helmet` with CSP, HSTS, frameguard, and XSS filtering.
- **Decoupled Architecture**: Strict CORS restrictions allowing only configured client origins with credentials.
- **Session Protection**: `httpOnly`, `sameSite: "lax"`, and production-aware `secure` cookies for refresh tokens and guest carts.
- **Data Protection**: Stack traces and internal database errors are completely masked from clients in production.

---

## 🗺️ Implementation Stages Roadmap

- [x] **Stage 1**: Monorepo Scaffolding, Workspace Configuration, and Health Verification.
- [x] **Stage 2**: PostgreSQL & Prisma schema, migrations, seed realistic products & categories.
- [x] **Stage 3**: Authentication (Argon2id/bcrypt, JWT access & refresh tokens, cookies), Product catalog & storefront listing.
- [x] **Stage 4**: Shopping cart, persistent cart, checkout, transactional inventory management & orders.
- [x] **Stage 5**: Admin dashboard, role-based access, catalog & order management, metrics API.
- [x] **Stage 6**: Automated testing (unit & integration), OpenAPI/Swagger docs, security hardening, production deployment readiness.
