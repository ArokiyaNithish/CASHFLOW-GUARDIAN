# CashFlow Guardian — UI Implementation Plan
**Visual Identity: Earthbound Fintech**
> *"A serious financial operating system with an intelligent guardian inside it."*

---

## 1. Design Philosophy

### Product Personality
**Bloomberg + modern accounting software + AI operations center — with a warmer, cleaner personality.**

| ❌ AVOID | ✅ DO INSTEAD |
|---|---|
| Generic purple AI dashboard | Professional financial control room |
| Huge "Chat with AI" box | Contextual "Ask Guardian" panel |
| Screaming "AI" everywhere | Real financial terminology |
| Neon colors / glassmorphism | Flat, sophisticated warm surfaces |
| Navy / dark blue (generic banking) | Earthbound warm palette |
| 4-card grid layouts | Asymmetric, editorial layouts |
| Heavy shadows on every card | Thin borders, generous whitespace |

### Core UI Principle
The UI must tell a sequential story:
```
Normal day       → "Your business is healthy."
Problem detected → "A cash crisis is likely in 17 days."
Investigation    → "Here's why."
Reasoning        → "Here are your options."
Decision         → "Here's what I recommend."
Human approval   → "You remain in control."
Action           → "The plan was executed."
Result           → "Deficit changed from -₹1.4L to +₹3.1L."
```

---

## 2. Design System

### 2.1 Color Palette

```css
:root {
  /* ── BASE ────────────────────────────────── */
  --color-bg:           #F7F3EC;  /* Warm ivory — main background */
  --color-surface:      #FFFDF8;  /* Soft cream — cards / panels */
  --color-border:       #E8E2D9;  /* Warm light border */
  --color-border-muted: #F0EBE3;  /* Very subtle divider */

  /* ── TEXT ────────────────────────────────── */
  --color-text-primary:   #242321;  /* Charcoal — headings, numbers */
  --color-text-secondary: #77736C;  /* Warm gray — labels, captions */
  --color-text-muted:     #A89F96;  /* Muted — placeholders */

  /* ── FINANCIAL STATUS ────────────────────── */
  --color-healthy:        #4F7D62;  /* Forest green — positive cash */
  --color-healthy-bg:     #EDF4F0;  /* Green tint background */
  --color-attention:      #D39A3D;  /* Warm amber — watch / caution */
  --color-attention-bg:   #FBF3E3;  /* Amber tint background */
  --color-critical:       #C85C4A;  /* Muted coral — deficit / danger */
  --color-critical-bg:    #FAE9E7;  /* Coral tint background */

  /* ── GUARDIAN (SIGNATURE COLOR) ──────────── */
  --color-guardian:       #B8663F;  /* Terracotta — agent actions */
  --color-guardian-bg:    #F7EDE5;  /* Terracotta tint background */
  --color-guardian-dark:  #9A5232;  /* Pressed / active state */

  /* ── NAVIGATION ──────────────────────────── */
  --color-nav-bg:         #1E1C1A;  /* Near black — sidebar */
  --color-nav-text:       #C8C2BA;  /* Warm light — nav items */
  --color-nav-active:     #FFFDF8;  /* Active nav item text */
  --color-nav-accent:     #B8663F;  /* Active indicator */
}
```

### Financial Status Meaning
| Color | Hex | Usage |
|---|---|---|
| 🟢 Forest Green | `#4F7D62` | Healthy cash, positive forecast, paid invoices |
| 🟡 Warm Amber | `#D39A3D` | Attention required, moderate risk |
| 🟠 Terracotta | `#B8663F` | Guardian actions, recommendations, AI-driven |
| 🔴 Muted Coral | `#C85C4A` | Cash deficit, overdue, critical risk |

### 2.2 Typography

```css
/* Google Fonts / local import */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root {
  /* ── FONT FAMILIES ───────────────────────── */
  --font-ui:     'Geist', 'Inter', system-ui, sans-serif;
  --font-mono:   'IBM Plex Mono', 'Fira Code', monospace;

  /* ── SCALE ───────────────────────────────── */
  --text-xs:    0.75rem;   /* 12px — micro labels */
  --text-sm:    0.875rem;  /* 14px — captions, table data */
  --text-base:  1rem;      /* 16px — body text */
  --text-lg:    1.125rem;  /* 18px — section subtitles */
  --text-xl:    1.25rem;   /* 20px — card titles */
  --text-2xl:   1.5rem;    /* 24px — panel headings */
  --text-3xl:   1.875rem;  /* 30px — page headings */
  --text-4xl:   2.25rem;   /* 36px — KPI numbers */
  --text-5xl:   3rem;      /* 48px — hero financial numbers */
  --text-7xl:   4.5rem;    /* 72px — Health Ring center number */
}
```

**Typography Rules:**
- **All financial numbers** (₹ amounts, risk %, days) → `font-mono` weight 500–600
- **Navigation, labels, body** → `font-ui` weight 400
- **Card titles, headings** → `font-ui` weight 600
- **Section labels (ALL CAPS)** → `font-ui` weight 500, `letter-spacing: 0.08em`, `font-size: text-xs`

### 2.3 Spacing System

```css
:root {
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  /* ── CARD STYLES ──────────────────────────── */
  --card-padding:  var(--space-6);
  --card-radius:   12px;
  --card-border:   1px solid var(--color-border);
  --card-shadow:   none;              /* no heavy shadows */

  /* ── LAYOUT ───────────────────────────────── */
  --sidebar-width: 220px;
  --content-max:   1280px;
}
```

### 2.4 Component Base Styles

```css
/* Card */
.card {
  background: var(--color-surface);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
}

/* Section Label (e.g. "CASH FLOW FORECAST") */
.section-label {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* Financial Number */
.financial-number {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Status Badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.04em;
}
.badge--healthy   { background: var(--color-healthy-bg);   color: var(--color-healthy); }
.badge--attention { background: var(--color-attention-bg); color: var(--color-attention); }
.badge--critical  { background: var(--color-critical-bg);  color: var(--color-critical); }
.badge--guardian  { background: var(--color-guardian-bg);  color: var(--color-guardian); }

/* Primary Button (Terracotta) */
.btn-primary {
  background: var(--color-guardian);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-family: var(--font-ui);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover { background: var(--color-guardian-dark); }

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.btn-secondary:hover { background: var(--color-bg); border-color: var(--color-text-secondary); }

/* Danger Button */
.btn-danger {
  background: transparent;
  color: var(--color-critical);
  border: 1px solid var(--color-critical);
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
}
```

---

## 3. Layout System

### 3.1 App Shell

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (220px, dark charcoal)  │  MAIN CONTENT AREA       │
│                                   │  (flex-1, warm ivory bg) │
│  Logo                             │                          │
│  Company Name                     │  Top Bar (company name,  │
│  ─────────────                    │  user avatar, notifs)    │
│  ◉ Overview          ←active     │  ─────────────────────   │
│  ◌ Cash Flow                      │                          │
│  ◌ Receivables                    │  PAGE CONTENT            │
│  ◌ Payables                       │  max-width: 1280px       │
│  ──────────────                   │  padding: 32px           │
│  ✦ Guardian                       │                          │
│  ◌ Scenario Lab                   │                          │
│  ◌ Action Center                  │                          │
│  ──────────────                   │                          │
│  ◌ Reports                        │                          │
│  ──────────────                   │                          │
│  ⚙ Settings                       │                          │
│  👤 Profile                       │                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar Component (`Sidebar.tsx`)

```tsx
// Color tokens for dark sidebar
const sidebarStyles = {
  bg:           '#1E1C1A',
  text:         '#C8C2BA',
  activeText:   '#FFFDF8',
  activeBg:     'rgba(184,102,63,0.15)',
  activeBar:    '#B8663F',   // left border on active item
  guardianText: '#B8663F',   // ✦ Guardian always terracotta
}

// Nav items
const navItems = [
  { icon: 'LayoutDashboard', label: 'Overview',      path: '/dashboard' },
  { icon: 'TrendingUp',      label: 'Cash Flow',     path: '/cashflow' },
  { icon: 'Receipt',         label: 'Receivables',   path: '/receivables' },
  { icon: 'CreditCard',      label: 'Payables',      path: '/payables' },
  // divider
  { icon: 'Shield',          label: 'Guardian',      path: '/guardian',  special: true },
  { icon: 'FlaskConical',    label: 'Scenario Lab',  path: '/simulator' },
  { icon: 'Zap',             label: 'Action Center', path: '/actions' },
  // divider
  { icon: 'FileText',        label: 'Reports',       path: '/reports' },
]
```

---

## 4. Screen-by-Screen Implementation

---

### Screen 1 — Login Page (`Login.tsx`)

**Layout:** Full-screen split — left: brand panel (terracotta/charcoal), right: form

```
┌──────────────────────┬───────────────────────────────────┐
│                      │                                   │
│  CG                  │  Welcome back                     │
│                      │                                   │
│  CASHFLOW            │  Sign in to your financial        │
│  GUARDIAN            │  control center                   │
│                      │                                   │
│  Financial           │  ┌─────────────────────────────┐  │
│  Early-Warning       │  │  Email address               │  │
│  & Rescue Agent      │  └─────────────────────────────┘  │
│                      │                                   │
│  ─────────────────   │  ┌─────────────────────────────┐  │
│                      │  │  Password            [show]  │  │
│  "Detect. Predict.   │  └─────────────────────────────┘  │
│   Prevent."          │                                   │
│                      │  [ Sign in → ]                    │
│                      │                                   │
│                      │  New to Guardian? Register        │
└──────────────────────┴───────────────────────────────────┘
```

**Styling:**
- Left panel: `background: #1E1C1A`, logo in terracotta `#B8663F`
- Right panel: `background: #F7F3EC`
- Input fields: `border: 1px solid #E8E2D9`, focus ring in terracotta
- CTA button: terracotta `#B8663F`

---

### Screen 2 — Onboarding (`Onboarding.tsx`)

**Steps (progress indicator at top):**
```
① Company Setup → ② Upload Data → ③ Review Twin → ④ Done
```

**Step 1 — Company Details:**
- Company name, industry selector, GST number (optional)
- Safety reserve amount: `₹ [_______]` with explanation tooltip

**Step 2 — Upload Data (CSV ingestion):**
```
┌──────────────────────────────────────────────────────────┐
│  Upload your financial data                              │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ Transactions│  │  Invoices  │  │  Customers │         │
│  │  [Upload]  │  │  [Upload]  │  │  [Upload]  │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Suppliers │  │   Payables │  │    Loans   │         │
│  │  [Upload]  │  │  [Upload]  │  │  [Upload]  │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│                                                          │
│  Or use demo data →  [ Load ABC Precision Demo ]         │
└──────────────────────────────────────────────────────────┘
```

**Step 3 — Financial Digital Twin Preview:**
- Animated ring showing health being computed
- "Guardian is building your Financial Digital Twin..."
- Shows: cash detected, receivables found, obligations mapped

---

### Screen 3 — Executive Dashboard (`Dashboard.tsx`)

**Layout (asymmetric — not 4-card grid):**

```
┌──────────────────────────────────────────────────────────────┐
│  Good morning, Arun          [Financial Weather: ⚠ CAUTION]  │
│  ABC Manufacturing                                           │
├─────────────────┬────────────────────────────────────────────┤
│                 │                                            │
│  FINANCIAL      │  CASH RUNWAY                               │
│  HEALTH         │                                            │
│                 │  ₹8L ─────────────────────────────────     │
│  ╭───────────╮  │  ₹6L ──────────╮                           │
│  │    72     │  │  ₹4L           ╰────────╮                  │
│  │  HEALTHY  │  │  ₹2L                    ╲                  │
│  ╰───────────╯  │  ₹0L ────────────────────⚠─────           │
│                 │       Today              Day 17    30d     │
│  Liquidity  81  │                                            │
│  ████████░░     │  Expected  ━━━━  Best ╌╌╌  Worst ─ ─ ─    │
│                 │                                            │
│  Receivables 64 │                                            │
│  ██████░░░░     │                                            │
│                 │                                            │
│  Obligations 71 │                                            │
│  ███████░░░     │                                            │
│                 │                                            │
├─────────────────┴────────────────────────────────────────────┤
│  CURRENT POSITION                                            │
│                                                              │
│  ₹6,20,000          ₹8,70,000          ₹7,40,000            │
│  Available cash     Receivables         Upcoming obligations  │
│  +8.4% vs last mo   ₹3.0L at risk      Next 30 days         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ✦ GUARDIAN                                                  │
│                                                              │
│  Cash pressure detected                                      │
│  Your projected position falls below safety reserve in       │
│                                                              │
│              17 DAYS                    ₹1,40,000            │
│              [terracotta]               estimated shortfall   │
│                                                              │
│  [ Understand the risk → ]                                   │
└──────────────────────────────────────────────────────────────┘
```

**Components used:**
- `HealthRing` — circular SVG progress ring with score
- `SubScoreBar` — mini labeled progress bar (Liquidity, Receivables, Obligations)
- `CashRunwayChart` — Recharts AreaChart (3 bands) styled with warm palette
- `KpiRow` — 3-column financial number display with delta
- `GuardianAlertBanner` — terracotta-bordered panel at bottom

**Financial Weather Widget:**
```
☀  STABLE      → risk < 40
⚡  WATCH       → risk 40–60
⚠  CAUTION     → risk 60–80
🌩  STORM       → risk > 80
```

---

### Screen 4 — Cash Flow Forecast (`Forecast.tsx`)

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│  CASH FLOW FORECAST                                      │
│                                                          │
│  Horizon:  [ 7 days ]  [ 30 days ]  [ 60 days ]         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ₹8L                                               │  │
│  │  ₹6L ──────────╮  ← Expected                      │  │
│  │  ₹4L            ╰──────╮                           │  │
│  │  ₹2L                    ╲                          │  │
│  │  ₹0L ────────────────────⚠──────                  │  │
│  │  -₹2L                  Day 17 -₹1.4L              │  │
│  │                                                    │  │
│  │  ← Shaded zone = danger (below ₹0)                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Deficit detected on Day 17 (₹1.40L)                    │
│                                                          │
│  [ Generate Rescue Plan ]                                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  UPCOMING OBLIGATIONS                                    │
│                                                          │
│  Day 5   Supplier B payment      ₹2,50,000   FLEXIBLE   │
│  Day 8   EMI                     ₹80,000     FIXED      │
│  Day 10  Payroll                 ₹1,80,000   CRITICAL   │
│  Day 15  Tax obligation          ₹1,20,000   FIXED      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  RECEIVABLES DUE                                         │
│                                                          │
│  Customer A   ₹3,00,000   Due Day 5   Expected Day 16   │
│               ████████░░  82% on-time probability       │
│                                                          │
│  Customer B   ₹1,80,000   Due Day 12  Expected Day 14   │
│               ██████████  91% on-time probability       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ASK GUARDIAN                                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Ask Guardian about your cash position...        │    │
│  └─────────────────────────────────────────────────┘    │
│  Suggested: "Why will I run out of cash?"               │
│             "What is my runway if sales drop 20%?"      │
└──────────────────────────────────────────────────────────┘
```

**Chart styling (Recharts AreaChart):**
```tsx
// 3-band area chart
<AreaChart data={forecastData}>
  {/* Danger zone fill below 0 */}
  <ReferenceArea y1={-999999} y2={0} fill="#FAE9E7" opacity={0.4} />
  {/* Deficit day marker */}
  <ReferenceLine x={deficitDay} stroke="#C85C4A" strokeDasharray="4 4"
    label={{ value: `Day ${deficitDay}`, fill: '#C85C4A', fontSize: 12 }} />
  {/* Safety reserve line */}
  <ReferenceLine y={safetyReserve} stroke="#D39A3D" strokeDasharray="3 3" />
  {/* Worst band */}
  <Area dataKey="worst" fill="#FAE9E7" stroke="none" fillOpacity={0.5} />
  {/* Best band */}
  <Area dataKey="best" fill="#EDF4F0" stroke="none" fillOpacity={0.5} />
  {/* Expected line */}
  <Area dataKey="expected" fill="none" stroke="#4F7D62" strokeWidth={2.5} />
</AreaChart>
```

---

### Screen 5 — Guardian Investigation (`Investigation.tsx`)

**This is the signature screen. Make it look like an investigation timeline.**

```
┌──────────────────────────────────────────────────────────┐
│  ✦ GUARDIAN INVESTIGATION                                │
│  Why is your cash position at risk?                      │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  WHAT IS HAPPENING                                       │
│                                                          │
│  Your business is profitable. The problem is a timing   │
│  mismatch between expected receivables and upcoming     │
│  obligations. Cash availability is expected to fall     │
│  below your safety reserve within 17 days.              │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  ROOT CAUSE TIMELINE                                     │
│                                                          │
│  ●────────────────────────────────────────────────────  │
│  │                                                       │
│  │  01  CUSTOMER PAYMENT DELAY             HIGH RISK     │
│  │      Customer A · Invoice ₹3,00,000                  │
│  │      Due Day 5 · Expected Day 16 · +11 day delay     │
│  │                                                       │
│  ●                                                       │
│  │  02  SUPPLIER OBLIGATION                MEDIUM RISK   │
│  │      Supplier B · ₹2,50,000 due Day 8               │
│  │      Priority: Flexible · Negotiable                 │
│  │                                                       │
│  ●                                                       │
│  │  03  PAYROLL OBLIGATION                 MEDIUM RISK   │
│  │      ₹1,80,000 due Day 10                            │
│  │      Priority: CRITICAL — cannot be delayed          │
│  │                                                       │
│  ●                                                       │
│  │                                                       │
│  ▼  PROJECTED DEFICIT                                    │
│     ₹1,40,000 on Day 17                                 │
│     Risk Score: 82 / 100                                │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  Guardian's conclusion:                                 │
│                                                          │
│  "The problem is not insufficient revenue. It is a      │
│   timing mismatch between expected receivables and       │
│   upcoming obligations that creates a temporary but      │
│   avoidable liquidity gap."                              │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ASK GUARDIAN                                    │    │
│  │ Why will I run out of cash?                     │    │
│  │                                                 │    │
│  │ [ Ask... ]                                      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│            [ Generate Rescue Plan → ]                    │
└──────────────────────────────────────────────────────────┘
```

**Timeline component styling:**
```css
.investigation-timeline {
  position: relative;
  padding-left: 24px;
}
.investigation-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}
.timeline-node {
  position: absolute;
  left: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-guardian);
}
.timeline-node--critical {
  border-color: var(--color-critical);
  background: var(--color-critical-bg);
}
.timeline-end {
  /* Deficit node at bottom */
  border-radius: 4px;
  background: var(--color-critical);
  color: white;
  padding: 12px 20px;
}
```

---

### Screen 6 — Guardian Rescue Plan (`AgentPlan.tsx`)

```
┌──────────────────────────────────────────────────────────┐
│  ✦ GUARDIAN RESCUE PLAN                                  │
│  Goal: Prevent ₹1,40,000 projected deficit               │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  Guardian's reasoning:                                   │
│  [collapsible — shows LLM REASON output]                │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  OPTION A         OPTION B         OPTION C             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Accelerate  │  │ Negotiate   │  │ Invoice     │      │
│  │ Customer A  │  │ Supplier B  │  │ Financing   │      │
│  │ payment     │  │             │  │             │      │
│  │             │  │             │  │             │      │
│  │ +₹3.0L      │  │ +₹2.5L      │  │ +₹2.7L      │      │
│  │ Cost: LOW   │  │ Cost: LOW   │  │ Cost: MED   │      │
│  │ Risk: LOW   │  │ Risk: MED   │  │ Risk: MED   │      │
│  │ Conf: 87%   │  │ Conf: 79%   │  │ Conf: 71%   │      │
│  │             │  │             │  │             │      │
│  │ [ Select ]  │  │ [ Select ]  │  │ [ Select ]  │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ✦ GUARDIAN RECOMMENDS                           │    │
│  │                                                 │    │
│  │  OPTION D — Combine A + B                       │    │
│  │                                                 │    │
│  │  Projected cash improvement    +₹5,50,000       │    │
│  │  Current forecast              -₹1,40,000       │    │
│  │  New forecast                  +₹3,10,000       │    │
│  │                                                 │    │
│  │  "Combining an early payment request from       │    │
│  │   Customer A with a 10-day supplier deferral    │    │
│  │   eliminates the deficit with minimal cost."   │    │
│  │                                                 │    │
│  │  [ Reject ]  [ Modify ]  [ Review & Approve ]  │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

**PlanOptionCard component:**
```tsx
interface PlanOption {
  label: string;           // 'A' | 'B' | 'C' | 'D'
  title: string;
  description: string;
  impact: number;          // in INR
  costLevel: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;      // 0–1
  isRecommended?: boolean;
}

// Recommended card gets terracotta border + "✦ GUARDIAN RECOMMENDS" badge
// Other cards: normal border, selectable
```

**Approval Modal (`ApprovalModal.tsx`):**
```
┌────────────────────────────────────────────────┐
│  ACTION APPROVAL                               │
│  ────────────────────────────────────────────  │
│                                                │
│  Guardian wants to perform:                   │
│                                                │
│  REQUEST EARLY PAYMENT                         │
│  Customer: ABC Retail                          │
│  Amount: ₹3,00,000                             │
│                                                │
│  Reason: Reduce predicted cash deficit         │
│  Expected impact: +₹3,00,000                  │
│  Risk: LOW                                     │
│                                                │
│  ────────────────────────────────────────────  │
│  ⚠ This action does not transfer funds.       │
│    It generates a payment request draft.       │
│  ────────────────────────────────────────────  │
│                                                │
│  [ Reject ]  [ Modify ]  [ Approve Action → ] │
└────────────────────────────────────────────────┘
```

---

### Screen 7 — Action Center (`ActionCenter.tsx`)

```
┌──────────────────────────────────────────────────────────┐
│  ACTION CENTER                                           │
│                                                          │
│  PENDING APPROVAL (1)                                    │
│  ────────────────────────────────────────────────────    │
│  ● Payment Reminder     Customer A    ₹3,00,000  DRAFT   │
│    L2 Action · Awaiting owner approval                   │
│    [ Preview Draft ]  [ Reject ]  [ Approve ]            │
│                                                          │
│  EXECUTED (2)                                            │
│  ────────────────────────────────────────────────────    │
│  ✓ Supplier Negotiation  Supplier B  ₹2,50,000  SENT     │
│    Approved by Arun · 2 hours ago                        │
│    [ View Draft ]                                        │
│                                                          │
│  ✓ Cash Forecast Updated              Today              │
│    Deficit: -₹1.4L → Surplus: +₹3.1L                   │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│  BEFORE / AFTER                                          │
│                                                          │
│  BEFORE                           AFTER                  │
│  Day 17: -₹1,40,000 [red]        Day 17: +₹3,10,000 [green] │
│                                                          │
│  [dual mini chart showing before and after lines]        │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│  AUDIT TRAIL                                             │
│                                                          │
│  10:32  Guardian generated rescue plan                   │
│  10:34  Owner approved Plan D                            │
│  10:34  Payment reminder drafted (L2)                    │
│  10:35  Supplier negotiation drafted (L2)                │
│  10:35  Forecast recalculated                            │
└──────────────────────────────────────────────────────────┘
```

**Before/After Panel (`BeforeAfterPanel.tsx`):**
```tsx
// Shows two mini CashRunwayCharts side by side
// Left: pre-action forecast (coral line dipping below 0)
// Right: post-action forecast (green line staying positive)
// Large delta indicator in the center:
//   -₹1.4L → +₹3.1L
//   ⬆ +₹4.5L improvement
```

---

### Screen 8 — Scenario Lab (`WhatIf.tsx`)

**Brand name: "Scenario Lab" — not "AI Simulator"**

```
┌──────────────────────────────────────────────────────────┐
│  SCENARIO LAB                                            │
│  What would happen if...                                 │
│                                                          │
│  Variable                                                │
│  ○ Customer A payment delay                              │
│  ○ New unexpected expense                                │
│  ○ Revenue drops by %                                    │
│  ○ Supplier demands early payment                        │
│                                                          │
│  Adjustment                                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │  +5 days ─────────●──────── +30 days           │    │
│  │               15 days extra delay               │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  CURRENT                        SIMULATED                │
│  ┌──────────────────┐           ┌──────────────────┐    │
│  │ Day 17: -₹1.4L   │           │ Day 14: -₹3.8L   │    │
│  │ Risk: 82%         │           │ Risk: 94%         │    │
│  │ [small chart]     │           │ [small chart]     │    │
│  └──────────────────┘           └──────────────────┘    │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│  ✦ Guardian response:                                    │
│                                                          │
│  "If Customer A pays 15 days late, your deficit          │
│   grows to ₹3.8L on Day 14. Activate supplier           │
│   negotiation before Day 8 to avoid the crisis."        │
│                                                          │
│  [ Apply to Live Plan ]                                  │
└──────────────────────────────────────────────────────────┘
```

---

### Screen 9 — Receivables (`Receivables.tsx`)

```
┌──────────────────────────────────────────────────────────┐
│  RECEIVABLES                                             │
│                                                          │
│  Total Expected: ₹8,70,000    At Risk: ₹3,00,000         │
│                                                          │
│  CUSTOMER         INVOICE    DUE      EXPECTED  RISK     │
│  ────────────────────────────────────────────────────    │
│  Customer A       ₹3.0L     Day 5    Day 16    HIGH ●   │
│    82% on-time   ████████░░ Chronic late payer          │
│                                                          │
│  Customer B       ₹1.8L     Day 12   Day 14    LOW  ●   │
│    91% on-time   ██████████ Reliable payer              │
│                                                          │
│  Customer C       ₹2.4L     Day 20   Day 23    MED  ●   │
│    74% on-time   ███████░░░ Moderate payer              │
│                                                          │
│  [✦ Guardian] Customer A is your highest-risk           │
│  receivable. Follow up before Day 7.                    │
└──────────────────────────────────────────────────────────┘
```

---

### Screen 10 — Reports (`Reports.tsx`)

Simple, clean read-only view:
- 30-day cash flow summary
- Receivables aging report
- Risk history chart
- Action outcomes log
- Export to PDF button

---

## 5. Reusable Component Library

### 5.1 `HealthRing.tsx`
```tsx
// SVG circular progress ring
// Props: score (0-100), size, showSubScores
// Color: 0-40 = coral, 40-60 = amber, 60-80 = green, 80-100 = deep green
// Center: large mono number + status label
// Sub-scores: small horizontal bars below ring

interface HealthRingProps {
  score: number;
  label: string;       // 'HEALTHY' | 'WATCH' | 'ATTENTION' | 'CRITICAL'
  subScores?: { label: string; value: number }[];
  size?: 'sm' | 'md' | 'lg';
}
```

### 5.2 `CashRunwayChart.tsx`
```tsx
// Recharts AreaChart wrapper
// Props: data, deficitDay, safetyReserve, showBands, height
// Bands: best (green fill), worst (red fill), expected (solid line)
// Markers: deficit day (vertical dashed), safety reserve (horizontal dashed)
// Style: warm palette, no harsh colors, minimal grid lines

interface CashRunwayChartProps {
  data: { day: number; expected: number; best: number; worst: number }[];
  deficitDay?: number;
  safetyReserve?: number;
  showBands?: boolean;
  beforeAfterMode?: boolean;  // shows two overlapping lines
  height?: number;
}
```

### 5.3 `GuardianAlertBanner.tsx`
```tsx
// The signature UI element
// Left border: 3px solid terracotta
// Background: subtle terracotta tint (#F7EDE5)
// Header: "✦ GUARDIAN" in terracotta
// Body: plain language description + key number
// CTA: terracotta button

interface GuardianAlertBannerProps {
  severity: 'info' | 'attention' | 'critical';
  daysToDeficit: number;
  deficitAmount: number;
  confidence: number;
  onInvestigate: () => void;
}
```

### 5.4 `InvestigationTimeline.tsx`
```tsx
// Vertical timeline with nodes
// Each node: cause type, entity name, amount, days, severity badge
// End node: "DEFICIT ₹X.XL" in critical color
// Animated: nodes fade in sequentially

interface TimelineEvent {
  id: string;
  causeType: 'customer_delay' | 'supplier_obligation' | 'payroll' | 'emi' | 'tax';
  entityName: string;
  amount: number;
  dueDay: number;
  expectedDay?: number;
  severity: 'high' | 'medium' | 'low';
}
```

### 5.5 `PlanOptionCard.tsx`
```tsx
// Strategy option card
// Normal state: bordered card, selectable
// Recommended: terracotta border, "✦ GUARDIAN RECOMMENDS" badge at top
// Shows: label (A/B/C/D), title, description, impact amount, cost/risk indicators, confidence bar

interface PlanOptionCardProps {
  option: PlanOption;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}
```

### 5.6 `ApprovalModal.tsx`
```tsx
// Modal overlay for human approval gate
// Shows: action type, entity, amount, reason, expected impact, risk
// Safety disclaimer: "This action does not transfer funds"
// Three buttons: Reject (text), Modify (outlined), Approve (terracotta)

interface ApprovalModalProps {
  action: AgentAction;
  onApprove: () => void;
  onReject: () => void;
  onModify: (note: string) => void;
  onClose: () => void;
}
```

### 5.7 `AskGuardian.tsx`
```tsx
// Contextual AI chat panel (NOT a full-page chatbot)
// Compact: title "Ask Guardian", text input, 3 suggested questions
// Response: inline below input, plain text, cites specific financial numbers
// Never shows "AI" branding — just "Guardian"

interface AskGuardianProps {
  companyId: string;
  context: 'dashboard' | 'forecast' | 'investigation';
  suggestedQuestions?: string[];
}
```

### 5.8 `BeforeAfterPanel.tsx`
```tsx
// Two-column panel showing pre/post-action forecast
// Left: before (coral line dipping below 0, "DEFICIT" label)
// Right: after (green line staying positive, "SURPLUS" label)
// Center indicator: delta amount + arrow up

interface BeforeAfterPanelProps {
  beforeForecast: ForecastData[];
  afterForecast: ForecastData[];
  deficitDay: number;
}
```

### 5.9 `KpiCard.tsx`
```tsx
// Simple financial metric display
// Large mono number (₹ amount)
// Secondary label
// Optional delta (+ green / - coral)
// Optional sub-line (e.g. "₹3.0L at payment risk")
// No colorful card backgrounds — just warm surface with thin border
```

### 5.10 `SubScoreBar.tsx`
```tsx
// Labeled mini progress bar
// Used in HealthRing sub-scores
// Color: matches score range (green/amber/coral)
// Shows: label (Liquidity), score number, filled bar
```

---

## 6. Animation & Interaction Guidelines

### Transitions
```css
/* All interactive elements */
transition: all 0.15s ease;

/* Panel slide-in (Investigation, Plan) */
@keyframes slideInRight {
  from { transform: translateX(20px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* Timeline nodes stagger */
.timeline-item:nth-child(1) { animation-delay: 0ms; }
.timeline-item:nth-child(2) { animation-delay: 150ms; }
.timeline-item:nth-child(3) { animation-delay: 300ms; }

/* Number counter animation (KPI cards) */
/* Use react-countup or CSS custom counter */

/* Health ring fill */
/* SVG stroke-dashoffset animation on mount */
```

### Loading States
- Skeleton screens (warm gray shimmer, not white flicker)
- "Guardian is reasoning..." — pulse animation on the ✦ symbol
- Chart data: lines draw in from left to right

### Hover States
- Cards: `border-color` shifts to `#C8C2BA` (slightly darker)
- Buttons: standard color shift (defined above)
- Nav items: text brightens to `--color-nav-active`
- Plan option cards: subtle lift (`transform: translateY(-2px)`) when hoverable

### Micro-interactions
- Approval modal: backdrop blur `backdrop-filter: blur(4px)`
- Success toast (action executed): slides in from top-right, forest green
- Warning toast: amber
- Error: coral
- Toast auto-dismisses after 4 seconds

---

## 7. Frontend File Structure

```
frontend/src/
├── index.css                  ← Design system tokens (all CSS vars above)
├── App.tsx                    ← Router + AuthGuard
├── main.tsx
│
├── api/
│   └── client.ts              ← Axios instance + all typed API calls
│
├── types/
│   └── index.ts               ← All TypeScript interfaces
│
├── store/
│   └── useAppStore.ts         ← Zustand (company, user, activeAlert)
│
├── hooks/
│   ├── useCompany.ts
│   ├── useForecast.ts
│   ├── useAgent.ts
│   └── useSimulator.ts
│
├── utils/
│   ├── formatCurrency.ts      ← ₹ formatting with L/K/Cr shorthand
│   ├── formatRisk.ts          ← risk score → label + color
│   └── financialWeather.ts    ← score → weather state
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── AppShell.tsx
│   │
│   ├── charts/
│   │   ├── CashRunwayChart.tsx
│   │   ├── BeforeAfterPanel.tsx
│   │   └── SubScoreBar.tsx
│   │
│   ├── guardian/
│   │   ├── GuardianAlertBanner.tsx
│   │   ├── InvestigationTimeline.tsx
│   │   ├── PlanOptionCard.tsx
│   │   ├── ApprovalModal.tsx
│   │   └── AskGuardian.tsx
│   │
│   ├── financial/
│   │   ├── HealthRing.tsx
│   │   ├── KpiCard.tsx
│   │   ├── ObligationRow.tsx
│   │   ├── ReceivableRow.tsx
│   │   └── FinancialWeather.tsx
│   │
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Skeleton.tsx
│       └── SectionLabel.tsx
│
└── pages/
    ├── Login.tsx
    ├── Onboarding.tsx
    ├── Dashboard.tsx
    ├── Forecast.tsx
    ├── Receivables.tsx
    ├── Payables.tsx
    ├── Investigation.tsx
    ├── AgentPlan.tsx
    ├── ActionCenter.tsx
    ├── WhatIf.tsx
    └── Reports.tsx
```

---

## 8. Key Formatting Utilities

```typescript
// formatCurrency.ts
export const formatINR = (amount: number, compact = false): string => {
  if (compact) {
    if (Math.abs(amount) >= 10_00_000) return `₹${(amount / 10_00_000).toFixed(1)}L`;
    if (Math.abs(amount) >= 1_000)    return `₹${(amount / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(amount);
};

// formatRisk.ts
export const getRiskLabel = (score: number) => {
  if (score >= 80) return { label: 'CRITICAL', color: '#C85C4A', bg: '#FAE9E7' };
  if (score >= 60) return { label: 'ATTENTION', color: '#D39A3D', bg: '#FBF3E3' };
  if (score >= 40) return { label: 'WATCH',     color: '#D39A3D', bg: '#FBF3E3' };
  return              { label: 'HEALTHY',    color: '#4F7D62', bg: '#EDF4F0' };
};

// financialWeather.ts
export const getWeather = (score: number) => {
  if (score >= 80) return { icon: '🌩', label: 'STORM APPROACHING' };
  if (score >= 60) return { icon: '⚠',  label: 'CAUTION' };
  if (score >= 40) return { icon: '⚡',  label: 'WATCH' };
  return              { icon: '☀',  label: 'STABLE' };
};
```

---

## 9. Implementation Build Order

Build screens in this order (matches demo flow):

| Order | Screen | Priority | Notes |
|---|---|---|---|
| 1 | Design system (`index.css`) | MUST | All tokens, base styles first |
| 2 | `AppShell`, `Sidebar`, `TopBar` | MUST | Shell before any page |
| 3 | `Dashboard.tsx` | MUST | First demo screen |
| 4 | `CashRunwayChart.tsx` | MUST | Used in Dashboard + Forecast |
| 5 | `Forecast.tsx` | MUST | Second demo screen |
| 6 | `Investigation.tsx` | MUST | Third demo screen — signature UI |
| 7 | `AgentPlan.tsx` + `ApprovalModal` | MUST | Fourth demo screen |
| 8 | `ActionCenter.tsx` + `BeforeAfterPanel` | MUST | Fifth demo screen |
| 9 | `WhatIf.tsx` | STRETCH | Build last if time allows |
| 10 | `Receivables`, `Payables`, `Reports` | STRETCH | Nice to have |
| 11 | `Login`, `Onboarding` | STRETCH | Can be minimal |

---

## 10. What NOT to Build in the UI

> [!WARNING]
> These patterns will make the UI look like a generic AI app — avoid them:

- No full-page ChatGPT-style chat interface
- No purple / blue gradients anywhere in the app
- No "AI" prefixed labels (AI Dashboard, AI Analysis, AI Chat)
- No heavy box shadows on every card
- No cramped 4-card KPI grid as the primary layout
- No generic admin template look
- No animated particles or abstract background effects
- No excessive emoji usage in the UI (text-based icons only in nav)
- No LLM output displayed as raw markdown in the UI — always render structured components

---

## 11. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop ≥ 1280px | Full sidebar + content, all panels visible |
| Tablet 768–1279px | Sidebar collapses to icon-only (48px) |
| Mobile < 768px | Sidebar hidden, bottom nav bar, stacked cards |

For the hackathon, **optimize for desktop only** — this is a B2B financial tool used on workstations.
