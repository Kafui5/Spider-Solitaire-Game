# Start Here: Continue Silk Spider Solitaire with Kiro CLI

This ZIP contains the complete editable source code, project configuration,
tests, Android release configuration, and the development prompt for Kiro CLI.

## 1. Extract the ZIP

On Windows, right-click the ZIP, select **Extract All**, and choose a location
such as:

```text
C:\Users\YourName\Documents\SilkSpiderSolitaire
```

The folder containing `package.json`, `App.tsx`, and this file is the project
folder.

## 2. Open the project in Kiro CLI

Open PowerShell or Windows Terminal and run:

```powershell
cd "C:\Users\YourName\Documents\SilkSpiderSolitaire"
npm install
kiro-cli
```

Kiro automatically uses the current project directory as context.

## 3. Paste this development prompt into Kiro

```text
You are continuing development of Silk Spider Solitaire, an original
Spider Solitaire mobile application built with Expo, React Native and
TypeScript.

Begin by reading:
- START_HERE_KIRO.md
- README.md
- App.tsx
- app.json
- eas.json
- src/game/gameEngine.ts
- src/game/gameEngine.test.ts
- src/components/GameBoard.tsx
- src/components/PlayingCard.tsx
- src/components/StartScreen.tsx
- src/storage.ts
- src/theme.ts

Before changing anything:

1. Explain the current project architecture.
2. Run:
   npm run typecheck
   npm test
   npx expo-doctor
3. Report any issues found.

The current milestone is to improve the playable prototype.

Implement the following carefully:

1. Add smooth drag-and-drop card movement while preserving tap-to-move.
2. Allow only legal same-suit descending sequences to move together.
3. Animate card movement, stock dealing and completed King-to-Ace runs.
4. Give subtle visual feedback for illegal moves.
5. Preserve one-, two- and four-suit difficulty levels.
6. Preserve undo, hints, saved games, timer and move counter.
7. Keep the interface responsive on Android phones and tablets.
8. Maintain the dark green, gold, terracotta and indigo visual identity.
9. Preserve accessibility labels and tap controls.
10. Add or update tests for all changed game behaviour.

Important constraints:

- Do not copy Microsoft Solitaire artwork, sounds or interface assets.
- Do not add gambling, betting or real-money features.
- Do not add advertisements, subscriptions, analytics or user accounts yet.
- Do not replace the existing rules engine unless a verified defect requires it.
- Use packages compatible with the installed Expo SDK.
- Keep the Android package name com.greenmidori.silkspider.
- Make changes in small, testable stages.
- Run type-checking, tests and Expo Doctor after implementation.
- Do not declare the work complete while tests or validation checks are failing.

First inspect the project and present your implementation plan. Then proceed
with the first milestone.
```

## 4. Preview the app

From inside Kiro, run a shell command by placing `!` before it:

```text
!npx expo start
```

Install Expo Go on the Android test phone and scan the displayed QR code. The
computer and phone should normally be connected to the same network.

## 5. Useful checks

```text
!npm run typecheck
!npm test
!npx expo-doctor
```

## 6. Resume work later

Open a terminal in the same project folder and run:

```powershell
kiro-cli chat --resume
```

## Current project status

- Standard 104-card Spider game engine implemented
- One-, two-, and four-suit modes implemented
- Tap-to-move implemented
- Stock dealing and empty-column restriction implemented
- Completed King-to-Ace runs collected automatically
- Undo, hint, timer, move count, win state, and saved games implemented
- Responsive Android/tablet interface implemented
- Expo validation and automated rules-engine tests passing
- Drag-and-drop, sound, richer animations, final artwork, preview APK, and
  Play Store submission remain for later milestones
