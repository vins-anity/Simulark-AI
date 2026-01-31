# Design: Intellectual's Workspace

## Overview
A high-end, editorial-inspired design for Simulark, prioritizing clarity, technical depth, and a premium drafting experience.

## Aesthetic Direction: Refined Scholar
- **Core Visuals**: Translucent layers, crisp typography, and high-impact accent colors.
- **Palette**: Anthropic-inspired (Off-white `#faf9f5`, Dark charcoal `#141413`, Mid-gray `#b0aea5`, with Orange `#d97757` as the primary functional accent).

## Component Architecture

### 1. Canvas Experience (React Flow)
- **Background**: Subtle grid pattern (drafting paper).
- **Nodes**: Glassmorphic cards (`backdrop-blur-md`, `bg-white/40`, `border-white/20`).
- **Typography**: 
  - Titles: **Poppins** (Semi-bold, 14px).
  - Utility/Supportive: **Lora** (Italic, 12px).
- **Edges**: 
  - Default: Subtle gray paths.
  - Simulation: Pulsing orange "ink" flows representing data movement.

### 2. Dashboard
- **Layout**: Sidebar navigation on the left (Mid-Gray). Pristine workspace on the right (Off-white).
- **Project Cards**:
  - High padding, minimal border.
  - "Diagram Symbols": Generative abstract SVG representations of the graph instead of standard thumbnails.

## Success Criteria
- The interface feels "calm" and "authoritative."
- Architecture design feels like an "elevated" drafting experience rather than a standard CRUD app.
