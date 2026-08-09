# Silk Spider Solitaire

An original, offline-first Spider Solitaire app for Android, built with Expo and React Native.

If you are continuing this project with Kiro CLI, begin with
[`START_HERE_KIRO.md`](START_HERE_KIRO.md).

## Included in this prototype

- Standard Spider rules and 104-card deals
- One-, two-, and four-suit difficulty
- Tap a valid same-suit descending run, then tap its destination
- Five stock deals, with standard empty-column restriction
- Automatic K-to-A run collection
- Undo history, hints, timer, move count, and win state
- Automatic local game saving
- Responsive phone/tablet layout and an original woven visual identity

## Run locally

```bash
npm install
npm start
```

Then scan the QR code with Expo Go, or press `w` to open the web preview.

## Quality checks

```bash
npm run typecheck
npm test
```

## Android release path

When the prototype is approved, configure an Expo account and project, then run:

```bash
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

The production profile produces an Android App Bundle for Google Play. Store artwork, privacy disclosures, accessibility checks, device testing, and the final listing will be completed before submission.
