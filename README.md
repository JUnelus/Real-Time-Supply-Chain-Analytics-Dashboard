# 🚀 Supply Chain Intelligence Hub

**Real-time analytics dashboard for supply chain optimization with AI-powered insights**

**▶ Live demo: https://junelus.github.io/Real-Time-Supply-Chain-Analytics-Dashboard/**

![Dashboard Preview](https://img.shields.io/badge/Status-Live%20Demo-brightgreen)
![Technology](https://img.shields.io/badge/Tech-React%2019%2BVite%2BTailwind%2BRecharts-blue)
![Skills](https://img.shields.io/badge/Skills-Data%20Engineering%2BAI%2FML-purple)
![Daily CI](https://github.com/JUnelus/Real-Time-Supply-Chain-Analytics-Dashboard/actions/workflows/daily-dashboard-ci.yml/badge.svg)
![Deploy](https://github.com/JUnelus/Real-Time-Supply-Chain-Analytics-Dashboard/actions/workflows/deploy-pages.yml/badge.svg)

## 🎯 Skills Demonstrated

This project showcases key capabilities for **Client Success AI/Data Engineer** roles:

- ✅ **Client-Ready Dashboards** - Executive-level KPI tracking and business intelligence
- ✅ **Real-time Data Processing** – Live updates every 3 seconds with data quality monitoring
- ✅ **AI/ML Integration** – Demand forecasting, anomaly detection, route optimization
- ✅ **Supply Chain Analytics** – Warehouse utilization, inventory turnover, delivery performance
- ✅ **Data Visualization** – Interactive charts and responsive design for stakeholder reporting

## 🔧 Technology Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS 4 (via `@tailwindcss/vite`)
- **Data Visualization**: Recharts library for interactive charts
- **Real-time Processing**: State management with live data simulation
- **AI Features**: ML-driven insights with confidence scoring
- **Icons**: Lucide React for professional UI elements
- **Hosting**: GitHub Pages, deployed automatically from `main`

> **Note on data:** every metric, chart, and insight in the dashboard is generated client-side by a simulation layer.
> There is no backend or external API. The project demonstrates dashboard architecture, real-time state handling,
> and visualization design rather than a connection to a live supply chain system.

## 📊 Key Features

### **Real-time KPI Monitoring**
- Six critical supply chain metrics with trend analysis
- On-Time Delivery, Inventory Turnover, Order Accuracy
- Cost per Shipment, Warehouse Utilization, Customer Rating

### **AI-Powered Insights**
- Demand forecasting with ML predictions
- Route optimization recommendations
- Anomaly detection for supply chain disruptions
- Customer behavior analysis with NLP insights

### **Executive Reporting**
- Interactive charts (Area, Bar, Pie) for data visualization
- Real-time alerts with priority classification
- Performance trends over 24-hour periods
- Inventory analysis by product category

## 🚀 Quick Start

**Prerequisites**: Node.js 22.22+ (see `.nvmrc`) and npm. Vite 7 needs 22.12+, and the jsdom test environment needs 22.22+; Node 20 reached end of life in April 2026 and is not supported.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JUnelus/Real-Time-Supply-Chain-Analytics-Dashboard.git
   cd Real-Time-Supply-Chain-Analytics-Dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: Navigate to `http://localhost:5173`

## 🎨 Dashboard Features

- **Live Clock**: Real-time timestamp updates
- **Data Refresh**: Automatic updates every 3 seconds
- **Processing Indicator**: Visual feedback during data updates
- **Six Views**: Overview, Performance, Inventory, Shipments, AI Insights, Alerts (lazy-loaded per tab)
- **Professional Styling**: Dark theme with gradient accents

## 📸 Dashboard Screenshots

### Overview
![Overview](docs/screenshots/overview.png)

### Performance
![Performance](docs/screenshots/performance.png)

### Inventory
![Inventory](docs/screenshots/inventory.png)

### Shipments
![Shipments](docs/screenshots/shipments.png)

### AI Insights
![AI Insights](docs/screenshots/ai-insights.png)

### Alerts
![Alerts](docs/screenshots/alerts.png)

## 🤖 GitHub Actions Automation

### Daily Dashboard CI — `.github/workflows/daily-dashboard-ci.yml`
- Runs on every push, daily at `09:00 UTC`, and on demand via `workflow_dispatch`
- Steps: `npm ci`, `npm audit --omit=dev --audit-level=moderate` (production dependencies only), `npm run lint`, `npm test`, `npm run build`, then `npm run test:e2e` against the built bundle
- Dev-only tooling (ESLint, Vite, Playwright) is excluded from the audit gate so advisories against build helpers do not fail the scheduled run; Dependabot still opens PRs for them
- On an end-to-end failure the Playwright HTML report is uploaded as a workflow artifact

### Deploy to GitHub Pages — `.github/workflows/deploy-pages.yml`
- Runs on every push to `main` and on demand
- Builds the production bundle and publishes `dist/` to GitHub Pages
- Live at https://junelus.github.io/Real-Time-Supply-Chain-Analytics-Dashboard/

### Dependabot — `.github/dependabot.yml`
- Weekly npm dependency updates, monthly GitHub Actions updates
- `playwright` and `@playwright/test` are grouped so the test runner and browser driver are always bumped together

## 💼 Business Value

This dashboard demonstrates the ability to:

- Transform complex data engineering into business insights
- Create client-ready visualizations for executive reporting
- Implement AI-driven recommendations with confidence scoring
- Monitor supply chain performance with actionable alerts
- Bridge technical capabilities with measurable business outcomes

## 🎯 Perfect For

- **Data Engineer** portfolio projects
- **Client Success** role demonstrations
- **AI/ML Engineer** skill showcase
- **Business Intelligence** capability proof
- **Supply Chain Analytics** expertise display

## 🔗 Repository Structure

```
Real-Time-Supply-Chain-Analytics-Dashboard/
├── .github/
│   ├── dependabot.yml                  # Weekly npm / monthly Actions updates
│   └── workflows/
│       ├── daily-dashboard-ci.yml      # Audit, lint, build (push + daily schedule)
│       ├── deploy-pages.yml            # Build and publish to GitHub Pages
│       └── qodana_code_quality.yml     # JetBrains Qodana static analysis
├── docs/
│   └── screenshots/                    # README screenshots, one per dashboard tab
├── e2e/
│   └── smoke.spec.js                   # Playwright smoke test against the production build
├── public/                             # Static assets copied as-is into the build
├── scripts/
│   └── update-readme-screenshots.mjs   # Playwright script that regenerates screenshots
├── src/
│   ├── App.jsx                         # Shell: sidebar, top bar, refresh timer, tab routing
│   ├── App.test.jsx                    # Integration tests: navigation, alert count, dismissal
│   ├── main.jsx                        # React entry point
│   ├── index.css                       # Global styles and Tailwind import
│   ├── data/
│   │   ├── simulation.js               # Pure data generators behind every metric and alert
│   │   └── simulation.test.js          # Bounds, window rollover, alert generation
│   ├── test/
│   │   └── setup.js                    # Vitest setup: jest-dom matchers, ResizeObserver stub
│   └── views/
│       ├── OverviewView.jsx            # KPI cards, performance trend, shipment status, regions
│       ├── PerformanceView.jsx         # 24-hour performance analytics
│       ├── InventoryView.jsx           # Inventory by category
│       ├── ShipmentsView.jsx           # Shipment status and regional breakdown
│       ├── AIView.jsx                  # AI insight cards and model metrics
│       ├── AlertsView.jsx              # Priority-classified alerts with dismissal
│       ├── AlertsView.test.jsx         # Severity tiles, empty state, dismissal
│       ├── viewShared.jsx              # Shared cards, tooltip, section headers
│       └── viewShared.test.jsx         # KPICard, AlertItem, CustomTooltip, RegionRow
├── index.html                          # HTML template (Vite entry)
├── vite.config.js                      # Vite config: Pages base path for builds, Vitest settings
├── playwright.config.js                # Playwright config: builds and serves dist/ for e2e
├── eslint.config.js                    # ESLint flat config (React hooks + refresh rules)
├── package.json                        # Dependencies and scripts
└── README.md                           # Project documentation
```

## 📈 Data Features

- **Real-time Simulation**: Live data updates every 3 seconds
- **Multiple Data Types**: Performance metrics, inventory levels, shipment status
- **AI Insights**: Machine learning predictions with confidence scores
- **Alert System**: Priority-based notifications for supply chain events
- **Historical Trends**: 24-hour performance analysis

## 🛠️ Development

**Available Scripts**:
- `npm run dev` - Start development server
- `npm run build` - Build for production (output in `dist/`, base path set for GitHub Pages)
- `npm run preview` - Serve the production build locally at `http://127.0.0.1:4173/Real-Time-Supply-Chain-Analytics-Dashboard/`
- `npm run lint` - Run ESLint
- `npm test` - Run the Vitest unit and component suite once
- `npm run test:watch` - Run Vitest in watch mode
- `npm run test:e2e` - Build, serve, and run the Playwright smoke test against the production bundle
- `npm run screenshots:update` - Rebuild and capture fresh screenshots for each dashboard tab

### Testing

Two layers, both run in CI on every push and on the daily schedule:

- **Unit and component tests** (Vitest + React Testing Library, jsdom) cover the simulation layer in `src/data/simulation.js` (KPI drift and clamping, the 24-hour window rollover, alert generation bounds), the shared view components (KPI card formatting and trend colouring, alert dismissal, chart tooltip), the alerts view, and the app shell (sidebar navigation, lazy view loading, live alert count).
- **End-to-end smoke test** (Playwright, Chromium) builds the real production bundle, serves it under the GitHub Pages base path, and checks that every view opens, that no page or console errors occur, that dismissing an alert updates the sidebar badge, and that KPI trend badges stay stable between data refreshes.

```bash
npm test                              # unit + component
npx playwright install chromium       # first time only
npm run test:e2e                      # end-to-end
```

### Refresh README Screenshots

To regenerate `Overview`, `Performance`, `Inventory`, `Shipments`, `AI Insights`, and `Alerts` screenshots:

```bash
npm install
npx playwright install chromium
npm run screenshots:update
```

## 🎨 UI/UX Features

- **Dark Theme**: Professional gradient background
- **Responsive Grid**: KPI and insight cards reflow with viewport width
- **Interactive Charts**: Hover effects and tooltips
- **Loading States**: Visual feedback during processing
- **Color Coding**: Intuitive status indicators (green/red/yellow)
---

**Built to demonstrate Client Success AI/Data Engineering skills** • Ready for production deployment

*This project showcases the exact technical and client-facing skills needed for modern data engineering roles in supply chain and logistics.*
