# Game Rules — Silk Spider Solitaire

## Standard Spider Solitaire Rules

### Setup
- 104 cards (8 suits × 13 ranks), shuffled and dealt
- 10 tableau columns: first 4 get 6 cards, remaining 6 get 5 cards
- Only the top card of each column starts face-up
- 50 remaining cards form the stock (5 deals of 10)

### Legal Moves
- Any face-up card can move to an empty column
- A face-up card can move onto a card exactly one rank higher (any suit)
- A same-suit descending sequence can move as a group
- Only same-suit descending groups move together (not mixed-suit stacks)

### Stock Dealing
- Deals 1 card face-up to each of the 10 columns
- Cannot deal if any column is empty (must fill all spaces first)
- 5 deals available (50 cards total)

### Completing a Run
- A face-up King-to-Ace same-suit sequence (13 cards) auto-collects
- 8 completed runs = game won

### Difficulty Modes
- **1 suit** (Calm): All 104 cards are spades — every move is same-suit
- **2 suits** (Clever): 52 spades + 52 hearts — requires careful suit management
- **4 suits** (Master): 26 of each suit — the full strategic challenge

## Custom Rules (Silk Spider specific)

### Undo
- Unlimited undo available at all times
- Undo costs 1 Silk Thread per 3 uses (in the reward calculation, not gameplay)
- Undo is never locked or limited

### Hints
- Highlights the best available move
- Uses same-suit preference, reveal priority, and non-empty-target preference
- Always available, never locked

### Auto-Complete
- Triggers when all cards are face-up and stock is empty
- Player can decline and continue manually
- Auto-complete still counts as a valid win

### Daily Loom
- Same seed for all players each day (seeded from UTC date)
- Difficulty rotates: Mon/Thu=1 suit, Tue/Fri=2 suits, Wed/Sat/Sun=4 suits
- Completion is tracked but missing a day never penalizes
