# Warm Studio

A warm, light, professional design system for the Video Manager desktop app — inspired by the soft amber glow of a physical editing studio.

## Overview

Warm Studio is a light theme built around warm off-white backgrounds and amber accents. It's designed to feel like a creative workspace: warm and inviting rather than cold and sterile. The content — video thumbnails, project cards, resource grids — is always the hero, with the UI framing it cleanly.

## Colors

### Brand Palette

| Token     | Hex       | Role                                        |
| --------- | --------- | ------------------------------------------- |
| Primary   | `#D97706` | Amber — accents, buttons, interactive       |
| Primary Hover | `#B45309` | Darker amber — hover states            |
| Background | `#FAFAF8` | Warm off-white — main page background       |
| Card       | `#FFFFFF` | Pure white — cards, panels, popovers        |
| Muted      | `#F3F1EE` | Warm light gray — subtle backgrounds        |

### Content Palette

| Token             | Hex       | Role                           |
| ----------------- | --------- | ------------------------------ |
| Foreground        | `#1C1917` | Warm near-black — body text    |
| Muted Foreground  | `#78716C` | Warm gray — secondary text     |
| Border            | `#E3DFDA` | Warm beige-gray — borders      |
| Input             | `#E3DFDA` | Same — input border            |

### Semantic Colors

| Token       | Hex       | Role                          |
| ----------- | --------- | ----------------------------- |
| Success     | `#16A34A` | Used status, affirmative      |
| Destructive | `#DC2626` | Delete actions, errors        |

## Typography

### Font Stack

| Role        | Font                                            |
| ----------- | ----------------------------------------------- |
| UI/Body     | Inter, ui-sans-serif, system-ui, sans-serif      |
| Mono/Code   | JetBrains Mono, ui-monospace, SFMono-Regular, monospace |

### Type Scale

| Level      | Size  | Weight | Line Height | Usage                         |
| ---------- | ----- | ------ | ----------- | ----------------------------- |
| Title      | 18px  | 700    | 1.4         | Project titles (inline input) |
| Body       | 14px  | 400    | 1.5         | Default UI, cards             |
| Body Small | 12px  | 400    | 1.5         | File size, metadata           |
| Caption    | 11px  | 500    | 1.4         | Tags, badges                  |
| Overline   | 10px  | 600    | 1.3         | Tag pills                     |

## Spacing

| Property                   | Value                                    |
| -------------------------- | ---------------------------------------- |
| Base unit                  | 8px                                      |
| Scale                      | 2, 4, 8, 12, 16, 24, 32, 48, 64         |
| Component padding — card   | 12px                                     |
| Section spacing            | 24–32px                                  |
| Grid gap                   | 16px                                     |

## Border Radius

| Token  | Value  | Usage                    |
| ------ | ------ | ------------------------ |
| Default | 6px   | Cards, buttons, inputs   |
| Full   | 9999px | Pills, selection toolbar |

## Shadows

Shadows are subtle — hierarchy comes from borders and spacing, not elevation.

| Level   | CSS Value                                         |
| ------- | ------------------------------------------------- |
| Card    | `0 1px 2px 0 rgb(0 0 0 / 0.05)`                  |

## Components

### Buttons

**Primary**
- Background: `#D97706`, Text: `#FFFFFF`, Radius: 6px
- Padding: 8px 16px, Font: Inter 14px 500
- Hover: Background `#B45309`

**Secondary / Outline**
- Background: transparent, Border: `1px solid #E3DFDA`, Text: `#1C1917`
- Hover: Background `#F3F1EE`

**Ghost**
- Background: transparent, Text: `#1C1917`
- Hover: Text `#D97706`

**Destructive**
- Background: `#DC2626`, Text: `#FFFFFF`

### Cards

- Background: `#FFFFFF`, Border: `1px solid #E3DFDA`, Radius: 6px
- Hover: Border `#D97706` at 50% opacity (via `hover:border-primary/50`)

### Inputs

- Height: 36px, Background: transparent, Border: `1px solid #E3DFDA`, Radius: 6px
- Focus: Border `#D97706`, Ring `0 0 0 3px rgb(217 119 6 / 0.25)`
- Placeholder: `#78716C`

### Tags/Pills

- **Default:** Background `#D97706` at 15% opacity, Text `#D97706`, 10px font
- **Time tags:** Background `chart-3` (purpleish) at 20% opacity, Text chart-3

### Status Badge

- **Used:** Background `#16A34A` at 90%, Text white
- **Unused:** Background white at 90%, Border `#E3DFDA`, Text muted

## Layout

The app uses a sidebar + tabs layout:
- **Sidebar:** Collapsible left panel showing open projects (toggled via hamburger in the tab bar)
- **Tab bar:** Top bar with project logo, opened project tabs, and new project button
- **Content:** Scrollable main area filling the remaining space

## Do's and Don'ts

1. **Do** keep backgrounds off-white (`#FAFAF8`) rather than pure white — it reduces eye strain and gives the app a warm character.
2. **Don't** use shadows aggressively — the design is flat with borders for structure.
3. **Do** use amber (`#D97706`) sparingly as an accent for interactive elements.
4. **Don't** introduce blue or purple as dominant colors — the warm palette is the identity.
5. **Do** make thumbnails and media content the visual focus of cards.
6. **Don't** use more than three font sizes on a card — title, metadata, tags is enough.
7. **Do** show clear loading states (skeleton placeholders) when data is fetching.
8. **Do** show empty states with guidance when no data exists yet.
9. **Don't** use native browser dialogs (`confirm()`, `alert()`) — use the app's themed dialog components.
10. **Do** notify users with toasts when mutations succeed or fail.
