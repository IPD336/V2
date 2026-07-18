---
name: SkillSwap
description: Peer-to-peer skill exchange platform — trade what you know, learn what you don't.
colors:
  ink: "#0f0f0f"
  ink-light: "#2a2a2a"
  cream: "#F8F4EE"
  warm: "#EDE8DF"
  accent: "#C84B31"
  accent-light: "#F0EBE6"
  sage: "#3A6351"
  sage-light: "#E4EDE8"
  gold: "#B8902A"
  gold-light: "#F5EDD6"
  indigo: "#3B4F8C"
  indigo-light: "#E8EAF3"
  muted: "#7A7268"
  white: "#FFFFFF"
  card-bg: "#FFFFFF"
  border: "rgba(15,15,15,0.10)"
  nav-bg: "rgba(248,244,238,0.92)"
  section-dark: "#E8E0D8"
  accent-rgb: "200, 75, 49"
  sage-rgb: "58, 99, 81"
  gold-rgb: "184, 144, 42"
  indigo-rgb: "59, 79, 140"
typography:
  display:
    fontFamily: "PT Serif, Georgia, serif"
    fontSize: "clamp(42px, 5.5vw, 84px)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: -2px
  headline:
    fontFamily: "PT Serif, Georgia, serif"
    fontSize: "clamp(32px, 4vw, 52px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -1.5px
  title:
    fontFamily: "PT Sans, Arial, sans-serif"
    fontSize: 15
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "PT Sans, Arial, sans-serif"
    fontSize: 15
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "PT Mono, Courier New, monospace"
    fontSize: 10
    fontWeight: 400
    letterSpacing: 2px
    textTransform: uppercase
rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 50%
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 56px
  container: 1200px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "14px 36px"
    typography: "{typography.label}"
    fontWeight: 700
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
    border: "1.5px solid {colors.border}"
    typography: "{typography.label}"
    fontWeight: 700
  card-default:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.xl}"
    padding: "{spacing.sm}"
    shadow: "0 4px 32px rgba(15,15,15,0.08)"
  input-default:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.md}"
    padding: "11px 14px"
    border: "1.5px solid {colors.border}"
    typography: "{typography.body}"
    fontSize: 13
---

# Design System: SkillSwap

## 1. Overview

**Creative North Star: "The Marketplace"**

SkillSwap's design language sits at the intersection of a refined editorial sensibility and the warm, human energy of a bustling marketplace. The cream backdrop (never cold white, never AI-warmth beige) sets a tactile, paper-like foundation — like well-loved parchment or a sunlit workshop table. Against this ground, a brick-red accent anchors the interface with conviction, while earthy secondaries (sage, gold, indigo) bring the community's diversity into the palette itself.

This is a restrained system that doesn't clamor for attention — buttons sit flat until hovered, shadows are subtle rewards for interaction, and typography carries the weight of the hierarchy without decorative chrome. The warmth is intentional and branded, not the default AI warm-tinted neutrals. Every element answers one question: does this make the exchange easier, faster, or more trustworthy?

**Key Characteristics:**
- Warm-but-editorial: cream base with true off-white neutral, not AI-generic sand
- Restrained: flat surfaces, earned depth, one accent at a time
- Typographic: PT Serif leads with authority, PT Sans follows with clarity, PT Mono marks metadata
- Community-colored: four accent families (accent, sage, gold, indigo) signal different users and states without competing
- Tactile at rest: borders and radii are deliberate, not overly rounded; cards and buttons have presence without shouting

## 2. Colors: The Marketplace Palette

The palette mixes warm neutrals with a single saturated anchor and three supporting accents. The cream is the brand's signature surface — it's warm by conviction, not by default.

### Primary

- **Ember** (#C84B31 / oklch(50% 0.17 35)): The single voice. Used for primary buttons, active states, links, and the accent in section headings (_italic emphasis_). Never used on more than ~10% of any given screen; its rarity is its power. In dark mode it shifts warmer (#D9562E / oklch(57% 0.15 35)) to maintain presence against the dark cream base.

### Secondary

- **Sage** (#3A6351 / oklch(38% 0.06 160)): Trust and completion. Used for "active" status badges, success states, and green skill tags. In dark mode it lifts (#5FA882 / oklch(62% 0.07 160)) for visibility.
- **Gold** (#B8902A / oklch(58% 0.12 85)): Achievement and value. Leaderboard points, star ratings, premium badges. Always associated with earned reputation.
- **Indigo** (#3B4F8C / oklch(34% 0.09 270)): Structure. Used for "completed" states, blue skill tags, informational badges. The cool counterpoint to the warm palette.

### Neutral

- **Ink** (#0f0f0f): Body text and primary content. Near-black, not pure black, to keep the warmth consistent.
- **Cream** (#F8F4EE / oklch(96% 0.008 75)): The signature background. Warm but not sand. In dark mode it inverts to a warm dark brown (#1c1814).
- **Warm** (#EDE8DF / oklch(92% 0.008 75)): Secondary surface and hover states. A whisper darker than cream.
- **Muted** (#7A7268 / oklch(50% 0.02 55)): Secondary text, labels, placeholders.
- **Card BG** (#FFFFFF): Elevated surfaces on the cream canvas. In dark mode it becomes a warm dark (#26211c).
- **Border** (rgba(15,15,15,0.10)): Subtle separation. Thin and translucent, never bold.

### Named Rules

**The Single-Voice Rule.** The Ember accent appears on ≤10% of any given screen. Its rarity preserves its signal. Using it for background fills, gradient text, or decorative borders dilutes the brand.

**The Four-Accent Convention.** The secondary accents (sage, gold, indigo) are not decorative — each maps to a semantic role: trust, achievement, information. A badge that mixes two accent colors confuses the signal.

**The Warmth-By-Conviction Rule.** The cream background and warm neutrals are a brand choice, not an AI default. Never tint neutrals toward warm chroma "because the brief feels warm" — the ink, muted, and border values already carry the brand's warmth in their composition. Adding more warmth reads as the 2026 monoculture cream.

## 3. Typography

**Display Font:** PT Serif (Georgia, serif)
**Body Font:** PT Sans (Arial, sans-serif)
**Label/Mono Font:** PT Mono (Courier New, monospace)

**Character:** The pairing is editorial-meets-utilitarian. PT Serif brings the authority of a printed newspaper or a well-bound book; PT Sans follows with the clarity of a tool built for speed. PT Mono marks the metadata — timestamps, stats, labels — like a typesetter's marginalia. The three weights within each family (400, 600, 700) cover the hierarchy without adding decorative faces.

### Hierarchy

- **Display** (600, clamp(42px, 5.5vw, 84px), 1.02, -2px letter-spacing): Hero headlines only. Single use per page. Slab-serif weight gives it gravity without shouting.
- **Headline** (600, clamp(32px, 4vw, 52px), 1.05, -1.5px letter-spacing): Section headers and modal titles. The workhorse of the hierarchy.
- **Title** (700, 15px, 1.3): Card titles, profile names, sidebar headings. Bold within body scale to distinguish from content.
- **Body** (400, 15px, 1.75): Paragraph text, descriptions, message content. Capped at 65–75ch line length.
- **Label** (400, 10px, 2px letter-spacing, uppercase): Metadata, section labels, button text, form labels. PT Mono gives it a utilitarian, measurable feel.

### Named Rules

**The Mono-Label Ceiling.** PT Mono is for metadata only — timestamps, stats, small labels, section markers. Never use it for body copy, headings, or anything longer than 2-3 words. Its fixed-width rhythm is functional, not decorative.

**The Button Letter-Spacing Floor.** Button text in PT Mono uppercase uses 1-2px letter-spacing minimum. Anything tighter reads as cramped and unconfident.

## 4. Elevation

The system is flat by default. Surfaces sit on the cream canvas without a drop shadow until a user interacts with them. Depth is earned — it signals interactivity, not architecture. This keeps the interface calm and legible even with many cards or list items on screen.

### Shadow Vocabulary

- **Ambient Low** (0 4px 32px rgba(15,15,15,0.08)): Hover state on cards, swap-list items, dropdowns, and modals. A soft, wide diffusion — no hard drop shadow.
- **Ambient High** (0 16px 64px rgba(15,15,15,0.12)): Hover on featured cards, large modals, nav dropdowns. Used once or twice per page at most.

### Named Rules

**The Flat-By-Default Rule.** Surfaces at rest have no shadow. Shadows appear only as feedback to interaction (hover, focus, open). A modal without a shadow is flat; a card without hover doesn't float.

**The Wide-Blur Rule.** All shadows use a blur radius ≥ 4× the offset (32px blur on 4px offset, 64px blur on 16px offset). Tight shadows with small blur read as outdated or cheap. The wide diffusion keeps the effect ambient rather than structural.

## 5. Components

### Buttons

- **Shape:** Gently rounded (6px cosmos variant, 8px standard). Not pill-shaped — the slight squaring communicates action without softness.
- **Primary (Ember):** Background var(--accent), white text, 14px 36px padding (cosmos) or 9px 22px (standard). Hover: brightness 0.85 + shadow (Ambient Low). Active: translateY(1px).
- **Ghost:** Transparent background, 1.5px border in var(--border), var(--ink) text. Hover: border + text shift to var(--accent). Used for secondary actions and paired with primary.
- **Icon:** 36px × 36px square, 7px radius, border 1.5px solid var(--border). Saves/saved state toggles to gold fill.

**States:** All buttons share a 0.2s transition. Disabled state at 0.5 opacity with `cursor: not-allowed`. Focus-visible uses 2px solid var(--accent) outline at +2px offset.

### Cards / Containers

- **Corner Style:** Rounded with personality — profile cards 16px, swap cards 12px, stat mini-cards 12px, team cards 16px, mockup cards 16px.
- **Background:** var(--card-bg) on cream canvas. Clean distinction between surface and background.
- **Shadow Strategy:** None at rest. Ambient Low on hover, Ambient High on featured/hero cards.
- **Border:** 1px solid var(--border) — thin, translucent, never prominent. The card's shape and its contrast against the cream background do the separation.
- **Internal Padding:** 16–24px depending on density. Cards with dense content (swap list) use tighter padding.

### Inputs / Fields

- **Style:** 1.5px solid var(--border), 8px radius, var(--card-bg) background. Subtle and functional.
- **Focus:** Border shifts to var(--accent). No glow, no ring — just a color change at the boundary.
- **States:** Error gets a var(--accent) border with red SVG icon; success gets var(--sage) border with green check. Disabled at 0.6 opacity.

### Navigation

- **Top Nav:** Fixed, 68px height, blur-backdrop background (var(--nav-bg)). Links are 11px uppercase, 700 weight, 1.2px tracking. Active link gets a scale-in underline in Ember. Hover transitions to Ember color.
- **Mobile Bottom Nav:** 64px tabs with icons + labels. Active tab in Ember. Appears at ≤900px breakpoint.

### Chips / Tags

- **Style:** Small (4px 8px padding), 5px radius, background tinted to semantic color (red-tint for tech skills, green-tint for offered skills, etc.), bold 11px text. Compact enough to stack in rows.
- **Filter Pill:** 8px 18px padding, 6px radius. Active state fills with Ember. Used on Browse page for category filtering.

### Modals

- **Structure:** Fixed overlay with 6px blur backdrop. Modal container: 20px radius, 40px padding, max-width 500px, max-height 90vh. Content scrolls internally.
- **Entry:** 0.3s cubic-bezier(.2,.8,.2,1) — a subtle slide-up with scale.
- **Close Button:** 30px × 30px, 7px radius, positioned top-right. Hover inverts to ink background.

### Toggle

- **Track:** 42px × 22px, pill-shaped (50px radius). Off state: warm gray (--border equivalent). On state: var(--sage). Slider knob: 16px white circle with mini shadow.
- **Transition:** 0.2s ease. Checked state shifts knob 20px.

### Skeleton Loading

- **Style:** Shimmer animation (1.4s) using a gradient sweep across var(--border) and var(--cream). All skeletons share this same treatment — no per-component skeleton shapes beyond preset heights (card, row, avatar, text, badge).

## 6. Do's and Don'ts

### Do:
- **Do** use Ember as the single voice — one accent color at ≤10% of any screen.
- **Do** keep surfaces flat at rest. Let shadows signal interactivity.
- **Do** let typography carry hierarchy — PT Serif for display/headline, PT Sans for body, PT Mono for metadata.
- **Do** warm the palette by conviction, not by default. The cream background is a brand signature, not AI-generic sand.
- **Do** use the four accent families (Ember, sage, gold, indigo) semantically: action, trust, achievement, information.
- **Do** use `text-wrap: balance` on h1-h3 and `text-wrap: pretty` on long prose.
- **Do** cap body text at 65–75ch line length.
- **Do** respect `prefers-reduced-motion` — animations should degrade gracefully to crossfade or instant transitions.
- **Do** build a semantic z-index scale (dropdown → sticky → modal-backdrop → modal → toast → tooltip). Never arbitrary values like 999.

### Don't:
- **Don't** use glassmorphism, gradient text (`background-clip: text`), or ghost cards (1px border + wide shadow on the same element).
- **Don't** add tiny uppercase eyebrow labels above every section ("ABOUT", "FEATURES", "PROCESS") — the 2023-era AI tell.
- **Don't** use numbered section markers (01 / 02 / 03) as default scaffolding unless the order carries information.
- **Don't** use side-stripe borders — `border-left` or `border-right` greater than 1px as a colored accent on cards or list items.
- **Don't** over-round cards — max 16px for featured cards, 12px for compact cards. Pill shapes (32px+) on cards is a Codex tell.
- **Don't** use `repeating-linear-gradient` stripe backgrounds or decorative grid overlays (two-axis CSS grid patterns).
- **Don't** pair the cream background with gray text — the muted value (var(--muted)) at 4.5:1 minimum contrast on body text.
- **Don't** use gradient text or decorative borders for emphasis — use weight, size, or the Ember accent in italics instead.
- **Don't** use the hero-metric template (big number, small label, gradient accent) — SkillSwap's stats bar already does this deliberately with solid brand color.
- **Don't** use `border-radius: 32px+` on cards or sections — that's the Codex signature over-rounding.
- **Don't** auto-dark mode "because tools look cool dark" — dark mode must serve actual reading comfort, not aesthetics.
