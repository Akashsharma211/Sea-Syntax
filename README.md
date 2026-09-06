# 🌊 MarineMetrics — Sea & Syntax

> **Autonomous Ocean Intelligence & Telemetry Platform with Integrated Tally Prime ERP Accounting Engine**  
> *Developed by Team Sea & Syntax for the Smart India Hackathon (SIH).*

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Comprehensive Tech Stack Breakdown](#-comprehensive-tech-stack-breakdown)
  - [1. Core Framework & Runtime](#1-core-framework--runtime)
  - [2. Frontend & User Interface](#2-frontend--user-interface)
  - [3. Visual Effects & Canvas Engine](#3-visual-effects--canvas-engine)
  - [4. Backend, APIs & Serverless Runtime](#4-backend-apis--serverless-runtime)
  - [5. Database, ORM & Caching Architecture](#5-database-orm--caching-architecture)
  - [6. Client-Side Persistence & State Management](#6-client-side-persistence--state-management)
  - [7. Tooling, Configuration & Module Resolution](#7-tooling-configuration--module-resolution)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Project Directory Structure](#-project-directory-structure)
- [Core Application Modules](#-core-application-modules)
- [Environment Variables & Configuration](#-environment-variables--configuration)
- [Local Development Setup](#-local-development-setup)
- [Production Deployment](#-production-deployment)
- [Team & Credits](#-team--credits)

---

## 🌟 Overview

**MarineMetrics** is a hybrid platform uniting two major systems:
1. **Marine Intelligence & Telemetry Portal**: A bioluminescent, cyber-oceanic web experience highlighting ocean health analytics, real-time coastal telemetry, illegal fishing prevention, and microplastic tracking.
2. **Tally Prime ERP Accounting Engine**: A modern, high-fidelity browser implementation of Tally Prime's ERP interface for marine enterprises, complete with Gateway of Tally navigation, multi-voucher accounting (Sales, Purchase, Payment, Receipt, Journal, Contra), Day Book, Balance Sheet, Profit & Loss, Inventory Stock Summary, Ratio Analysis, and Ledger Statements.

---

## 🛠️ Comprehensive Tech Stack Breakdown

### 1. Core Framework & Runtime

| Technology | Version | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **Next.js** | `^14.2.5` | Full-stack React framework utilizing the **App Router** architecture (`/app` directory). Powers SSR, Client Components (`'use client'`), dynamic serverless API route handlers, and unified metadata management. |
| **Node.js** | `>=18.x` | Server-side JavaScript runtime powering local execution, Next.js build optimization, and serverless hosting environments. |
| **React** | `^18.3.1` | Declarative component-based UI library. Leverages React hooks (`useState`, `useEffect`, `useRef`, `useMemo`) for reactive state orchestration and real-time computation. |
| **React DOM** | `^18.3.1` | DOM renderer for React components across the browser client. |

---

### 2. Frontend & User Interface

| Technology / Pattern | Details & Role in Project |
| :--- | :--- |
| **Custom Vanilla CSS3 Design System** | Engineered with modern CSS custom properties (variables) across `app/globals.css` (~75 KB) and `styles.css` (~35 KB). Provides full design autonomy without heavy CSS framework runtime overhead. |
| **Bioluminescent Oceanic Aesthetic** | Custom color grading featuring deep abyssal tones (`#020710`, `#050c18`, `#0a192f`), neon cyan accents (`#00f0ff`), and emerald plankton highlights (`#00ffaa`). |
| **Glassmorphism & Cyber UI** | Utilizes CSS `backdrop-filter: blur()`, multi-layered glowing drop-shadows, scanline gradients, and semi-transparent dark borders (`rgba(0, 240, 255, 0.15)`). |
| **Tally Prime ERP Interface** | Accurate replication of Tally Prime's dual-panel ERP workstation: header quick-actions, Gateway menu tree with shortcut keys, split-pane accounting ledger registers, voucher tables, and modal overlay workflows. |
| **Responsive Grid & Flexbox Layouts** | Fluid multi-breakpoint layout adapting from desktop 4K/1080p monitors down to tablet and mobile screens. |
| **Embedded SVG Vector Icons** | Handcrafted, resolution-independent inline SVG iconography for zero network overhead and crisp rendering at any DPI. |

---

### 3. Visual Effects & Canvas Engine

| Technology / Component | File Location | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **HTML5 Canvas 2D Particle Engine** | [`components/OceanCanvas.jsx`](file:///c:/Users/ADMIN/Downloads/sea&syntax/components/OceanCanvas.jsx) & [`app.js`](file:///c:/Users/ADMIN/Downloads/sea&syntax/app.js) | Renders interactive floating plankton particles with harmonic sinusoidal motion, dynamic luminescence pulse angles, and ambient wave currents. Automatically recalibrates on window resize events. |
| **Harmonic Sinusoidal Wave Generator** | [`OceanCanvas.jsx`](file:///c:/Users/ADMIN/Downloads/sea&syntax/components/OceanCanvas.jsx) | Continuous multi-wave trigonometric calculation generating gentle coastal undulating wave aesthetics at 60 FPS using `requestAnimationFrame`. |

---

### 4. Backend, APIs & Serverless Runtime

| Technology / API Route | File Location | Method | Purpose & Implementation Details |
| :--- | :--- | :--- | :--- |
| **Next.js Serverless Route Handlers** | [`app/api/user/route.js`](file:///c:/Users/ADMIN/Downloads/sea&syntax/app/api/user/route.js) | `POST` | Accepts company onboarding registration payload, executes schema validation (Company Name, Address, GST, FSSAI, Phone), and writes record to MongoDB Atlas. |
| **Dynamic Data Retrieval** | [`app/api/user/route.js`](file:///c:/Users/ADMIN/Downloads/sea&syntax/app/api/user/route.js) | `GET` | Handles single company retrieval via `?id=` query parameter or lists all registered companies sorted by creation timestamp (`createdAt: -1`). |
| **Dynamic Route Configuration** | `app/api/user/route.js` | N/A | Decorated with `export const dynamic = 'force-dynamic'` to prevent stale cache returns on cloud edge networks. |

---

### 5. Database, ORM & Caching Architecture

| Technology | Version | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **MongoDB Atlas** | Cloud NoSQL | Scalable, document-based cloud database cluster storing company profiles, regulatory IDs, and financial configurations. |
| **Mongoose** | `^9.9.5` | ODM (Object Data Modeling) library providing schema definition, type safety, default attributes, and sanitization. |
| **Serverless Connection Caching** | [`lib/mongodb.js`](file:///c:/Users/ADMIN/Downloads/sea&syntax/lib/mongodb.js) | Employs a cached global mongoose singleton pattern (`global.mongoose = { conn, promise }`). Reuses active TCP connections across warm serverless function invocations on Vercel/AWS to avoid connection pool starvation. |
| **Data Models** | [`models/User.js`](file:///c:/Users/ADMIN/Downloads/sea&syntax/models/User.js) | Comprehensive schema supporting Company Name, Mailing Name, Address, State, Country, Pincode, Phone, GSTIN, FSSAI Number, Financial Year start, Books Beginning date, and Currency symbol. |

---

### 6. Client-Side Persistence & State Management

| Mechanism | Purpose & Implementation Details |
| :--- | :--- |
| **React Reactive State** | Local component state manages multi-tab navigation, modal dialogs, search queries, active vouchers, and ledger selections. |
| **HTML5 `localStorage` Cache** | Persists active company profile, transaction vouchers, ledger accounts, and stock inventory client-side to ensure zero data loss across page reloads and offline execution. |
| **Derived Financial Computation** | Dynamic real-time calculation of Gross Profit, Net Profit, Working Capital, Current Ratio, Debt-to-Equity, Cash Flows, and Ledger balances using `useMemo` hooks. |

---

### 7. Tooling, Configuration & Module Resolution

| File | Purpose |
| :--- | :--- |
| [`package.json`](file:///c:/Users/ADMIN/Downloads/sea&syntax/package.json) | NPM dependency manifest, project metadata, and lifecycle execution scripts (`dev`, `build`, `start`). |
| [`jsconfig.json`](file:///c:/Users/ADMIN/Downloads/sea&syntax/jsconfig.json) | Path alias configuration (`"@/*": ["./*"]`) enabling clean root-relative imports across the repository. |
| [`next.config.js`](file:///c:/Users/ADMIN/Downloads/sea&syntax/next.config.js) | Next.js configuration enabling `reactStrictMode: true` for development debugging and production optimization. |
| [`.env.example`](file:///c:/Users/ADMIN/Downloads/sea&syntax/.env.example) | Sanitized environment variable template specifying `MONGODB_URI` connection strings. |
| [`.gitignore`](file:///c:/Users/ADMIN/Downloads/sea&syntax/.gitignore) | Protects `.env`, `.env.local`, `.next/`, and `node_modules/` from being exposed in source control. |

---

## 🏗️ Architecture & Data Flow

```
                                  +---------------------------------------+
                                  |            CLIENT BROWSER             |
                                  +---------------------------------------+
                                    |                 |                 |
                   (HTML5 Canvas)   |                 |                 |  (Tally ERP & Forms)
                                    v                 |                 v
                         +--------------------+       |       +--------------------+
                         |  OceanCanvas 2D    |       |       |  Next.js 14 Client |
                         | Particle Animation |       |       | Components (React) |
                         +--------------------+       |       +--------------------+
                                                      |                 |
                                                      |                 | (localStorage Cache)
                                                      |                 v
                                                      |       +--------------------+
                                                      |       | Client-Side Store  |
                                                      |       | Vouchers & Masters |
                                                      |       +--------------------+
                                                      |                 |
                                                      | HTTP JSON       |
                                                      | Fetch Requests  |
                                                      v                 v
                                  +---------------------------------------+
                                  |     NEXT.JS SERVERLESS BACKEND        |
                                  |         (App Router API)              |
                                  +---------------------------------------+
                                                      |
                                                      |  /api/user [GET, POST]
                                                      v
                                  +---------------------------------------+
                                  |    lib/mongodb.js Connection Cache    |
                                  |     (global.mongoose Singleton)       |
                                  +---------------------------------------+
                                                      |
                                                      | Mongoose 9.9.5 ODM
                                                      v
                                  +---------------------------------------+
                                  |             MONGODB ATLAS             |
                                  |           (Cloud Database)            |
                                  +---------------------------------------+
```

---

## 📁 Project Directory Structure

```plaintext
sea&syntax/
├── app/                              # Next.js 14 App Router Directory
│   ├── api/                          # Serverless Backend API Routes
│   │   └── user/
│   │       └── route.js              # GET & POST endpoints for Company & User records
│   ├── create/                       # Company Creation & Master Setup Route
│   │   └── page.js                   # Form with validation (GST, FSSAI, Phone) & MongoDB sync
│   ├── dashboard/                    # Full Tally Prime ERP Web Application
│   │   └── page.js                   # Gateway of Tally, Vouchers, Masters, Reports, Day Book
│   ├── globals.css                   # Main application design system & CSS variables (75 KB)
│   ├── layout.js                     # Root layout with SEO metadata & dynamic SVG favicon
│   └── page.js                       # Home landing page assembling portal sections
├── assets/                           # Media & static imagery assets
│   └── hero_marine_telemetry.jpg     # Marine telemetry visual asset
├── components/                       # Reusable React UI Components
│   ├── Footer.jsx                    # MarineMetrics branding & team credits footer
│   ├── HeroSection.jsx               # Hero banner with telemetry metrics & CTA
│   ├── HowItWorksSection.jsx         # Architecture & telemetry process steps
│   ├── Navbar.jsx                    # Sticky navigation bar with blur effect
│   ├── OceanCanvas.jsx               # Interactive bioluminescent plankton canvas
│   ├── ProblemSection.jsx            # SIH problem statement breakdown
│   ├── SolutionSection.jsx           # AI/IoT solutions overview
│   └── TeamSection.jsx               # Team Sea & Syntax members showcase
├── lib/                              # Server-side utility modules
│   └── mongodb.js                    # MongoDB Atlas connection pooling & cache singleton
├── models/                           # Mongoose database schemas & models
│   └── User.js                       # User & Company registration schema
├── public/                           # Static assets served at root
│   └── assets/
├── .env.example                      # Environment variables template
├── DEPLOYMENT.md                     # Production deployment guide (Vercel, Render, Railway)
├── index.html                        # Standalone static prototype frontend
├── app.js                            # Standalone client-side script & simulation logic
├── styles.css                        # Standalone static stylesheet (35 KB)
├── jsconfig.json                     # Path aliasing configuration (@/*)
├── next.config.js                    # Next.js framework configuration
├── package.json                      # Project dependencies & scripts
└── README.md                         # Detailed project & tech stack documentation
```

---

## 🚀 Core Application Modules

### 1. Public Ocean Intelligence Portal (`/`)
- **Interactive Marine Canvas**: Canvas 2D background rendering plankton particles and tidal wave simulation.
- **Mission Statement**: Ocean intelligence tackling illegal fishing, coastal microplastics, and telemetry monitoring.
- **Instant Launch**: Direct navigation gateway into company setup and ERP operations.

### 2. Company Setup & Master Registration (`/create`)
- **Statutory Compliances**: Inputs and sanitization for **GSTIN** and **FSSAI** numbers.
- **Dual Mode**: Register a new enterprise or inspect existing companies fetched directly from MongoDB Atlas.
- **Tally Acceptance Dialogue**: Realistic "Accept? (Yes/No)" confirmation prompt mirroring ERP operations.

### 3. Tally Prime ERP Workstation (`/dashboard`)
- **Gateway of Tally**: Keyboard-navigable menu tree (Masters, Transactions, Utilities, Reports).
- **Accounting Vouchers**: Creation and filtering for Sales (`INV`), Purchase (`PUR`), Payment, Receipt, Journal, and Contra vouchers.
- **Financial Statements**: Real-time calculated **Balance Sheet** and **Profit & Loss Account** with automatic balance matching.
- **Inventory & Stock Summary**: Real-time stock registers with unit quantities, valuation rates, and closing balances.
- **Ratio Analysis**: Live computation of Working Capital, Current Ratio, Quick Ratio, and Gross Margin.
- **Ledger Statements & Day Book**: Transaction audit trails with running Dr/Cr debit and credit balances.

---

## ⚙️ Environment Variables & Configuration

Create a `.env` or `.env.local` file in the root directory:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js** (v18.17.0 or newer recommended)
- **NPM** (v9 or newer) or **Yarn** / **PNPM**
- Active **MongoDB Atlas** cluster connection string

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Akashsharma211/Sea-Syntax.git
   cd "sea&syntax"
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   # Update MONGODB_URI with your MongoDB Atlas credentials
   ```

4. **Start the Next.js local development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the portal.
   - Landing Page: `http://localhost:3000`
   - Company Registration: `http://localhost:3000/create`
   - Tally Prime ERP Dashboard: `http://localhost:3000/dashboard`

---

## 🚢 Production Deployment

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub / GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Set the Environment Variable `MONGODB_URI` in the Vercel dashboard.
4. Click **Deploy**. Vercel will build and serve the application globally on edge nodes.

### Deploy to Node.js / Docker Host (Render, Railway, AWS EC2)
1. Build the production output:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

*(For detailed production instructions, see [DEPLOYMENT.md](file:///c:/Users/ADMIN/Downloads/sea&syntax/DEPLOYMENT.md).)*

---

## 👥 Team & Credits

**Developed by Team Sea & Syntax**  
*Built for the Smart India Hackathon (SIH).*
