// Share Results System for Silk Spider Solitaire
// Generates shareable text blocks (like Wordle) and structured data for share cards.

import { Difficulty } from './gameEngine';

export interface ShareResult {
  type: 'daily' | 'win' | 'record' | 'achievement' | 'mastery';
  title: string;
  subtitle: string;
  callToAction: string;
  textBlock: string;
  emoji: string;
  url: string;
}

const DAILY_LOOM_EPOCH = '2026-08-01';
const APP_URL = 'silkspider.app';

// Par moves per difficulty for daily challenges
const DAILY_PAR: Record<Difficulty, number> = {
  1: 100,
  2: 140,
  4: 200,
};

/**
 * Calculate the Daily Loom number (days since 2026-08-01, starting at 1).
 */
export function getDailyLoomNumber(dateString: string): number {
  const epoch = new Date(DAILY_LOOM_EPOCH + 'T00:00:00Z');
  const target = new Date(dateString + 'T00:00:00Z');
  const diffMs = target.getTime() - epoch.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

/**
 * Format seconds into 'M:SS' or 'H:MM:SS'.
 */
export function formatTimeForShare(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Get a human-readable label for difficulty.
 */
export function difficultyLabel(difficulty: Difficulty): string {
  switch (difficulty) {
    case 1:
      return '1 suit';
    case 2:
      return '2 suits';
    case 4:
      return '4 suits';
  }
}

/**
 * Generate efficiency emoji visualization for daily results.
 * - perfect (<=par): 8 gold threads 🧵
 * - excellent: 7 threads + 1 green ✅
 * - good: 6 threads
 * - average: 5 threads
 * - below: 4 threads
 */
function generateDailyEmoji(moves: number, difficulty: Difficulty): string {
  const par = DAILY_PAR[difficulty];
  const ratio = moves / par;

  if (ratio <= 1.0) {
    // Perfect - 8 gold threads
    return '🧵🧵🧵🧵🧵🧵🧵🧵';
  } else if (ratio <= 1.15) {
    // Excellent - 7 threads + 1 green check
    return '🧵🧵🧵🧵🧵🧵🧵✅';
  } else if (ratio <= 1.3) {
    // Good - 6 threads
    return '🧵🧵🧵🧵🧵🧵';
  } else if (ratio <= 1.5) {
    // Average - 5 threads
    return '🧵🧵🧵🧵🧵';
  } else {
    // Below - 4 threads
    return '🧵🧵🧵🧵';
  }
}

/**
 * Generate a shareable result for a daily challenge completion.
 */
export function generateDailyShareResult(
  dateString: string,
  difficulty: Difficulty,
  moves: number,
  timeSeconds: number
): ShareResult {
  const loomNumber = getDailyLoomNumber(dateString);
  const time = formatTimeForShare(timeSeconds);
  const label = difficultyLabel(difficulty);
  const emoji = generateDailyEmoji(moves, difficulty);

  const title = `Daily Loom #${loomNumber}`;
  const subtitle = `${label} · ${moves} moves · ${time}`;
  const callToAction = 'Can you weave it better?';
  const url = `${APP_URL}/daily`;

  const textBlock = [
    `🕷️ Silk Spider · ${title}`,
    `✅ ${subtitle}`,
    emoji,
    callToAction,
    url,
  ].join('\n');

  return {
    type: 'daily',
    title,
    subtitle,
    callToAction,
    textBlock,
    emoji,
    url,
  };
}

/**
 * Generate a shareable result for a regular game win.
 */
export function generateWinShareResult(
  difficulty: Difficulty,
  moves: number,
  timeSeconds: number,
  isPersonalBest: boolean
): ShareResult {
  const time = formatTimeForShare(timeSeconds);
  const label = difficultyLabel(difficulty);
  const pbIndicator = isPersonalBest ? ' 🏆 New PB!' : '';

  const title = `Silk Spider Victory${pbIndicator}`;
  const subtitle = `${label} · ${moves} moves · ${time}`;
  const callToAction = 'Think you can do better?';
  const url = `${APP_URL}/play`;

  const emoji = isPersonalBest
    ? '🕷️✨🏆✨🕷️'
    : '🕷️✨🎉✨🕷️';

  const textBlock = [
    `🕷️ ${title}`,
    `✅ ${subtitle}`,
    emoji,
    callToAction,
    url,
  ].join('\n');

  return {
    type: isPersonalBest ? 'record' : 'win',
    title,
    subtitle,
    callToAction,
    textBlock,
    emoji,
    url,
  };
}

/**
 * Generate a shareable result for unlocking an achievement.
 */
export function generateAchievementShareResult(
  achievementName: string,
  achievementIcon: string
): ShareResult {
  const title = 'Achievement Unlocked!';
  const subtitle = `${achievementIcon} ${achievementName}`;
  const callToAction = 'How many can you unlock?';
  const url = `${APP_URL}/play`;
  const emoji = `${achievementIcon}✨${achievementIcon}`;

  const textBlock = [
    `🕷️ Silk Spider · ${title}`,
    `${subtitle}`,
    emoji,
    callToAction,
    url,
  ].join('\n');

  return {
    type: 'achievement',
    title,
    subtitle,
    callToAction,
    textBlock,
    emoji,
    url,
  };
}

/**
 * Generate a shareable result for reaching a mastery rank.
 */
export function generateMasteryShareResult(
  rank: string,
  difficulty: Difficulty
): ShareResult {
  const label = difficultyLabel(difficulty);
  const title = `Mastery: ${rank}`;
  const subtitle = `${label} mastery rank achieved`;
  const callToAction = 'Can you reach this rank?';
  const url = `${APP_URL}/play`;
  const emoji = '👑🕷️👑';

  const textBlock = [
    `🕷️ Silk Spider · ${title}`,
    `👑 ${subtitle}`,
    emoji,
    callToAction,
    url,
  ].join('\n');

  return {
    type: 'mastery',
    title,
    subtitle,
    callToAction,
    textBlock,
    emoji,
    url,
  };
}
