---
version: "alpha"
name: "Creative Cards"
description: "Creative Cards Feature Section is designed for highlighting product capabilities and value points. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for component libraries and responsive product interfaces."
colors:
  primary: "#FF7657"
  secondary: "#DFFF65"
  tertiary: "#F97316"
  neutral: "#FFFFFF"
  background: "#FFFFFF"
  surface: "#FF7657"
  text-primary: "#171714"
  text-secondary: "#77766F"
  border: "#171714"
  accent: "#FF7657"
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: "68px"
    fontWeight: 500
    lineHeight: "68px"
    letterSpacing: "-0.05em"
  body-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22.75px"
spacing:
  base: "12px"
  sm: "1px"
  md: "3.4px"
  lg: "12px"
  xl: "14.96px"
  gap: "12px"
  card-padding: "16px"
  section-padding: "32px"
components:
  card:
    backgroundColor: "{colors.secondary}"
    rounded: "31px"
    padding: "32px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Bounded
  - Framing: Open
  - Grid: Strong

## Colors

The color system uses dark mode with #FF7657 as the main accent and #FFFFFF as the neutral foundation.

- **Primary (#FF7657):** Main accent and emphasis color.
- **Secondary (#DFFF65):** Supporting accent for secondary emphasis.
- **Tertiary (#F97316):** Reserved accent for supporting contrast moments.
- **Neutral (#FFFFFF):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #FFFFFF; Surface: #FF7657; Text Primary: #171714; Text Secondary: #77766F; Border: #171714; Accent: #FF7657

- **Gradients:** bg-gradient-to-br from-white/80 to-black/5 via-white/20, bg-gradient-to-br from-white/10 to-black/40 via-black/0, bg-gradient-to-br from-white to-black/5 via-white

## Typography

Typography relies on Inter across display, body, and utility text.

- **Display (`display-lg`):** Inter, 68px, weight 500, line-height 68px, letter-spacing -0.05em.
- **Body (`body-md`):** Inter, 14px, weight 400, line-height 22.75px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, bounded structural frame before changing ornament or component styling. Use 12px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / bounded composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Bounded
- **Base unit:** 12px
- **Scale:** 1px, 3.4px, 12px, 14.96px, 16px, 24px, 32px, 45px
- **Section padding:** 32px, 50px, 55px, 96px
- **Card padding:** 16px, 32px
- **Gaps:** 12px, 16px, 32px, 56px

## Elevation & Depth

Depth is communicated through elevated, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as elevated first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Elevated
- **Borders:** 0.8px #171714; 0.8px #FFFFFF
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.04) 0px 8px 30px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 1px padding and a 32px radius. Drive the shell with linear-gradient(to right bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.05)) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 4px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 4px, 20px, 31px, 32px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Reuse the existing card surface recipe for content blocks.

### Cards and Surfaces
- **Card surface:** background #DFFF65, border 0px solid rgb(229, 231, 235), radius 31px, padding 32px, shadow none.
- **Card surface:** background #141412, border 0px solid rgb(229, 231, 235), radius 31px, padding 32px, shadow none.
- **Card surface:** background #1E1E1A, border 0.8px solid rgba(255, 255, 255, 0.2), radius 20px, padding 16px, shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.25) 0px 25px 50px -12px.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 12px rhythm.
- Do reuse the Elevated surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 4px, 20px, 31px, 32px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

Motion feels controlled and interface-led across text, layout, and section transitions. Timing clusters around 700ms and 600ms. Easing favors ease and 0.2. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** moderate

**Durations:** 700ms, 600ms, 300ms, 500ms, 1000ms

**Easings:** ease, 0.2, 1), cubic-bezier(0.2, 0.8, 0

**Scroll Patterns:** gsap-scrolltrigger
