import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import type { CardBackId } from './src/cardBacks';
import { DEFAULT_CARD_BACK } from './src/cardBacks';
import { loadCardBack, saveCardBack } from './src/cardBackStorage';
import { GameBoard } from './src/components/GameBoard';
import { SpiderWeb } from './src/components/SpiderWeb';
import { StartScreen } from './src/components/StartScreen';
import { StatsScreen } from './src/components/StatsScreen';
import { CardBackSelector } from './src/components/CardBackSelector';
import { WinCelebration } from './src/components/WinCelebration';
import { RewardSummary } from './src/components/RewardSummary';
import { ProfileScreen } from './src/components/ProfileScreen';
import { AchievementsScreen } from './src/components/AchievementsScreen';
import { LoomGalleryScreen } from './src/components/LoomGalleryScreen';
import { ShopScreen } from './src/components/ShopScreen';
import { ChallengeCardPicker } from './src/components/ChallengeCardPicker';
import {
  canDeal,
  canMove,
  createGame,
  dealStock,
  findHint,
  isMovableRun,
  moveCards,
  type Difficulty,
  type GameState,
  type Hint,
  type MoveSelection,
} from './src/game/gameEngine';
import {
  type DailyChallenge,
  markChallengeComplete,
} from './src/game/dailyChallenge';
import {
  type GamePerformance,
  type GameReward,
  type PlayerProfile,
  calculateReward,
  applyReward,
  createDefaultProfile,
} from './src/game/rewards';
import {
  type PlayerMastery,
  addMasteryXP,
  createDefaultMastery,
} from './src/game/mastery';
import {
  type PlayerAchievements,
  checkAchievements,
  createDefaultAchievements,
} from './src/game/achievements';
import {
  type LoomGalleryState,
  autoContributeThreads,
  createDefaultGallery,
} from './src/game/loomGallery';
import { type ChallengeCard, checkChallengeComplete } from './src/game/challengeCards';
import { generateWebPattern } from './src/game/webPatterns';
import {
  type RewardsData,
  createDefaultRewardsData,
  loadRewardsData,
  saveRewardsData,
  addWebPattern,
} from './src/game/rewardsStorage';
import { hapticError, hapticHeavy, hapticLight, hapticMedium, hapticSuccess } from './src/haptics';
import { loadSavedGame, saveGame } from './src/storage';
import { colors } from './src/theme';
import {
  type PurchaseState,
  createDefaultPurchaseState,
  isPremium as checkIsPremium,
  isDifficultyAvailable,
  loadPurchaseState,
  recordPurchase,
  recordGameCompleted,
  useFourSuitTrial,
  fourSuitTrialsRemaining,
  shouldShowUpgradePrompt,
  savePurchaseState,
} from './src/monetization/premiumContext';
import type { ProductId } from './src/monetization/products';
import { initIAP, requestPurchase, restorePurchases, onPurchaseComplete, finishTransaction } from './src/monetization/iapService';
import { UpgradeScreen } from './src/components/UpgradeScreen';
import { SupporterPacks } from './src/components/SupporterPacks';

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

type Screen = 'home' | 'game' | 'challenge_pick';

export default function App() {
  // Core game state
  const [screen, setScreen] = useState<Screen>('home');
  const [game, setGame] = useState<GameState | null>(null);
  const [savedGame, setSavedGame] = useState<GameState | null>(null);
  const [history, setHistory] = useState<GameState[]>([]);
  const [selected, setSelected] = useState<MoveSelection | null>(null);
  const [hint, setHint] = useState<Hint | null>(null);
  const [now, setNow] = useState(Date.now());

  // Tracking in-game performance
  const [hintsUsed, setHintsUsed] = useState(0);
  const [undosUsed, setUndosUsed] = useState(0);
  const [sequenceStreaks, setSequenceStreaks] = useState(0);
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty>(1);

  // Reward system state
  const [rewardsData, setRewardsData] = useState<RewardsData>(createDefaultRewardsData());
  const [activeChallenge, setActiveChallenge] = useState<ChallengeCard | null>(null);

  // Modal visibility
  const [showStats, setShowStats] = useState(false);
  const [showCardBacks, setShowCardBacks] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showRewardSummary, setShowRewardSummary] = useState(false);
  const [showWinCelebration, setShowWinCelebration] = useState(false);

  // Reward summary data (set on win)
  const [lastReward, setLastReward] = useState<GameReward | null>(null);
  const [lastPerformance, setLastPerformance] = useState<GamePerformance | null>(null);
  const [lastNewAchievements, setLastNewAchievements] = useState<Array<{ achievement: any }>>([]);
  const [lastGalleryContributions, setLastGalleryContributions] = useState<Array<{ artworkId: string; threads: number; artworkCompleted: boolean }>>([]);
  const [lastChallengeCompleted, setLastChallengeCompleted] = useState(false);

  // Phase 2 state
  const [cardBack, setCardBack] = useState<CardBackId>(DEFAULT_CARD_BACK);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [dailyChallengeInfo, setDailyChallengeInfo] = useState<DailyChallenge | null>(null);

  // Monetization state
  const [purchaseState, setPurchaseState] = useState<PurchaseState>(createDefaultPurchaseState());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSupporterPacks, setShowSupporterPacks] = useState(false);
  const userIsPremium = checkIsPremium(purchaseState);

  // --- Initialization ---
  useEffect(() => {
    loadSavedGame().then(setSavedGame).catch(() => setSavedGame(null));
    loadCardBack().then(setCardBack).catch(() => undefined);
    loadRewardsData().then(setRewardsData).catch(() => undefined);
    loadPurchaseState().then(setPurchaseState).catch(() => undefined);
    initIAP().catch(() => undefined);

    // Listen for completed purchases
    const unsubscribe = onPurchaseComplete(async (purchase) => {
      const productId = purchase.productId as ProductId;
      setPurchaseState((prev) => {
        const next = recordPurchase(prev, productId);
        savePurchaseState(next).catch(() => undefined);
        return next;
      });
      await finishTransaction(purchase);
      setShowUpgrade(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!game) return;
    if (!isDailyChallenge) {
      setSavedGame(game);
      saveGame(game).catch(() => undefined);
    }
  }, [game, isDailyChallenge]);

  useEffect(() => {
    if (!hint) return;
    const timeout = setTimeout(() => setHint(null), 2200);
    return () => clearTimeout(timeout);
  }, [hint]);

  const elapsed = useMemo(() => {
    if (!game) return 0;
    return Math.max(0, Math.floor((now - game.startedAt) / 1000));
  }, [game, now]);

  // --- Game lifecycle ---
  function resetGameTracking() {
    setHintsUsed(0);
    setUndosUsed(0);
    setSequenceStreaks(0);
    setActiveChallenge(null);
    setShowWinCelebration(false);
    setShowRewardSummary(false);
  }

  function startGame(difficulty: Difficulty) {
    if (!isDifficultyAvailable(purchaseState, difficulty)) {
      setShowUpgrade(true);
      return;
    }
    // If 4-suit and not premium, consume a free trial
    if (difficulty === 4 && !userIsPremium) {
      setPurchaseState((prev) => {
        const next = useFourSuitTrial(prev);
        savePurchaseState(next).catch(() => undefined);
        return next;
      });
    }
    setPendingDifficulty(difficulty);
    if (userIsPremium) {
      setScreen('challenge_pick');
    } else {
      // Free users skip challenge cards — go straight to game
      const next = createGame(difficulty);
      setGame(next);
      setHistory([]);
      setSelected(null);
      setHint(null);
      setActiveChallenge(null);
      resetGameTracking();
      setIsDailyChallenge(false);
      setDailyChallengeInfo(null);
      setScreen('game');
    }
  }

  function beginGameWithChallenge(challenge: ChallengeCard | null) {
    const next = createGame(pendingDifficulty);
    setGame(next);
    setHistory([]);
    setSelected(null);
    setHint(null);
    setActiveChallenge(challenge);
    resetGameTracking();
    setIsDailyChallenge(false);
    setDailyChallengeInfo(null);
    setScreen('game');
  }

  function startDailyChallenge(challenge: DailyChallenge) {
    const next = createGame(challenge.difficulty, challenge.seed);
    setGame(next);
    setHistory([]);
    setSelected(null);
    setHint(null);
    resetGameTracking();
    setIsDailyChallenge(true);
    setDailyChallengeInfo(challenge);
    setScreen('game');
  }

  function continueGame() {
    if (!savedGame) return;
    setGame(savedGame);
    setHistory([]);
    resetGameTracking();
    setIsDailyChallenge(false);
    setDailyChallengeInfo(null);
    setScreen('game');
  }

  function commit(next: GameState) {
    if (!game) return;
    setHistory((current) => [...current.slice(-29), game]);
    setGame(next);
    setSelected(null);
    setHint(null);
  }

  // --- Win handler with full reward processing ---
  function handleWin(wonGame: GameState) {
    const timeSeconds = Math.max(0, Math.floor((Date.now() - wonGame.startedAt) / 1000));

    const performance: GamePerformance = {
      difficulty: wonGame.difficulty,
      moves: wonGame.moves,
      timeSeconds,
      usedHints: hintsUsed,
      usedUndos: undosUsed,
      runsCompleted: wonGame.completed,
      sequenceStreaks,
      won: true,
      isDailyChallenge,
    };

    // Calculate rewards
    const reward = calculateReward(performance, rewardsData.profile);

    // Check challenge card
    let challengeCompleted = false;
    let challengeBonus = 0;
    if (activeChallenge) {
      challengeCompleted = checkChallengeComplete(activeChallenge, performance);
      if (challengeCompleted) {
        challengeBonus = activeChallenge.bonusThreads;
      }
    }

    // Apply reward to profile
    let updatedData = { ...rewardsData };
    const updatedProfile = applyReward(rewardsData.profile, reward, performance);
    updatedData.profile = updatedProfile;

    // Add challenge bonus threads
    if (challengeBonus > 0) {
      updatedData.profile = { ...updatedData.profile, silkThreads: updatedData.profile.silkThreads + challengeBonus };
    }

    // Update mastery
    updatedData.mastery = addMasteryXP(rewardsData.mastery, wonGame.difficulty, reward.baseXP);

    // Check achievements
    const newAchievements = checkAchievements(performance, updatedData.profile, updatedData.mastery, rewardsData.achievements);
    for (const { achievement } of newAchievements) {
      updatedData.achievements.achievements[achievement.id] = { unlocked: true, unlockedAt: Date.now() };
      updatedData.profile.silkThreads += achievement.threadReward;
      updatedData.profile.totalXP += achievement.xpReward;
    }
    updatedData.achievements = { ...updatedData.achievements };

    // Contribute to gallery
    const galleryResult = autoContributeThreads(rewardsData.gallery, reward.totalThreads);
    updatedData.gallery = galleryResult.gallery;

    // Generate web pattern
    const pattern = generateWebPattern(performance);
    updatedData = addWebPattern(updatedData, pattern);

    // Save
    setRewardsData(updatedData);
    saveRewardsData(updatedData).catch(() => undefined);

    // Record in legacy stats too
    markChallengeComplete(wonGame.moves, timeSeconds).catch(() => undefined);

    // Set summary data
    setLastReward(reward);
    setLastPerformance(performance);
    setLastNewAchievements(newAchievements);
    setLastGalleryContributions(galleryResult.contributions);
    setLastChallengeCompleted(challengeCompleted);

    // Trigger celebration
    hapticSuccess();
    setShowWinCelebration(true);
    setTimeout(() => setShowRewardSummary(true), 2000);

    // Track game completion for upgrade prompt timing
    setPurchaseState((prev) => {
      const next = recordGameCompleted(prev);
      savePurchaseState(next).catch(() => undefined);
      // Show upgrade after 5 completed games if not premium
      if (shouldShowUpgradePrompt(next) && !next.upgradePromptDismissed) {
        setTimeout(() => setShowUpgrade(true), 3500);
      }
      return next;
    });
  }

  // --- Move handlers ---
  function tryMove(destination: number) {
    if (!game || !selected) return false;
    const next = moveCards(game, selected.column, selected.cardIndex, destination);
    if (!next) return false;
    hapticMedium();
    commit(next);

    if (next.completed > game.completed) {
      hapticHeavy();
      setSequenceStreaks((s) => s + 1);
    }
    if (next.status === 'won') {
      handleWin(next);
    }
    return true;
  }

  function handleCardPress(column: number, cardIndex: number) {
    if (!game) return;
    if (selected && tryMove(column)) return;
    if (selected?.column === column && selected.cardIndex === cardIndex) {
      setSelected(null);
      return;
    }
    if (isMovableRun(game.columns[column], cardIndex)) {
      hapticLight();
      setSelected({ column, cardIndex });
      setHint(null);
    } else {
      setSelected(null);
    }
  }

  function handleColumnPress(column: number) {
    if (selected) {
      if (!tryMove(column)) {
        hapticError();
        setSelected(null);
      }
    }
  }

  const handleDragMove = useCallback(
    (fromColumn: number, cardIndex: number, toColumn: number): boolean => {
      if (!game) return false;
      if (fromColumn === toColumn) return false;
      if (!canMove(game, fromColumn, cardIndex, toColumn)) return false;
      const next = moveCards(game, fromColumn, cardIndex, toColumn);
      if (!next) return false;
      hapticMedium();
      commit(next);
      if (next.completed > game.completed) {
        hapticHeavy();
        setSequenceStreaks((s) => s + 1);
      }
      if (next.status === 'won') {
        handleWin(next);
      }
      return true;
    },
    [game, hintsUsed, undosUsed, sequenceStreaks, isDailyChallenge, activeChallenge, rewardsData],
  );

  const handleIllegalMove = useCallback(() => { hapticError(); }, []);

  function handleDeal() {
    if (!game) return;
    const next = dealStock(game);
    if (next) {
      hapticHeavy();
      setSequenceStreaks(0); // dealing resets streak
      commit(next);
      if (next.status === 'won') handleWin(next);
      return;
    }
    hapticError();
    if (game.stock.length === 0) {
      Alert.alert('No cards left', 'All five stock rows have already been dealt.');
    } else {
      Alert.alert('Fill every space', 'Move a card into each empty column before dealing again.');
    }
  }

  function handleUndo() {
    const previous = history.at(-1);
    if (!previous) return;
    hapticLight();
    setUndosUsed((u) => u + 1);
    setGame(previous);
    setHistory((current) => current.slice(0, -1));
    setSelected(null);
    setHint(null);
  }

  function handleNewGame() {
    Alert.alert('Start a new game?', 'Your current layout will be replaced.', [
      { text: 'Keep playing', style: 'cancel' },
      {
        text: 'New game',
        style: 'destructive',
        onPress: () => {
          setShowWinCelebration(false);
          setShowRewardSummary(false);
          setScreen('home');
        },
      },
    ]);
  }

  function handleCardBackChange(id: CardBackId) {
    setCardBack(id);
    saveCardBack(id).catch(() => undefined);
  }

  function handlePurchase(cosmeticId: string, cost: number) {
    const updated = { ...rewardsData };
    if (updated.profile.silkThreads < cost) return;
    updated.profile = { ...updated.profile, silkThreads: updated.profile.silkThreads - cost, lifetimeThreadsSpent: updated.profile.lifetimeThreadsSpent + cost };
    updated.unlockedCosmetics = [...updated.unlockedCosmetics, cosmeticId];
    setRewardsData(updated);
    saveRewardsData(updated).catch(() => undefined);
  }

  // --- RENDER ---

  // Challenge picker screen
  if (screen === 'challenge_pick') {
    return (
      <GestureHandlerRootView style={styles.gestureRoot}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          <ChallengeCardPicker
            visible={true}
            difficulty={pendingDifficulty}
            onSelect={(card) => beginGameWithChallenge(card)}
            onSkip={() => beginGameWithChallenge(null)}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  // Home screen
  if (screen === 'home') {
    return (
      <GestureHandlerRootView style={styles.gestureRoot}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          <StartScreen
            savedGame={savedGame}
            onContinue={continueGame}
            onStart={startGame}
            onDailyChallenge={startDailyChallenge}
            onShowStats={() => setShowStats(true)}
            onShowCardBacks={() => setShowCardBacks(true)}
            onShowProfile={() => setShowProfile(true)}
            onShowAchievements={() => setShowAchievements(true)}
            onShowGallery={() => setShowGallery(true)}
            onShowShop={() => setShowShop(true)}
            onShowUpgrade={() => setShowUpgrade(true)}
            onShowTipJar={() => setShowSupporterPacks(true)}
            threadBalance={rewardsData.profile.silkThreads}
            isPremium={userIsPremium}
          />
          <StatsScreen visible={showStats} onClose={() => setShowStats(false)} />
          <CardBackSelector visible={showCardBacks} selectedBack={cardBack} onSelect={handleCardBackChange} onClose={() => setShowCardBacks(false)} />
          <ProfileScreen visible={showProfile} profile={rewardsData.profile} mastery={rewardsData.mastery} onClose={() => setShowProfile(false)} />
          <AchievementsScreen visible={showAchievements} achievements={rewardsData.achievements} profile={rewardsData.profile} onClose={() => setShowAchievements(false)} />
          <LoomGalleryScreen visible={showGallery} gallery={rewardsData.gallery} onClose={() => setShowGallery(false)} />
          <ShopScreen visible={showShop} threadBalance={rewardsData.profile.silkThreads} unlockedCosmetics={rewardsData.unlockedCosmetics} onPurchase={handlePurchase} onClose={() => setShowShop(false)} />
          <UpgradeScreen
            visible={showUpgrade}
            localizedPrice={null}
            onPurchase={() => requestPurchase('full_weaver').catch(() => undefined)}
            onRestore={async () => {
              const purchases = await restorePurchases();
              for (const p of purchases) {
                setPurchaseState((prev) => {
                  const next = recordPurchase(prev, p.productId as ProductId);
                  savePurchaseState(next).catch(() => undefined);
                  return next;
                });
              }
              setShowUpgrade(false);
            }}
            onClose={() => setShowUpgrade(false)}
          />
          <SupporterPacks
            visible={showSupporterPacks}
            supporterLevel={purchaseState.supporterLevel}
            purchasedPacks={purchaseState.purchased}
            onPurchase={(productId) => requestPurchase(productId).catch(() => undefined)}
            onClose={() => setShowSupporterPacks(false)}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (!game) return null;

  // Game screen
  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              {isDailyChallenge ? '☀ DAILY' : 'SILK SPIDER'}
            </Text>
            <Text style={styles.difficulty}>
              {game.difficulty} SUIT{game.difficulty > 1 ? 'S' : ''}
              {activeChallenge ? ` · ${activeChallenge.name}` : ''}
            </Text>
          </View>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{game.moves}</Text>
              <Text style={styles.statLabel}>MOVES</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
              <Text style={styles.statLabel}>TIME</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{game.completed}/8</Text>
              <Text style={styles.statLabel}>RUNS</Text>
            </View>
            <Pressable onPress={() => setShowProfile(true)} style={styles.threadBadge}>
              <Text style={styles.threadText}>🧵 {rewardsData.profile.silkThreads}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.kenteLine}>
          {[colors.gold, colors.clay, colors.indigo, colors.gold, colors.clay].map((color, index) => (
            <View key={`${color}-${index}`} style={{ backgroundColor: color, flex: 1 }} />
          ))}
        </View>

        <View style={styles.boardWrap}>
          <GameBoard
            game={game}
            hint={hint}
            selected={selected}
            onCardPress={handleCardPress}
            onColumnPress={handleColumnPress}
            onDragMove={handleDragMove}
            onIllegalMove={handleIllegalMove}
          />

          {game.status === 'won' && (
            <View style={styles.winOverlay}>
              <WinCelebration visible={showWinCelebration} onComplete={() => undefined} />
              <Text style={styles.winEyebrow}>
                {isDailyChallenge ? '☀ DAILY CHALLENGE COMPLETE' : 'BEAUTIFULLY PLAYED'}
              </Text>
              <Text style={styles.winTitle}>You won!</Text>
              <Text style={styles.winCopy}>{game.moves} moves · {formatTime(elapsed)}</Text>
              {!showRewardSummary && (
                <Text style={styles.winHint}>Rewards incoming...</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.tray}>
          <View style={styles.completedRuns}>
            {Array.from({ length: 8 }, (_, index) => (
              <View key={index} style={[styles.runSlot, index < game.completed && styles.runDone]}>
                <Text style={[styles.runSymbol, index < game.completed && styles.runSymbolDone]}>♠</Text>
              </View>
            ))}
          </View>
          <View style={styles.stockArea}>
            <View style={styles.webBehindStock}>
              <SpiderWeb size={90} opacity={0.2} />
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={!canDeal(game)}
              onPress={handleDeal}
              style={[styles.stock, !canDeal(game) && styles.stockDisabled]}
            >
              <Text style={styles.stockSymbol}>♠</Text>
              <Text style={styles.stockText}>{game.stock.length / 10} DEALS</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.toolbar}>
          <Pressable onPress={handleNewGame} style={styles.toolButton}>
            <Text style={styles.toolIcon}>＋</Text>
            <Text style={styles.toolLabel}>NEW</Text>
          </Pressable>
          <Pressable disabled={history.length === 0} onPress={handleUndo} style={styles.toolButton}>
            <Text style={[styles.toolIcon, history.length === 0 && styles.disabled]}>↶</Text>
            <Text style={[styles.toolLabel, history.length === 0 && styles.disabled]}>UNDO</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const nextHint = findHint(game);
              setHint(nextHint);
              if (!nextHint) { hapticError(); Alert.alert('No moves found', 'Try dealing another row of cards.'); }
              else { hapticLight(); setHintsUsed((h) => h + 1); }
            }}
            style={styles.toolButton}
          >
            <Text style={styles.toolIcon}>◇</Text>
            <Text style={styles.toolLabel}>HINT</Text>
          </Pressable>
          <Pressable onPress={() => setShowProfile(true)} style={styles.toolButton}>
            <Text style={styles.toolIcon}>♛</Text>
            <Text style={styles.toolLabel}>PROFILE</Text>
          </Pressable>
        </View>

        {/* Modals */}
        {lastReward && lastPerformance && (
          <RewardSummary
            visible={showRewardSummary}
            reward={lastReward}
            performance={lastPerformance}
            newAchievements={lastNewAchievements}
            masteryRank={rewardsData.mastery.byDifficulty[String(game.difficulty)]?.rank ?? 'apprentice'}
            galleryContributions={lastGalleryContributions}
            challengeCompleted={lastChallengeCompleted}
            challengeCard={activeChallenge}
            onClose={() => { setShowRewardSummary(false); setScreen('home'); }}
          />
        )}
        <ProfileScreen visible={showProfile} profile={rewardsData.profile} mastery={rewardsData.mastery} onClose={() => setShowProfile(false)} />
        <AchievementsScreen visible={showAchievements} achievements={rewardsData.achievements} profile={rewardsData.profile} onClose={() => setShowAchievements(false)} />
        <LoomGalleryScreen visible={showGallery} gallery={rewardsData.gallery} onClose={() => setShowGallery(false)} />
        <ShopScreen visible={showShop} threadBalance={rewardsData.profile.silkThreads} unlockedCosmetics={rewardsData.unlockedCosmetics} onPurchase={handlePurchase} onClose={() => setShowShop(false)} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({
  gestureRoot: { flex: 1 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 66,
    paddingHorizontal: 14,
  },
  brand: { color: colors.cream, fontSize: 16, fontWeight: '900', letterSpacing: 1.1 },
  difficulty: { color: colors.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1.4, marginTop: 3 },
  stats: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  stat: { alignItems: 'center', minWidth: 36 },
  statValue: { color: colors.cream, fontSize: 14, fontVariant: ['tabular-nums'], fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 8, letterSpacing: 1, marginTop: 2 },
  threadBadge: {
    backgroundColor: '#0C2B23',
    borderColor: colors.gold,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  threadText: { color: colors.goldSoft, fontSize: 11, fontWeight: '800' },
  kenteLine: { flexDirection: 'row', height: 4 },
  boardWrap: { flex: 1, position: 'relative' },
  tray: {
    alignItems: 'center',
    backgroundColor: '#0A2A21',
    borderTopColor: '#194638',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 62,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  completedRuns: { flexDirection: 'row', gap: 4 },
  runSlot: {
    alignItems: 'center',
    borderColor: '#31594D',
    borderRadius: 4,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 23,
  },
  runDone: { backgroundColor: colors.cream, borderStyle: 'solid' },
  runSymbol: { color: '#31594D', fontSize: 13 },
  runSymbolDone: { color: colors.black },
  stockArea: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  webBehindStock: { position: 'absolute', zIndex: 0 },
  stock: {
    alignItems: 'center',
    backgroundColor: colors.indigo,
    borderColor: colors.gold,
    borderRadius: 7,
    borderWidth: 1,
    height: 47,
    justifyContent: 'center',
    width: 67,
    zIndex: 1,
  },
  stockDisabled: { opacity: 0.45 },
  stockSymbol: { color: colors.goldSoft, fontSize: 18, lineHeight: 19 },
  stockText: { color: colors.cream, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  toolbar: {
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 58,
    paddingBottom: 4,
  },
  toolButton: { alignItems: 'center', justifyContent: 'center', minWidth: 56 },
  toolIcon: { color: colors.gold, fontSize: 22, lineHeight: 25 },
  toolLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  disabled: { color: '#44645A' },
  winOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 29, 24, 0.96)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 30,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  winEyebrow: { color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  winTitle: { color: colors.cream, fontSize: 44, fontWeight: '900', marginTop: 8 },
  winCopy: { color: colors.muted, fontSize: 15, marginTop: 5 },
  winHint: { color: colors.goldSoft, fontSize: 12, marginTop: 16, fontStyle: 'italic' },
});
