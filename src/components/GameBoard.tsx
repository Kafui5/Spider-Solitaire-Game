import { useCallback, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import type { GameState, Hint, MoveSelection } from '../game/gameEngine';
import { isMovableRun } from '../game/gameEngine';
import { colors } from '../theme';
import { DraggableCard } from './DraggableCard';
import { IllegalMoveFeedback } from './IllegalMoveFeedback';
import { PlayingCard } from './PlayingCard';
import { CornerWeb } from './SpiderWeb';

interface GameBoardProps {
  game: GameState;
  selected: MoveSelection | null;
  hint: Hint | null;
  onCardPress: (column: number, cardIndex: number) => void;
  onColumnPress: (column: number) => void;
  onDragMove: (fromColumn: number, cardIndex: number, toColumn: number) => boolean;
  onIllegalMove?: (column: number) => void;
}

export function GameBoard({
  game,
  selected,
  hint,
  onCardPress,
  onColumnPress,
  onDragMove,
  onIllegalMove,
}: GameBoardProps) {
  const { width, height } = useWindowDimensions();
  const boardWidth = Math.max(width - 20, 500);
  const gap = 5;
  const cardWidth = Math.min(66, (boardWidth - 24 - gap * 9) / 10);
  const faceUpOffset = Math.max(19, cardWidth * 0.46);
  const faceDownOffset = Math.max(10, cardWidth * 0.23);
  const availableHeight = Math.max(430, height - 180);

  const [isDragging, setIsDragging] = useState(false);
  const [illegalColumn, setIllegalColumn] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Column boundaries for drop detection
  const getColumnFromX = useCallback(
    (originColumn: number, translationX: number): number => {
      const columnWidth = cardWidth + gap;
      const originCenterX = 12 + originColumn * columnWidth + cardWidth / 2;
      const finalCenterX = originCenterX + translationX;
      const targetColumn = Math.round((finalCenterX - 12 - cardWidth / 2) / columnWidth);
      return Math.max(0, Math.min(9, targetColumn));
    },
    [cardWidth, gap],
  );

  const getColumnLeft = useCallback(
    (col: number): number => 12 + col * (cardWidth + gap),
    [cardWidth, gap],
  );

  const handleDragStart = useCallback((_columnIndex: number, _cardIndex: number) => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (
      fromColumn: number,
      cardIndex: number,
      translationX: number,
      success: (didMove: boolean) => void,
    ) => {
      const toColumn = getColumnFromX(fromColumn, translationX);
      let didMove = false;

      if (toColumn !== fromColumn) {
        didMove = onDragMove(fromColumn, cardIndex, toColumn);
        if (!didMove) {
          // Illegal move - trigger feedback
          setIllegalColumn(toColumn);
          onIllegalMove?.(toColumn);
        }
      }

      success(didMove);
      setIsDragging(false);
    },
    [getColumnFromX, onDragMove, onIllegalMove],
  );

  const handleTap = useCallback(
    (columnIndex: number, cardIndex: number) => {
      onCardPress(columnIndex, cardIndex);
    },
    [onCardPress],
  );

  const Wrapper = Platform.OS === 'web' ? ScrollView : ScrollView;
  const wrapperProps = Platform.OS === 'web' 
    ? { style: { flex: 1 }, contentContainerStyle: [styles.horizontalContent, { minWidth: boardWidth }] }
    : {
        ref: scrollViewRef,
        horizontal: true,
        bounces: false,
        scrollEnabled: !isDragging,
        contentContainerStyle: [styles.horizontalContent, { minWidth: boardWidth }],
        showsHorizontalScrollIndicator: false,
      };

  return (
    <Wrapper {...(wrapperProps as any)}>
      <View style={[styles.board, { minHeight: availableHeight, width: boardWidth }]}>
        {/* Decorative spider webs */}
        <CornerWeb position="topLeft" />
        <CornerWeb position="topRight" />

        {/* Illegal move flash feedback */}
        <IllegalMoveFeedback
          column={illegalColumn}
          columnLeft={getColumnLeft}
          columnWidth={cardWidth}
          boardHeight={availableHeight}
          onDismiss={() => setIllegalColumn(null)}
        />

        {game.columns.map((column, columnIndex) => {
          let currentTop = 0;
          const positions = column.map((card, index) => {
            const top = currentTop;
            if (index < column.length - 1) {
              currentTop += card.faceUp ? faceUpOffset : faceDownOffset;
            }
            return top;
          });
          const columnHeight = Math.max(
            availableHeight - 16,
            currentTop + cardWidth * 1.42 + 14,
          );

          return (
            <View
              accessibilityLabel={`Tableau column ${columnIndex + 1}`}
              key={columnIndex}
              style={[
                styles.column,
                {
                  height: columnHeight,
                  left: 12 + columnIndex * (cardWidth + gap),
                  width: cardWidth,
                },
              ]}
            >
              <Pressable
                onPress={Platform.OS === 'web' ? undefined : () => onColumnPress(columnIndex)}
                onPressIn={Platform.OS === 'web' ? () => onColumnPress(columnIndex) : undefined}
                style={[styles.emptySlot, { borderRadius: 6, height: cardWidth * 1.42 }]}
              />
              {column.map((card, cardIndex) => {
                const isMovable = card.faceUp && isMovableRun(column, cardIndex);

                if (card.faceUp && isMovable && Platform.OS !== 'web') {
                  return (
                    <View
                      key={card.id}
                      pointerEvents="box-none"
                      style={[styles.cardPosition, { top: positions[cardIndex] }]}
                    >
                      <DraggableCard
                        card={card}
                        width={cardWidth}
                        selected={
                          selected?.column === columnIndex &&
                          cardIndex >= selected.cardIndex
                        }
                        hinted={
                          hint?.column === columnIndex && hint.cardIndex === cardIndex
                        }
                        columnIndex={columnIndex}
                        cardIndex={cardIndex}
                        isMovable={isMovable}
                        onTap={() => handleTap(columnIndex, cardIndex)}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    </View>
                  );
                }

                return (
                  <View
                    key={card.id}
                    style={[styles.cardPosition, { top: positions[cardIndex], zIndex: cardIndex }]}
                  >
                    <PlayingCard
                      card={card}
                      width={cardWidth}
                      selected={
                        selected?.column === columnIndex &&
                        cardIndex >= selected.cardIndex
                      }
                      hinted={
                        hint?.column === columnIndex && hint.cardIndex === cardIndex
                      }
                      onPress={() => { console.log('CARD PRESSED', columnIndex, cardIndex); onCardPress(columnIndex, cardIndex); }}
                    />
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  horizontalContent: {
    flexGrow: 1,
  },
  board: {
    backgroundColor: colors.felt,
    position: 'relative',
  },
  column: {
    position: 'absolute',
    top: 10,
  },
  emptySlot: {
    borderColor: 'rgba(230,185,92,0.25)',
    borderStyle: 'dashed',
    borderWidth: 1,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  cardPosition: {
    left: 0,
    position: 'absolute',
  },
});
