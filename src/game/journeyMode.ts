// Journey Mode for Silk Spider Solitaire
// Curated progressive deals across 5 chapters, 100 levels total.

import { Difficulty } from './gameEngine';

export interface JourneyLevel {
  id: number; // 1-100
  chapter: number; // 1-5
  title: string;
  seed: number; // deterministic seed for this level
  difficulty: Difficulty;
  parMoves: number; // target moves for 3-star rating
  description?: string;
}

export interface JourneyChapter {
  id: number;
  name: string;
  subtitle: string;
  icon: string;
  levels: JourneyLevel[];
}

export interface JourneyProgress {
  completedLevels: Record<number, JourneyLevelResult>;
  currentChapter: number;
  currentLevel: number;
}

export interface JourneyLevelResult {
  completed: boolean;
  moves: number;
  timeSeconds: number;
  stars: number; // 1-3
}

// Helper: linearly interpolate par moves across a chapter's levels
function generateLevels(
  chapterId: number,
  startId: number,
  count: number,
  seedStart: number,
  difficulty: Difficulty | Difficulty[],
  parStart: number,
  parEnd: number,
  chapterName: string
): JourneyLevel[] {
  const levels: JourneyLevel[] = [];
  for (let i = 0; i < count; i++) {
    const levelId = startId + i;
    const t = count > 1 ? i / (count - 1) : 0;
    const parMoves = Math.round(parStart + (parEnd - parStart) * t);
    const levelDifficulty = Array.isArray(difficulty) ? difficulty[i] : difficulty;
    levels.push({
      id: levelId,
      chapter: chapterId,
      title: `${chapterName} ${i + 1}`,
      seed: seedStart + i,
      difficulty: levelDifficulty,
      parMoves,
    });
  }
  return levels;
}

// Chapter 2 difficulty progression: first 14 levels are 1-suit, last 6 are 2-suit
const CHAPTER_2_DIFFICULTIES: Difficulty[] = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2,
];

// Chapter 4 difficulty progression: first 14 levels are 2-suit, last 6 are 4-suit
const CHAPTER_4_DIFFICULTIES: Difficulty[] = [
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4,
];

/**
 * All journey chapters with their levels.
 */
export const ALL_CHAPTERS: JourneyChapter[] = [
  {
    id: 1,
    name: 'First Threads',
    subtitle: 'Learn the basics of Spider Solitaire',
    icon: '🧵',
    levels: generateLevels(1, 1, 20, 1001, 1, 120, 90, 'First Threads'),
  },
  {
    id: 2,
    name: 'Pattern Maker',
    subtitle: 'Master single suit and begin two-suit challenges',
    icon: '🎨',
    levels: generateLevels(2, 21, 20, 2001, CHAPTER_2_DIFFICULTIES, 110, 100, 'Pattern Maker'),
  },
  {
    id: 3,
    name: 'Tangled Web',
    subtitle: 'Navigate complex two-suit puzzles',
    icon: '🕸️',
    levels: generateLevels(3, 41, 20, 3001, 2, 150, 120, 'Tangled Web'),
  },
  {
    id: 4,
    name: 'Master Weaver',
    subtitle: 'Push your skills with advanced puzzles',
    icon: '👑',
    levels: generateLevels(4, 61, 20, 4001, CHAPTER_4_DIFFICULTIES, 160, 140, 'Master Weaver'),
  },
  {
    id: 5,
    name: 'The Golden Loom',
    subtitle: 'The ultimate four-suit challenge',
    icon: '✨',
    levels: generateLevels(5, 81, 20, 5001, 4, 220, 180, 'The Golden Loom'),
  },
];

// Flat lookup map for quick level access
const LEVEL_MAP: Map<number, JourneyLevel> = new Map();
for (const chapter of ALL_CHAPTERS) {
  for (const level of chapter.levels) {
    LEVEL_MAP.set(level.id, level);
  }
}

/**
 * Create a fresh journey progress object.
 */
export function createDefaultJourneyProgress(): JourneyProgress {
  return {
    completedLevels: {},
    currentChapter: 1,
    currentLevel: 1,
  };
}

/**
 * Get a journey level by its ID (1-100).
 */
export function getJourneyLevel(levelId: number): JourneyLevel | undefined {
  return LEVEL_MAP.get(levelId);
}

/**
 * Calculate stars earned based on moves vs par.
 * - moves <= parMoves: 3 stars
 * - moves <= parMoves * 1.3: 2 stars
 * - else: 1 star
 */
function calculateStars(moves: number, parMoves: number): number {
  if (moves <= parMoves) return 3;
  if (moves <= parMoves * 1.3) return 2;
  return 1;
}

/**
 * Complete a journey level and return updated progress.
 * Keeps the best result if the level was previously completed.
 */
export function completeJourneyLevel(
  progress: JourneyProgress,
  levelId: number,
  moves: number,
  timeSeconds: number
): JourneyProgress {
  const level = getJourneyLevel(levelId);
  if (!level) return progress;

  const stars = calculateStars(moves, level.parMoves);

  const existing = progress.completedLevels[levelId];
  const newResult: JourneyLevelResult = {
    completed: true,
    moves,
    timeSeconds,
    stars,
  };

  // Keep best result (highest stars, then fewest moves, then fastest time)
  let bestResult = newResult;
  if (existing && existing.completed) {
    if (
      existing.stars > stars ||
      (existing.stars === stars && existing.moves < moves) ||
      (existing.stars === stars && existing.moves === moves && existing.timeSeconds < timeSeconds)
    ) {
      bestResult = existing;
    }
  }

  const updatedLevels = {
    ...progress.completedLevels,
    [levelId]: bestResult,
  };

  // Advance current level/chapter pointers
  let nextChapter = progress.currentChapter;
  let nextLevel = progress.currentLevel;

  // If completing the current level, advance to next
  if (levelId === progress.currentLevel) {
    const nextLevelCandidate = getNextUncompletedLevel(updatedLevels, levelId);
    if (nextLevelCandidate) {
      nextLevel = nextLevelCandidate.id;
      nextChapter = nextLevelCandidate.chapter;
    }
  }

  return {
    completedLevels: updatedLevels,
    currentChapter: nextChapter,
    currentLevel: nextLevel,
  };
}

/**
 * Find the next uncompleted level after the given levelId.
 */
function getNextUncompletedLevel(
  completedLevels: Record<number, JourneyLevelResult>,
  afterLevelId: number
): JourneyLevel | null {
  // Look through all levels in order
  for (const chapter of ALL_CHAPTERS) {
    if (!isChapterUnlockedByCompletedLevels(completedLevels, chapter.id)) continue;
    for (const level of chapter.levels) {
      if (level.id <= afterLevelId) continue;
      if (!completedLevels[level.id]?.completed) {
        return level;
      }
    }
  }
  return null;
}

/**
 * Get progress summary for a specific chapter.
 */
export function getChapterProgress(
  progress: JourneyProgress,
  chapterId: number
): { completed: number; total: number; stars: number; maxStars: number } {
  const chapter = ALL_CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) {
    return { completed: 0, total: 0, stars: 0, maxStars: 0 };
  }

  let completed = 0;
  let stars = 0;
  const total = chapter.levels.length;
  const maxStars = total * 3;

  for (const level of chapter.levels) {
    const result = progress.completedLevels[level.id];
    if (result?.completed) {
      completed++;
      stars += result.stars;
    }
  }

  return { completed, total, stars, maxStars };
}

/**
 * Check if a chapter is unlocked.
 * Chapter 1 is always unlocked.
 * Chapter N is unlocked when chapter N-1 has at least 15/20 levels completed.
 */
export function isChapterUnlocked(
  progress: JourneyProgress,
  chapterId: number
): boolean {
  if (chapterId <= 1) return true;

  const prevChapterProgress = getChapterProgress(progress, chapterId - 1);
  return prevChapterProgress.completed >= 15;
}

/**
 * Internal helper to check chapter unlock from raw completed levels map.
 */
function isChapterUnlockedByCompletedLevels(
  completedLevels: Record<number, JourneyLevelResult>,
  chapterId: number
): boolean {
  if (chapterId <= 1) return true;

  const prevChapter = ALL_CHAPTERS.find((c) => c.id === chapterId - 1);
  if (!prevChapter) return false;

  let completed = 0;
  for (const level of prevChapter.levels) {
    if (completedLevels[level.id]?.completed) {
      completed++;
    }
  }
  return completed >= 15;
}

/**
 * Get the next level to play based on current progress.
 * Returns the first uncompleted level in the earliest unlocked chapter,
 * or null if all levels are complete.
 */
export function getNextLevel(progress: JourneyProgress): JourneyLevel | null {
  for (const chapter of ALL_CHAPTERS) {
    if (!isChapterUnlocked(progress, chapter.id)) continue;
    for (const level of chapter.levels) {
      if (!progress.completedLevels[level.id]?.completed) {
        return level;
      }
    }
  }
  return null;
}
