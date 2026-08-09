# Icon & Asset Generation Guide

## Required PNG exports from SVG source files

Before building, export these SVGs to PNG at the correct sizes.
You can use any SVG editor (Inkscape, Figma, or an online tool like svg2png.com).

### App Icon
- **Source:** `assets/icon.svg`
- **Export:** `assets/icon.png` at **1024×1024 px**
- Used as the standard app icon on all platforms

### Adaptive Icon Foreground (Android)
- **Source:** `assets/icon-foreground.svg`
- **Export:** `assets/adaptive-icon.png` at **1024×1024 px**
- The system will mask this with various shapes (circle, squircle, etc.)
- Keep important content within the central 66% (672×672 px safe zone)
- Background color is set in app.json: `#071D18` (dark green)

### Splash Screen
- **Source:** `assets/splash.svg`
- **Export:** `assets/splash.png` at **1284×2778 px** (iPhone 14 Pro Max size)
- Expo will scale/crop for other devices

## Quick export using Node.js (optional)

If you have `sharp` installed:

```bash
npm install --save-dev sharp
node scripts/generate-icons.js
```

## Quick export using Inkscape CLI

```bash
inkscape assets/icon.svg --export-type=png --export-filename=assets/icon.png -w 1024 -h 1024
inkscape assets/icon-foreground.svg --export-type=png --export-filename=assets/adaptive-icon.png -w 1024 -h 1024
inkscape assets/splash.svg --export-type=png --export-filename=assets/splash.png -w 1284 -h 2778
```

## Quick export using browser

1. Open each SVG in Chrome
2. Right-click → Save image as PNG
3. Resize to required dimensions using any image editor
