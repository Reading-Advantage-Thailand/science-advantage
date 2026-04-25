---
version: 1.0
name: Science Advantage
colors:
  primary: "#BC3C9D" # Vibrant purple-pink (oklch(0.65 0.25 340))
  secondary: "#F59E0B" # Warm yellow (oklch(0.85 0.08 45))
  accent: "#22C55E" # Fresh green (oklch(0.75 0.18 120))
  destructive: "#EF4444" # Warm red (oklch(0.65 0.22 20))
  background: "#F0F9FF" # Light blue-tinted background (oklch(0.985 0.015 200))
  foreground: "#0F172A" # Dark blue text (oklch(0.15 0.02 250))
  muted: "#E2E8F0" # Light muted blue (oklch(0.92 0.02 200))
  card: "#FFFFFF" # White cards
  border: "#E2E8F0" # Soft borders
typography:
  h1:
    fontFamily: "Geist Sans"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: "Geist Sans"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.3
  h3:
    fontFamily: "Geist Sans"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Geist Sans"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist Sans"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  mono:
    fontFamily: "Geist Mono"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
rounded:
  sm: 10px
  md: 12px
  lg: 14px
  xl: 18px
  full: 9999px
---

# Design Specification

## Overview
Science Advantage is a K-12 educational platform designed to be vibrant, friendly, and engaging. The design system prioritizes readability, accessibility, and a playful yet professional aesthetic suitable for students and teachers.

## Colors
The color palette uses vibrant, high-contrast colors to differentiate between various scientific concepts and interactive elements.

- **Primary ({colors.primary}):** Used for main actions, brand elements, and progress indicators.
- **Secondary ({colors.secondary}):** Used for warning-free highlights and supplementary information.
- **Accent ({colors.accent}):** Used for "correct" states, success messages, and growth-related metaphors.
- **Destructive ({colors.destructive}):** Used for errors, warnings, and critical alerts.
- **Background ({colors.background}):** A soft, blue-tinted background to reduce eye strain.
- **Foreground ({colors.foreground}):** High-contrast text color for maximum legibility.

## Typography
The system uses the **Geist** font family for a modern, clean look that scales well from small labels to large headings.

- **H1 ({typography.h1.fontSize}):** Main page titles and hero sections.
- **H2 ({typography.h2.fontSize}):** Section headings.
- **H3 ({typography.h3.fontSize}):** Component-level headings.
- **Body ({typography.body.fontSize}):** Standard instructional and content text.
- **Label ({typography.label.fontSize}):** Metadata, captions, and small UI elements.
- **Mono ({typography.mono.fontSize}):** Code snippets and technical data.

## Spacing
A consistent 4px-based grid ensures visual rhythm and alignment across all layouts.

- **Base ({spacing.base}):** 4px
- **Small ({spacing.sm}):** 8px
- **Medium ({spacing.md}):** 16px
- **Large ({spacing.lg}):** 32px
- **Extra Large ({spacing.xl}):** 64px

## Rounded
Generous border radii are used to create a friendly, approachable "squishy" feel that appeals to younger learners.

- **Small ({rounded.sm}):** 10px
- **Medium ({rounded.md}):** 12px
- **Large ({rounded.lg}):** 14px (Standard Card Radius)
- **Extra Large ({rounded.xl}):** 18px (Button and Large Card Radius)

## Shadows
The system uses soft, colored shadows to create depth without feeling heavy or industrial.

- **Soft Shadow:** `0 4px 6px -1px oklch(0.15 0.02 250 / 0.1)`
- **Hover Elevation:** `0 10px 15px -3px oklch(0.15 0.02 250 / 0.15)`

## Components
The system includes specialized "Edu" components optimized for K-12 contexts.

### EduCard
- **Background:** {colors.card}
- **Border:** 2px {colors.border}
- **Corner Radius:** {rounded.xl}
- **Shadow:** Elevated on hover for interactivity.

### EduButton
- **Primary:** {colors.primary} with white text.
- **Radius:** {rounded.xl}
- **Animation:** Scale up on hover, scale down on active click.

## Do's and Don'ts
### Do
- Use high-contrast color pairings for accessibility.
- Maintain consistent rounding (standardize on {rounded.lg} or {rounded.xl}).
- Use generous white space between instructional modules.

### Don't
- Use low-contrast text on vibrant backgrounds.
- Use sharp corners for student-facing UI.
- Overcrowd the screen with too many competing primary actions.
