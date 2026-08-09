# Store Graphics & Screenshots Guide

## Required Assets for Google Play

### 1. App Icon (✅ Ready)
- **Size:** 512×512 px PNG (Google Play) — auto-generated from 1024×1024
- **Source:** `assets/icon.svg` → export as `assets/icon.png` at 1024×1024

### 2. Feature Graphic (Required)
- **Size:** 1024×500 px
- **Format:** PNG or JPG, no transparency
- **Content suggestion:**
  - Dark green gradient background (#071D18 → #0D3B2E)
  - Gold spade icon left of center
  - "Silk Spider Solitaire" title in cream (#FFF8E9)
  - Kente color accent strip (gold, clay, indigo)
  - Subtle spider web pattern in background
  - Tagline: "A classic, rewoven" in muted color
- **Save as:** `store-assets/feature-graphic.png`

### 3. Screenshots (4-8 required, 8 recommended)
- **Phone:** 16:9 or taller, min 320px, max 3840px on any side
- **Recommended:** 1080×1920 px (standard Android phone)
- **Tablet (optional):** 7-inch and 10-inch variants

#### Recommended screenshot sequence:
1. **Start screen** — Shows the app name, difficulty options, daily challenge
2. **Gameplay (1 suit)** — Easy mode, cards clearly visible, showing the calm layout
3. **Gameplay (drag in action)** — Card being dragged, showing drop zone highlight
4. **Hint active** — Green highlighted card showing hint system
5. **Daily Challenge header** — Showing "☀ DAILY" mode with date
6. **Statistics screen** — Showing win rate, streaks, per-difficulty stats
7. **Card Back Selector** — Showing all 5 beautiful card back designs
8. **Win screen** — Celebration particles, "You won!" message

#### Screenshot framing tips:
- Use a phone frame mockup (Pixel 7 or similar)
- Add a brief caption below each: one line, 3-5 words
- Background: match app's dark green (#071D18) or subtle gradient
- Keep text minimal — let the UI speak

### 4. Short Promo Video (Optional, recommended)
- **Length:** 30 seconds to 2 minutes
- **Content:** Show drag-and-drop gameplay, daily challenge, win celebration
- **Format:** YouTube link in store listing

## Design System Reference

| Color      | Hex       | Usage                    |
|------------|-----------|--------------------------|
| Ink        | #07130F   | Deepest background       |
| Background | #071D18   | Main background          |
| Felt       | #0D3B2E   | Game board               |
| Gold       | #E6B95C   | Primary accent           |
| Gold Soft  | #F3D58F   | Highlights               |
| Clay       | #C96842   | Warm accent              |
| Indigo     | #293261   | Card backs, secondary    |
| Cream      | #FFF8E9   | Primary text             |
| Muted      | #AFC8BE   | Secondary text           |

## File Checklist

```
store-assets/
├── STORE_LISTING.md        ✅ (title, descriptions, keywords)
├── GRAPHICS_GUIDE.md       ✅ (this file)
├── feature-graphic.png     ⬜ (create: 1024×500)
├── screenshot-01.png       ⬜ (start screen)
├── screenshot-02.png       ⬜ (gameplay 1 suit)
├── screenshot-03.png       ⬜ (drag in action)
├── screenshot-04.png       ⬜ (hint system)
├── screenshot-05.png       ⬜ (daily challenge)
├── screenshot-06.png       ⬜ (statistics)
├── screenshot-07.png       ⬜ (card backs)
└── screenshot-08.png       ⬜ (win screen)
```

## How to Capture Screenshots

1. Run the app on a device or emulator: `npx expo start`
2. Navigate to each screen
3. Take screenshots (power + volume down on Android)
4. Transfer to computer and crop to 1080×1920
5. Optional: add device frame + caption using a tool like:
   - https://mockuphone.com
   - https://screenshots.pro
   - Figma with device frame components
