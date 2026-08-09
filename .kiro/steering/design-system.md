# Design System — Silk Spider Solitaire

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Ink | #07130F | Deepest backgrounds, text on gold |
| Background | #071D18 | Main app background |
| Felt | #0D3B2E | Game board surface |
| Felt Light | #12513E | Hover/press states on felt |
| Gold | #E6B95C | Primary accent, buttons, highlights |
| Gold Soft | #F3D58F | Secondary gold, subtle highlights |
| Clay | #C96842 | Warm accent, terracotta |
| Indigo | #293261 | Card backs, secondary dark accent |
| Cream | #FFF8E9 | Primary text, card faces |
| Paper | #FFFDF6 | Card face background |
| Muted | #AFC8BE | Secondary text, labels |
| Red | #B5313C | Red suits (hearts, diamonds) |
| Black | #17201C | Black suits (spades, clubs) |
| Success | #73D2A1 | Positive feedback, hints |

## Visual Identity

- **Inspiration**: Woven textiles, silk craft, West African kente cloth
- **Mood**: Calm, focused, premium, handcrafted
- **Kente strip**: Gold → Clay → Indigo → Gold → Clay (5-band horizontal accent)
- **Spider web**: Subtle gold-line SVG patterns as decorative elements
- **Card backs**: Woven diamond patterns, not photographic

## Typography

- System fonts only (no custom font loading for performance)
- Weights: 800-900 for headings, 700 for labels, normal for body
- Letter-spacing: 1-2.5 for uppercase labels
- Tabular-nums variant for statistics/counters

## Component Patterns

- **Modals**: Dark backdrop (rgba 0.92-0.97), rounded container (20px), gold border for premium, muted border for standard
- **Buttons**: Gold fill for primary action, outlined/muted for secondary
- **Cards**: Paper background, 1px border, 0.1× width border-radius
- **Sections**: Separated by #1C4C3E borders
- **Progress bars**: Gold fill on dark track

## Animation Principles

- Spring physics for card movement (damping: 15-20, stiffness: 200)
- 250-350ms for transitions
- Staggered delays for sequential items (30-50ms per item)
- Respect system reduced-motion preference
- Haptics complement animations (light/medium/heavy)

## Accessibility Requirements

- All interactive elements have accessibilityLabel
- Minimum touch target: 44×44px
- Color is never the only differentiator (use shapes for color-blind mode)
- Support for screen readers
- Adjustable card size (small/medium/large)
