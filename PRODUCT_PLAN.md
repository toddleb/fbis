# FBIS — Product Strategy & Research Plan

## From Prototype to World-Class Multi-Tenant Food Bank Platform

---

## 1. MARKET OPPORTUNITY

### Size
- **200 Feeding America member food banks** + 172 independent = ~372 total food banks in the US
- These supply **~60,000 food pantries, agencies, and meal programs**
- Top 300 food banks: **$18B gross revenue** (FY2024)
- **14% of US households** experience food insecurity
- Estimated TAM for food bank/pantry software: **$50M–$125M/year**

### The Gap No One Has Filled
- 62.3% of pantries still use **visual assessment** for inventory
- 48.5% use **paper/pencil**
- 49.2% track statistics on paper
- **No single platform** handles the full spectrum: warehouse ops + client intake + compliance + distribution + partner management + volunteer coordination + AI forecasting
- The #1 most desired feature (49.2% of pantries): **volunteer and staff scheduling** — treated as an afterthought by all competitors
- **34.6%** cite system integration as the biggest barrier to adoption

### Positioning
**Not** "food bank inventory system."
**Sell:** "Food Waste Elimination + Allocation Intelligence Platform for Hunger Relief"

---

## 2. COMPETITIVE LANDSCAPE

| Competitor | Target | Price | Core Strength | Fatal Weakness |
|---|---|---|---|---|
| **Ceres** (Dynamics NAV) | Large food banks (110+) | $20K–$100K+/yr est. | Full ERP, market leader | Expensive, legacy, no pantry features |
| **Link2Feed** | All sizes | $29–$49+/mo | TEFAP compliance, Feeding America preferred for SI | Limited inventory/warehouse, cost adds up |
| **PantrySoft** | Small-mid pantries | $50–$125/mo | Client self-service portal, transparent pricing | Add-on costs escalate, limited scale |
| **Oasis Insight** | All sizes | $20/user/mo | Feeding America recommended, affordable | Narrow feature set (intake/reporting only) |
| **Primarius P2** | Mid-large food banks | Tiered (opaque) | Deep warehouse ops, built-in accounting | Low awareness, Windows-based |
| **Plentiful** | Urban pantries | Free | Mobile reservations, 9 languages | Check-in only, NYC-focused |
| **Full** | All pantries | Freemium | Modern, mobile-first | Very new (Jan 2026), Oregon-focused |

### Where We Win
1. **Unified platform** — no cobbling together 3–5 tools
2. **Modern stack** — PWA, offline-first, tablet-native, not legacy .NET/Dynamics
3. **AI-native** — expiry prediction, demand forecasting, smart allocation built in (not bolted on)
4. **Multi-tenant from day one** — $45/mo infrastructure covers all tenants
5. **Price point** — undercut Ceres by 10x, match PantrySoft with 5x the features

---

## 3. KEY INTEGRATIONS & APIs

### Must-Have (Phase 1-2)

| Integration | System | Method | Purpose |
|---|---|---|---|
| **Product lookup** | Open Food Facts API | REST (free, no auth) | UPC scan → item data, nutrition |
| **Nutrition data** | USDA FoodData Central API | REST (free API key) | Meals equivalent, HER categorization |
| **Barcode scanning** | ZXing-js / Quagga2 | Browser camera API | Tablet/phone scanning at intake |
| **Routing** | Google Maps Route Optimization | REST ($250/mo free nonprofit credits) | Mobile distribution route planning |

### Should-Have (Phase 3-4)

| Integration | System | Method | Purpose |
|---|---|---|---|
| **Donation matching** | MealConnect API (Feeding America) | REST (Apiary docs) | Automated donation intake from retail |
| **CRM/Donors** | Salesforce | REST/AppExchange | Donor management, fundraising |
| **Analytics** | Feeding America Data Commons | REST (Google Data Commons) | Map the Meal Gap overlay |
| **Benefits enrollment** | State SNAP/WIC systems | Varies by state | Benefit screening at intake |
| **Partner ordering** | Custom Agency Portal | Built-in | Agency self-service ordering |

### Nice-to-Have (Phase 5+)

| Integration | System | Method | Purpose |
|---|---|---|---|
| **Cold chain** | IoT sensors (LoRaWAN) | MQTT/REST | Real-time temp monitoring |
| **GIS equity** | ArcGIS / Mapbox | REST | Coverage gap analysis |
| **Carbon tracking** | ReFED methodology | Calculated | Environmental impact reporting |
| **USDA commodities** | WBSCM (SAP) | Manual/export | TEFAP commodity reconciliation |

---

## 4. ARCHITECTURE

### Multi-Tenant SaaS Design

```
┌─────────────────────────────────────────────────────┐
│                    Vercel Edge ($20/mo)              │
│  Next.js 16 PWA + Service Worker + Offline Cache    │
├─────────────────────────────────────────────────────┤
│                   API Layer                         │
│  Server Actions / Route Handlers                    │
│  Tenant context from JWT claims                     │
├─────────────────────────────────────────────────────┤
│            Supabase ($25/mo shared)                 │
│  PostgreSQL + Row-Level Security (tenant_id)        │
│  Auth (email/magic link, SSO for enterprise)        │
│  Storage (donation photos, documents)               │
│  Realtime (live inventory updates across tablets)   │
├─────────────────────────────────────────────────────┤
│              Total: ~$45/mo all tenants             │
│  10 tenants = $4.50/ea | 100 tenants = $0.45/ea    │
└─────────────────────────────────────────────────────┘
```

### Database: Shared Schema + Row-Level Security
- Every table has `tenant_id` column
- PostgreSQL RLS policies enforce isolation at DB level (not app level)
- Even app bugs cannot leak data across tenants
- `tenant_id` stored as JWT custom claim, referenced in RLS policies
- Enterprise tier can upgrade to schema-per-tenant if needed

### Offline-First PWA for Tablets/Mobile
- **Service Worker** caches all static assets + recent data
- **IndexedDB** stores inventory, check-ins, distributions locally
- **Background Sync** pushes queued changes when connectivity returns
- **Camera-based barcode scanning** via ZXing-js (no hardware required)
- Works on consumer tablets (iPad, Android) — no ruggedized devices needed
- Training time target: **<5 minutes** for volunteers

### Cost Per Food Bank

| Scale | Infrastructure/bank | Suggested Price | Margin |
|---|---|---|---|
| 10 food banks | $4.50/mo | $49/mo | 91% |
| 50 food banks | $0.90/mo | $49/mo | 98% |
| 100 food banks | $0.45/mo | $29-49/mo | 98-99% |

---

## 5. PRODUCT ROADMAP

### Phase 1: Core Platform (Current → 4 weeks)
**Goal: Demoable product with real operational value**

- [x] Lot-based inventory with expiry tracking
- [x] Expiry risk dashboard
- [x] AI recommendation engine (rule-based)
- [x] Intake form
- [x] Actions execution flow
- [ ] Supabase backend (replace in-memory store)
- [ ] Auth (email/password + magic link)
- [ ] Multi-tenant data isolation (RLS)
- [ ] PWA manifest + service worker
- [ ] Responsive tablet layout

### Phase 2: Distribution & Compliance (Weeks 5-8)
**Goal: TEFAP-compliant distribution tracking**

- [ ] Distribution event management (pantry, mobile, drive-through)
- [ ] Client intake (household registration, eligibility)
- [ ] TEFAP reporting (commodity receipt, distribution, loss logs)
- [ ] Meals equivalent calculation (Feeding America: lbs / 1.2)
- [ ] HER nutrition categorization (Green/Yellow/Red)
- [ ] FEFO enforcement (auto-sort pick lists by expiration)
- [ ] Barcode scanning (camera-based, tablet-friendly)
- [ ] Basic volunteer shift scheduling

### Phase 3: Partner Network (Weeks 9-12)
**Goal: Food bank → partner agency workflow**

- [ ] Partner agency portal (request inventory, track allocations)
- [ ] Agency ordering system (allocation-based or free-order)
- [ ] Multi-location inventory visibility
- [ ] Transfer/movement tracking between locations
- [ ] Partner compliance monitoring dashboard
- [ ] Basic reporting suite (pounds distributed, meals served, waste %)

### Phase 4: Intelligence Layer (Weeks 13-16)
**Goal: AI differentiation**

- [ ] Demand forecasting (heuristic → ML)
- [ ] Donation pattern prediction
- [ ] Smart allocation engine (match inventory to highest-impact destination)
- [ ] Equity engine (geographic coverage analysis)
- [ ] Expiry prediction with proactive redistribution triggers
- [ ] Waste root cause analysis

### Phase 5: Ecosystem (Weeks 17-24)
**Goal: Integration-rich platform**

- [ ] MealConnect API integration (automated donation intake)
- [ ] Google Maps route optimization (mobile distribution routes)
- [ ] USDA FoodData Central (nutrition data)
- [ ] Open Food Facts (UPC → product data)
- [ ] Salesforce connector (donor CRM)
- [ ] Spanish language support (next-intl)
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Client choice portal (grocery-style shopping)
- [ ] Digital voucher support

### Phase 6: Scale & Compliance (Weeks 25+)
**Goal: Enterprise readiness**

- [ ] FSMA 204 traceability (lot-level, 24hr FDA response)
- [ ] Cold chain monitoring (IoT sensor integration)
- [ ] Recall management workflow
- [ ] Full audit trail (Spine-level logging)
- [ ] SOC 2 Type II preparation
- [ ] HIPAA-ready mode (healthcare partnerships)
- [ ] Carbon impact reporting
- [ ] Advanced analytics (Tableau/Metabase embed)

---

## 6. BUSINESS MODEL

### Pricing Tiers

| Tier | Price | Includes | Target |
|---|---|---|---|
| **Free** | $0 | 1 location, 500 households, basic inventory, basic reports | Small volunteer pantries |
| **Standard** | $29/mo | 3 locations, 2,500 households, TEFAP reports, barcode scanning, volunteer mgmt | Mid-size pantries |
| **Professional** | $79/mo | Unlimited locations, 10K households, full compliance, partner portal, AI recommendations | Regional food banks |
| **Enterprise** | Custom | Dedicated support, SSO, HIPAA, schema isolation, custom integrations | Large food banks (Ceres replacement) |

### Go-to-Market Strategy

1. **Land with free tier** — remove all adoption barriers for the 60K pantries
2. **Food bank network sales** — sell to a regional food bank, they push it to all partner agencies (Link2Feed's model)
3. **Grant-funded sponsorship** — partner with Walmart Foundation, Kroger, etc. to sponsor subscriptions for underserved pantries
4. **Feeding America alignment** — pursue "recommended" or "preferred" status for the network
5. **TechSoup distribution** — nonprofit discount/free tier validation

### Revenue Targets

| Year | Paying Tenants | ARR |
|---|---|---|
| Year 1 | 50 (Standard) | ~$17K |
| Year 2 | 200 (mix) | ~$100K |
| Year 3 | 1,000 (mix) | ~$500K |
| Year 5 | 5,000 (mix) | ~$2.5M |

---

## 7. COMPLIANCE REQUIREMENTS (NON-NEGOTIABLE)

| Requirement | Authority | What It Means |
|---|---|---|
| **TEFAP reporting** | USDA FNS | Commodity receipt, distribution, loss logs, FNS-667 via state |
| **FSMA 204 traceability** | FDA | Lot-level KDEs + CTEs, 24hr response, 24mo retention |
| **Civil rights compliance** | USDA | "And Justice for All" poster, complaint procedures, annual training |
| **Meals conversion** | Feeding America | 1.2 lbs = 1 meal (standard for all reporting) |
| **HER nutrition** | Healthy Eating Research | Green/Yellow/Red categorization by sat fat, sodium, added sugar |
| **Data privacy** | TEFAP regulations | 5-year retention, proper destruction, confidentiality |
| **WCAG 2.1 AA** | ADA Title II (Apr 2026 deadline) | Accessibility for govt-funded nonprofits |
| **Record retention** | 2 CFR 200 | 3 years from final expenditure report |
| **Single audit** | 2 CFR 200.501 | $750K threshold including commodity value |

---

## 8. TABLET & WAREHOUSE OPERATIONS

### Device Strategy
- **Primary:** Consumer tablets (iPad, Samsung Galaxy Tab) in protective cases
- **Optional:** Bluetooth barcode scanners ($30-80) for high-volume ops
- **Camera scanning:** ZXing-js for UPC via device camera (10-15 sec/item with AI assist)
- **Ruggedized:** Only for cold storage and mobile truck environments

### Volunteer-Optimized Workflows
- Role-based views: intake volunteer sees only intake, distribution sees only checkout
- <5 minute training target — UI must be self-explanatory
- Guided step-by-step workflows embedded in the app (not in training docs)
- Category-based storage grouping mirrors physical warehouse layout
- Large touch targets (44x44px min) for gloved hands
- High contrast mode for warehouse lighting conditions

### Offline-First Architecture
- Service Worker caches all UI + recent inventory data
- IndexedDB stores operations locally (check-ins, distributions, inventory changes)
- Background Sync pushes when connectivity returns
- Conflict resolution: last-write-wins (acceptable for food bank volumes)
- Critical for: mobile distribution units, rural pantries, warehouse dead zones

---

## 9. KEY DIFFERENTIATORS VS COMPETITION

| Capability | Ceres | Link2Feed | PantrySoft | **FBIS** |
|---|---|---|---|---|
| Lot-level inventory | ✓ | Partial | Partial | **✓** |
| FEFO enforcement | ✓ | ✗ | ✗ | **✓** |
| AI recommendations | ✗ | ✗ | ✗ | **✓** |
| Offline tablet PWA | ✗ | Partial | ✗ | **✓** |
| Multi-tenant SaaS | ✗ | ✓ | ✓ | **✓** |
| Client choice portal | ✗ | ✗ | ✓ | **Planned** |
| TEFAP compliance | ✓ | ✓ | ✓ | **Planned** |
| Partner agency portal | ✓ | ✓ | ✗ | **Planned** |
| Demand forecasting | ✗ | ✗ | ✗ | **Planned** |
| Free tier | ✗ | ✗ | ✓ | **✓** |
| Modern tech stack | ✗ (Dynamics) | ? | ? | **✓** (Next.js/Supabase) |
| Price (small pantry) | $20K+/yr | $348+/yr | $600+/yr | **$0–$348/yr** |

---

## 10. WHAT WINS THE ROOM (DEMO SCRIPT)

### For Food Bank Executives
1. Show dashboard → "1,800 lbs at risk, $10,800 in potential waste"
2. Click recommendation → "Move milk to Eastside Pantry"
3. Show meals saved counter update: **+4,800 meals**
4. Show equity map → "Eastside is 40% undersupplied"
5. Close: "We didn't just track inventory. We prevented waste and fed 4,800 more people."

### For Feeding America / Grant Funders
1. Show TEFAP reporting → auto-generated, compliant
2. Show network view → all partner agencies, real-time inventory
3. Show cost → "$29/month vs $20,000/year for Ceres"
4. Show HER nutrition tracking → Green/Yellow/Red at intake
5. Close: "Every food bank in your network could have this for the cost of one Ceres license."

### For Technology Funders (Walmart Foundation, Google.org)
1. Show AI layer → demand forecasting, smart allocation
2. Show scale → 100 food banks on $45/month infrastructure
3. Show offline tablet → works in a truck with no signal
4. Show open architecture → APIs, integrations, extensible
5. Close: "This is the infrastructure layer for eliminating food waste at scale."

---

## 11. REUSABLE PATTERNS FROM REGISTER/SUMMIT SLEEP DEMO

The REGISTER demo (Summit Sleep / Mattress Firm pitch) in `AICodeRally/demos` and `AICodeRally/aicr-rallies` contains tablet-first UX patterns that map directly to food bank warehouse + distribution operations.

### Source Repos
- `AICodeRally/demos` — `app/(demos)/register/`, `components/demos/register/`, `lib/swic-engine/`
- `AICodeRally/aicr-rallies` — `lib/swic-engine/`, `data/register/summit-sleep.ts`
- `AICodeRally/AICR_CIQ_Services` — Mattress Firm context docs

### Pattern Mapping

| REGISTER Pattern | Source | FBIS Adaptation |
|---|---|---|
| **Split-panel tablet layout** (catalog left, cart right) | `register/ops/pos-terminal/page.tsx` | Inventory catalog left, distribution ticket right |
| **TabletFrame** (CSS iPad Pro bezel wrapper) | `components/shell/parts/TabletFrame.tsx` | Demo presentation wrapper for warehouse tablet |
| **ShowroomCatalog** (category tabs + search + product grid) | `components/demos/register/pos/ShowroomCatalog.tsx` | Inventory browser with category filters + barcode search |
| **POSView cart** (items with qty controls + totals) | `components/swic/POSView.tsx` | Distribution ticket (items being given out) |
| **BundleBuilder** (compose product bundles) | `components/swic/tablet/BundleBuilder.tsx` | Family box composition (balanced nutrition categories) |
| **CloseSaleFlow** (multi-step checkout modal) | `components/swic/tablet/CloseSaleFlow.tsx` | Distribution checkout: scan → record → sync → complete |
| **Manager Console** (team monitoring + coaching + broadcast) | `register/ops/manager/page.tsx` | Warehouse coordinator: station monitoring + directives |
| **BroadcastChannel** (cross-device real-time sync) | `lib/register-broadcast.ts` | Warehouse manager ↔ distribution station sync |
| **SWIC calculation engine** (config-driven, pure function) | `lib/swic-engine/calculate.ts` | Allocation engine: config-driven distribution rules per food bank |
| **What-If simulation** (baseline vs projected deltas) | `lib/swic-engine/simulation/what-if.ts` | "What if we redistribute 500 lbs produce to Eastside?" |
| **ThemeProvider** (CSS vars, light/dark, font scaling) | `components/demos/register/ThemeProvider.tsx` | Per-tenant theming, accessibility font scaling |
| **D365 adapter** (bidirectional ERP transforms) | `lib/register-d365-adapter.ts` | Inventory system adapter layer |
| **FloorPulseStrip** (live event marquee) | `pos-terminal/page.tsx` | Live warehouse activity feed |

### Key Architecture Decisions from REGISTER

1. **Config-driven engine**: The SWIC engine uses a `ClientConfig` JSON object — no client-specific logic in the engine. Each food bank becomes a config. Replace `SaleItem` with `InventoryLot`, commission rules with allocation rules (weight-based, category-based, family-size-tiered).

2. **Two-device workflow**: Manager console + POS tablet communicate via `BroadcastChannel` API. For FBIS: warehouse coordinator tablet sends directives to distribution station tablets ("Redirect canned goods to Station 3").

3. **Touch-optimized design**: 44x44px minimum touch targets, `compact` prop on components, 2-column grids, large category pills, clear color-coded borders per category.

4. **Multi-step flows**: CloseSaleFlow auto-advances through processing → D365 sync → complete. For FBIS: intake scanning → lot creation → storage assignment → complete, or distribution checkout → inventory deduction → record → complete.

5. **Context insight**: Mattress Firm's existing tablet solution was deemed "inadequate" — the same pain point exists in food bank warehouse operations where volunteers use paper or spreadsheets.

### Implementation Priority

**Phase 1 (immediate)**: Port `TabletFrame`, adapt split-panel layout for intake/distribution
**Phase 2**: Adapt `ShowroomCatalog` → inventory browser, `POSView` → distribution ticket
**Phase 3**: Port `BroadcastChannel` sync, build coordinator console
**Phase 4**: Adapt SWIC engine → allocation engine with what-if simulation

---

## SOURCES

### Competitor Research
- Ceres/eSoftware: esopro.com/dynamics-solutions/ceres
- Link2Feed: link2feed.com (pricing, features, Feeding America partnership)
- PantrySoft: pantrysoft.com/pricing
- Oasis Insight: oasisinsight.net (Feeding America recommended)
- Primarius P2: goprimarius.com
- Plentiful: plentifulapp.com
- Full: Yahoo Finance launch announcement (Jan 2026)

### APIs & Data Standards
- MealConnect API: mealconnect.docs.apiary.io
- USDA FoodData Central: fdc.nal.usda.gov/api-guide
- Open Food Facts: world.openfoodfacts.org/data
- Kroger Developer: developer.kroger.com
- Google Maps (nonprofit credits): $250/mo free
- Link2Feed API: link2feed.atlassian.net developer manual

### Industry Standards
- Feeding America meals standard: 1.2 lbs = 1 meal
- HER Nutrition Guidelines: healthyeatingresearch.org
- FSMA 204: fda.gov/food/food-safety-modernization-act-fsma
- TEFAP reporting: fns.usda.gov/tefap
- WCAG 2.1 AA: ADA Title II deadline April 24, 2026

### Technology
- Supabase RLS multi-tenancy: supabase.com/docs/guides/database/postgres/row-level-security
- next-intl i18n: next-intl.dev
- ZXing-js barcode: github.com/nicyou (browser scanning)
- PWA offline patterns: IndexedDB + Service Worker + Background Sync

### Market Data
- 372 food banks nationally (Food Bank News)
- 60,000+ pantries/agencies (Feeding America)
- $18B gross revenue top 300 (Food Bank News FY2024)
- Johns Hopkins pantry survey: 297 pantries, 46 states (PMC/NIH)
- AI in food banking: PMC systematic review 2025
