# Living Blueprint: Design System Documentation

## Core Philosophy
**"Engineering as Art."**
Simulark is not just a tool; it is a high-precision instrument for infrastructure architecture. The design language reflects the product's core function: transforming abstract thought into concrete, executable systems.

**Keywords**: Schematic, Technical, Precise, Brutalist, Monolithic, Transparent.

---

## 1. Typography
We use a specific tri-font stack to separate functional layers.

### Primary Headings: **Poppins**
Used for major statements and feature titles.
- **Attributes**: Geometric, Bold, Clean.
- **Usage**: Hero titles, Section headers.

### Body Text: **Lora**
Used for long-form content, explanations, and narratives.
- **Attributes**: Modern Serif, High readability, Elegant.
- **Usage**: Subtitles, Feature descriptions, "Manifesto" text.

### Data & UI: **Geist Mono** (or generic Monospace)
Used for navigation, metadata, pricing, forms, and anything representing "system status".
- **Attributes**: Mechanical, Fixed-width, Utilitarian.
- **Usage**: `NAV LINKS`, `PRICING`, `BUTTON LABELS`, `// COMMENTS`, `BADGES`.

---

## 2. Color Palette
A restrained, architectural palette.

| Role | Color | Hex | Description |
| :--- | :--- | :--- | :--- |
| **Canvas** | `brand-sand-light` | `#faf9f5` | Warm, paper-like background. Never pure white. |
| **Ink** | `brand-charcoal` | `#1a1a1a` | High contrast text and rigid borders. |
| **Signal** | `brand-orange` | `#ff4d00` | (Approximated) Critical actions, alerts, active states. |
| **Grid** | `brand-charcoal/5` | `rgba(...)` | Subtle background grids and structural lines. |

---

## 3. Component Patterns

### The "Command Bar" (Header)
A Heads-Up Display (HUD) for navigation.
- **Structure**: Fixed top, backdrop blur.
- **Styling**: Monospace uppercase links with hover arrows (e.g., `/ FEATURES`).
- **Elements**: Must verify User Session and provide an "INITIALIZE" action.

### The "Grid System" (Footer)
A technical index of the site.
- **Structure**: 4-column rigid grid.
- **Styling**: Visible separators, technical identifiers (e.g., `// INDEX_01`).
- **Content**: Includes system status indicators.

### "System Features" (Cards)
- **Concept**: Each feature is a **Module**.
- **Visual**: 
    - ID Badges in top-right (e.g., `MOD-01`).
    - Monochromatic icons in rigid boxes.
    - Hover effects: Slide up + Opacity shift.

### "Resource Contracts" (Pricing)
- **Concept**: Plans are **Contracts** or **Invoices**.
- **Visual**:
    - Monospace pricing (large).
    - Brutalist borders.
    - "Recommended" tags replaced with "OPTIMAL CONFIGURATION" style badges.

### "Data Transmission" (Forms)
- **Concept**: Contact forms are **Uplinks**.
- **Visual**:
    - Sharp edges (0px border radius).
    - Status indicators (Signal Strength).
    - Labels formatted as data fields (e.g., `IDENTIFIER`).

---

## 4. Visual Motifs
- **Dashed Lines**: Represent timelines or data flow.
- **Grid Backgrounds**: Interactive, mouse-reactive grids for Hero sections.
- **Brackets**: `[ LOGIN ]` to denote executable actions.
- **Pulse Indicators**: Green/Orange pulsing dots for live status.
