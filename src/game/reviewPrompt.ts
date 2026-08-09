import AsyncStorage from '@react-native-async-storage/async-storage';

const REVIEW_STORAGE_KEY = '@silk-spider/review-v1';

export interface ReviewState {
  winsCount: number;
  hasBeenPrompted: boolean;
  promptedAt: number | null;
  dismissed: boolean;
}

/**
 * Create the default review state for new players.
 */
export function createDefaultReviewState(): ReviewState {
  return {
    winsCount: 0,
    hasBeenPrompted: false,
    promptedAt: null,
    dismissed: false,
  };
}

/**
 * Load the review state from AsyncStorage.
 * Returns default state if nothing is stored.
 */
export async function loadReviewState(): Promise<ReviewState> {
  try {
    const raw = await AsyncStorage.getItem(REVIEW_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ReviewState;
    }
  } catch {
    // If loading fails, return default state
  }
  return createDefaultReviewState();
}

/**
 * Save the review state to AsyncStorage.
 */
export async function saveReviewState(state: ReviewState): Promise<void> {
  await AsyncStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(state));
}

/**
 * Record a win for review prompt tracking.
 * Only call this when a game ends with 'won' status.
 */
export function recordWinForReview(state: ReviewState): ReviewState {
  return {
    ...state,
    winsCount: state.winsCount + 1,
  };
}

/**
 * Determine if the review prompt should be shown.
 * True only when the player has 3+ wins AND has not been prompted before.
 */
export function shouldPromptReview(state: ReviewState): boolean {
  return state.winsCount >= 3 && !state.hasBeenPrompted && !state.dismissed;
}

/**
 * Mark that the review prompt has been shown to the player.
 */
export function markReviewPrompted(state: ReviewState): ReviewState {
  return {
    ...state,
    hasBeenPrompted: true,
    promptedAt: Date.now(),
  };
}

/**
 * Mark that the player dismissed the review prompt.
 * Ensures the prompt is never shown again.
 */
export function markReviewDismissed(state: ReviewState): ReviewState {
  return {
    ...state,
    dismissed: true,
  };
}
