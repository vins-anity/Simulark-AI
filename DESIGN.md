---
name: Simulark
description: Living Blueprint design system — schematic marketing, quiet product shell.
reference: docs/living-blueprint-design-guide.md
colors:
  primary: "#ff4d00"
  primary-dark: "#ff5c1a"
  neutral-bg: "#faf9f5"
  neutral-bg-dark: "#0f0f0f"
  surface: "#ffffff"
  surface-dark: "#18181b"
  ink: "#141413"
  ink-muted: "#6b6b69"
  gray-mid: "#b0aea5"
  gray-light: "#e8e6dc"
  success: "#788c5d"
  warning: "#d97757"
  error: "#dc2626"
  info: "#6a9bcc"
typography:
  display:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: "Lora, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.6
  ui:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  none: "0px"
  sm: "2px"
spacing:
  touch-min: "44px"
  section: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.neutral-bg}"
  focus-ring:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
---

## Source of truth

**Marketing (brand register):** Follow [`docs/living-blueprint-design-guide.md`](docs/living-blueprint-design-guide.md) — schematic, brutalist, module cards, command bar HUD, `//` metadata, bracket CTAs, grid backgrounds, pulse indicators.

**Product (app register):** Quiet task shell — plain verbs on controls, operator flavor in status lines only. Same tokens; less ornament.

## Philosophy

**Engineering as art.** Simulark is a precision instrument; the marketing site should feel like a living blueprint. Keywords: schematic, technical, precise, brutalist, monolithic, transparent.

## Colors

| Role | Light | Token |
|------|-------|-------|
| Canvas (sand) | `#faf9f5` | `--bg-primary` |
| Ink | `#141413` | `--brand-charcoal` |
| Signal (orange) | `#ff4d00` | `--brand-orange` |
| Grid lines | charcoal @ 5–10% | `--canvas-grid` |
| Live status | green | `--brand-green` |

Never pure `#fff` / `#000` on marketing surfaces — use sand and charcoal tokens.

## Typography

| Layer | Font | Usage |
|-------|------|--------|
| Display | Poppins | Heroes, section titles (`CORE` + *italic* accent) |
| Body | Lora | Descriptions, manifesto copy |
| Data / UI | Geist Mono | Nav, badges, `//` labels, `[ ACTIONS ]`, pricing |

**Legibility floor:** Required-reading microcopy uses `.text-readable-meta` (11px, ~65% ink). Decorative `//` eyebrows and CAP/MOD IDs may stay mono-uppercase at readable-meta size.

## Marketing patterns (Living Blueprint)

### Command bar (header)
- Fixed top, backdrop blur on scroll.
- Status strip: `// SYSTEM_READY`, version, pulse dot.
- Center: real status (online + measured round-trip when available).
- Primary action: `[ INITIALIZE ]` bracket CTA for sign-up.

### Module cards (features / capabilities)
- ID badge top-right (`CAP-01`, `MOD-02`).
- Corner bracket accents, rigid icon box.
- Category line: `// VISUALIZATION`.
- Spec tags in mono pills; hover: border orange + bottom accent line.
- Optional: subtle `translateY` on hover (respect `prefers-reduced-motion`).

### Grid footer
- 4-column index with `// INDEX_01`, `// INDEX_02`.
- Bracket-wrapped links: `[ API Reference ]`.
- System status block with green pulse.

### Forms & contracts
- Sharp corners (`rounded-none`).
- Labels as data fields; signal-strength where relevant.
- Pricing as contracts/invoices with monospace figures.

## Product shell constraints

- Min touch **44×44px** on icon controls (`min-h-11 min-w-11`).
- Visible `:focus-visible` ring (2px orange). No global outline kill except `.no-focus-outline`.
- Sidebar: instant collapse, no width animation.
- Plain verbs on buttons: Export, Save settings, Sign out.

## Mature refinements (evolution of the guide)

These improve the original spec without diluting taste:

1. **Real telemetry only** — measure latency; no static fake ms, coords, or `LIVE` on non-interactive demos.
2. **Motion** — global `prefers-reduced-motion` gate; pulse animations use `motion-safe:` / `motion-reduce:animate-none`.
3. **Accessibility** — `aria-label` on icon-only product controls; marketing bracket CTAs stay visual.
4. **Version honesty** — single build string (e.g. `v0.1.0`) across HUD and footer.

## Don'ts (both registers)

- Side-stripe accent borders (`border-l-4` on cards/alerts).
- Gradient text (`bg-clip-text`).
- Blanket `input:focus { outline: none }`.
- Fake static telemetry.

## Do's

- Semantic tokens (`bg-bg-primary`, `text-text-secondary`, `border-border-primary`).
- Grid backgrounds on hero and section breaks.
- Dashed lines for flow / pipeline connectors.
- Brackets on marketing primary CTAs and footer legal links.
