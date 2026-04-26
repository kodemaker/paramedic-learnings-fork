# Design Theme — Clinical Reference

The visual identity for Paramedic Learnings. This is a **living document**: extend it when new patterns emerge, but the foundation (palette, type, spacing, voice) should remain stable across user stories so the app reads as one coherent product.

The aesthetic is named **Clinical Reference**: it borrows from medical publishing (NICE, UpToDate, BMJ Best Practice) rather than from generic SaaS. The product is a knowledge tool for clinicians, not a productivity dashboard, and the design should signal that on first glance.

---

## Principles

1. **Authority over flash.** The content is clinical guidance — it must read as trustworthy. Typography, generous whitespace, and restraint do that work. Gradients, glassmorphism, and decorative color do the opposite.
2. **One signal color, used sparingly.** Oxblood is for primary action and emphasis. If everything is emphasized, nothing is.
3. **Paper, not plastic.** Warm ivory background, hairline rules instead of cards-on-cards, no drop shadows. The page should feel like a well-typeset journal article.
4. **Light theme only.** No dark mode. The ivory *is* the brand.

---

## Palette

| Role           | Token                  | Value      | Usage                                     |
| -------------- | ---------------------- | ---------- | ----------------------------------------- |
| Background     | `--color-background`   | `#FBF8F1`  | Page background — warm ivory, never white |
| Surface        | `--color-surface`      | `#FFFFFF`  | Inputs, raised content blocks             |
| Ink            | `--color-ink`          | `#1A1F2B`  | Body text, headlines                      |
| Ink muted      | `--color-ink-muted`    | `#5C6370`  | Secondary text, metadata                  |
| Ink subtle     | `--color-ink-subtle`   | `#8A8F99`  | Captions, placeholders                    |
| Rule           | `--color-rule`         | `#E5DFD2`  | Hairline dividers, input borders          |
| Accent         | `--color-accent`       | `#7A1E1E`  | Primary buttons, focus rings, emphasis    |
| Accent hover   | `--color-accent-hover` | `#5E1717`  | Hover/active state for accent surfaces    |
| State: draft   | `--color-state-draft`  | `#A6791C`  | Muted amber — pending/draft indicators    |
| State: current | `--color-state-current`| `#3F6B47`  | Desaturated green — approved/current      |

State colors are **for state indicators only** — never for decoration, never for accent surfaces.

---

## Typography

- **Headlines:** [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) — editorial serif, designed for long-form reading. Tight line-height (1.15), regular weight for most headings, semibold (600) for `h1`.
- **Body & UI:** [Inter](https://fonts.google.com/specimen/Inter) — humanist sans, excellent screen legibility. Regular (400) for body, medium (500) for UI labels and buttons. Body line-height 1.65.
- **Mono:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — for IDs, timestamps, code snippets, anything where alignment matters.

### Type scale (1.250 ratio, 16px base)

| Token       | Size   | Use                          |
| ----------- | ------ | ---------------------------- |
| `text-xs`   | 12px   | Captions, footer, mono meta  |
| `text-sm`   | 14px   | UI labels, secondary body    |
| `text-base` | 16px   | Body                         |
| `text-lg`   | 20px   | Lead paragraph, h4           |
| `text-xl`   | 25px   | h3                           |
| `text-2xl`  | 31px   | h2                           |
| `text-3xl`  | 39px   | h1                           |

---

## Spacing & Layout

- **Grid:** 8px base. Use Tailwind's spacing scale (`p-2`, `p-4`, `p-6`, `p-8`) — these align to the 8px grid.
- **Reading width:** content max ~`max-w-2xl` (~672px) for prose-heavy pages (topic detail, guidance, rationale). List/dashboard pages go up to `max-w-4xl`.
- **Page padding:** `px-6 py-12` minimum on mobile, more breathing room on desktop. The ivory negative space is doing aesthetic work — don't crowd it.
- **Dividers:** prefer hairline rules (1px, `--color-rule`) between sections over wrapping each section in a card. Cards are for things that need to feel separable (a topic in a list, a form on a page); rules are for things that belong together but need rhythm.

---

## Component Voice

### Buttons
- **Primary:** oxblood background, ivory text, `rounded-sm` (2px), no shadow, no gradient. Hover darkens to `--color-accent-hover`.
- **Secondary:** transparent with `--color-ink` border (1px), ink text. Hover fills with a faint ink wash.
- **Ghost:** ink text, no border, hover underline. For low-emphasis inline actions.
- Padding: `px-4 py-2` for default, `px-3 py-1.5` for compact. Font weight 500.

### Inputs
- Surface white on ivory page, hairline `--color-rule` border, `rounded-sm`.
- Focus: 2px ring in `--color-accent` at 30% opacity, plus accent border.
- Labels: `text-sm`, ink, medium weight, sit above the input with `mb-1.5`.
- Helper/error text: `text-xs`, muted ink (helper) or accent (error), below input.

### Header
- Serif wordmark "Paramedic Learnings", no logo mark yet. Bottom border = hairline rule.
- Navigation links (when added): sans, medium, ink-muted by default, ink on hover. No pill backgrounds.

### Footer
- `text-xs` mono, `--color-ink-subtle`. Reads like a journal colophon.

### Cards (lists)
- Surface white on ivory, hairline border, `rounded-sm`, no shadow.
- Title in serif, meta in mono. Hover: border darkens slightly (no lift, no scale).

---

## What we are NOT doing

- ❌ Gradients, glassmorphism, blurred shapes
- ❌ Drop shadows on cards or buttons
- ❌ Rounded-2xl pill buttons
- ❌ Emoji as iconography
- ❌ Purple-to-pink anything
- ❌ Dark mode
- ❌ Decorative use of state colors (amber/green appear *only* in state indicators)
- ❌ "Tech startup" sans-serifs (Geist, Space Grotesk, Satoshi)
- ❌ Multiple accent colors

---

## Implementation

The theme is implemented in:

- `src/app/globals.css` — CSS custom properties under `@theme inline`, plus base typography
- `src/app/layout.tsx` — font loading (Source Serif 4, Inter, JetBrains Mono), wordmark, footer
- Component-level utility classes in Tailwind throughout

When adding a new component or page, refer back to this document. If you find yourself reaching for a color, weight, or pattern that isn't here, that's a signal to either (a) use what *is* here, or (b) propose an extension to this document before adding it.
