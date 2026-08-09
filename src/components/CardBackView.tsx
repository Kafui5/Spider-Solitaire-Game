import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';

import { CARD_BACKS, type CardBackId } from '../cardBacks';
import { colors } from '../theme';

interface CardBackViewProps {
  backId: CardBackId;
  width: number;
}

/** Renders the visual pattern for a given card back design */
export function CardBackView({ backId, width }: CardBackViewProps) {
  const height = width * 1.42;
  const design = CARD_BACKS.find((b) => b.id === backId) ?? CARD_BACKS[0];
  const borderRadius = Math.max(4, width * 0.1);

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: design.backgroundColor,
          borderColor: design.borderColor,
        },
      ]}
    >
      {backId === 'woven' && <WovenPattern width={width} />}
      {backId === 'spider' && <SpiderPattern width={width} height={height} />}
      {backId === 'geometric' && <GeometricPattern width={width} height={height} />}
      {backId === 'midnight' && <MidnightPattern width={width} height={height} />}
      {backId === 'royal' && <RoyalPattern width={width} height={height} />}
    </View>
  );
}

/** Existing woven diamond pattern (gold/clay) */
function WovenPattern({ width }: { width: number }) {
  const size = Math.max(5, width * 0.12);

  return (
    <View style={styles.wovenInset}>
      <View style={styles.wovenRow}>
        <View
          style={[styles.diamond, { width: size, height: size, backgroundColor: colors.gold }]}
        />
        <View
          style={[styles.diamond, { width: size, height: size, backgroundColor: colors.clay }]}
        />
      </View>
      <View style={styles.wovenRow}>
        <View
          style={[styles.diamond, { width: size, height: size, backgroundColor: colors.clay }]}
        />
        <View
          style={[styles.diamond, { width: size, height: size, backgroundColor: colors.gold }]}
        />
      </View>
    </View>
  );
}

/** Spider web SVG pattern (gold lines on indigo) */
function SpiderPattern({ width, height }: { width: number; height: number }) {
  const cx = width / 2;
  const cy = height / 2;
  const r1 = width * 0.15;
  const r2 = width * 0.3;
  const r3 = width * 0.42;
  const strokeW = Math.max(0.5, width * 0.015);

  return (
    <Svg width={width - 4} height={height - 4} viewBox={`0 0 ${width} ${height}`}>
      {/* Radial lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x2 = cx + Math.cos(rad) * r3;
        const y2 = cy + Math.sin(rad) * r3;
        return (
          <Line
            key={deg}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke={colors.gold}
            strokeWidth={strokeW}
            opacity={0.7}
          />
        );
      })}
      {/* Concentric rings */}
      {[r1, r2, r3].map((r) => (
        <Circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={colors.gold}
          strokeWidth={strokeW}
          opacity={0.5}
        />
      ))}
      {/* Center dot */}
      <Circle cx={cx} cy={cy} r={width * 0.03} fill={colors.gold} />
    </Svg>
  );
}

/** Repeating triangles/chevrons (clay/gold on dark) */
function GeometricPattern({ width, height }: { width: number; height: number }) {
  const strokeW = Math.max(0.5, width * 0.018);
  const rows = 5;
  const rowH = height / (rows + 1);
  const chevronW = width * 0.3;

  return (
    <Svg width={width - 4} height={height - 4} viewBox={`0 0 ${width} ${height}`}>
      {Array.from({ length: rows }).map((_, i) => {
        const cy = rowH * (i + 1);
        const color = i % 2 === 0 ? colors.clay : colors.gold;
        const cx = width / 2;
        return (
          <Polygon
            key={i}
            points={`${cx},${cy - rowH * 0.3} ${cx + chevronW / 2},${cy + rowH * 0.15} ${cx},${cy + rowH * 0.05} ${cx - chevronW / 2},${cy + rowH * 0.15}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            opacity={0.8}
          />
        );
      })}
    </Svg>
  );
}

/** Stars/dots pattern (gold dots on very dark blue) */
function MidnightPattern({ width, height }: { width: number; height: number }) {
  const dotR = Math.max(1, width * 0.025);
  const cols = 4;
  const rows = 6;
  const spacingX = width / (cols + 1);
  const spacingY = height / (rows + 1);

  return (
    <Svg width={width - 4} height={height - 4} viewBox={`0 0 ${width} ${height}`}>
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const x = spacingX * (col + 1);
          const y = spacingY * (row + 1);
          // Alternate between larger "star" dots and small dots
          const isStar = (row + col) % 2 === 0;
          return (
            <Circle
              key={`${row}-${col}`}
              cx={x}
              cy={y}
              r={isStar ? dotR * 1.5 : dotR}
              fill={colors.gold}
              opacity={isStar ? 0.9 : 0.4}
            />
          );
        }),
      )}
    </Svg>
  );
}

/** Ornate border with center spade (cream/gold on deep green) */
function RoyalPattern({ width, height }: { width: number; height: number }) {
  const strokeW = Math.max(0.5, width * 0.02);
  const inset = width * 0.12;
  const cx = width / 2;
  const cy = height / 2;
  const spadeSize = width * 0.22;

  return (
    <Svg width={width - 4} height={height - 4} viewBox={`0 0 ${width} ${height}`}>
      {/* Ornate double border */}
      <Path
        d={`M ${inset} ${inset} h ${width - inset * 2} v ${height - inset * 2} h -${width - inset * 2} Z`}
        fill="none"
        stroke={colors.cream}
        strokeWidth={strokeW}
        opacity={0.7}
      />
      <Path
        d={`M ${inset * 1.6} ${inset * 1.6} h ${width - inset * 3.2} v ${height - inset * 3.2} h -${width - inset * 3.2} Z`}
        fill="none"
        stroke={colors.gold}
        strokeWidth={strokeW * 0.6}
        opacity={0.5}
      />
      {/* Corner dots */}
      <Circle cx={inset} cy={inset} r={dotSize(width)} fill={colors.gold} opacity={0.8} />
      <Circle cx={width - inset} cy={inset} r={dotSize(width)} fill={colors.gold} opacity={0.8} />
      <Circle cx={inset} cy={height - inset} r={dotSize(width)} fill={colors.gold} opacity={0.8} />
      <Circle
        cx={width - inset}
        cy={height - inset}
        r={dotSize(width)}
        fill={colors.gold}
        opacity={0.8}
      />
      {/* Center spade symbol */}
      <Path
        d={`M ${cx} ${cy - spadeSize}
            C ${cx - spadeSize * 0.8} ${cy - spadeSize * 0.3} ${cx - spadeSize} ${cy + spadeSize * 0.2} ${cx} ${cy + spadeSize * 0.1}
            C ${cx + spadeSize} ${cy + spadeSize * 0.2} ${cx + spadeSize * 0.8} ${cy - spadeSize * 0.3} ${cx} ${cy - spadeSize} Z
            M ${cx} ${cy + spadeSize * 0.1} L ${cx - spadeSize * 0.2} ${cy + spadeSize * 0.7}
            L ${cx + spadeSize * 0.2} ${cy + spadeSize * 0.7} Z`}
        fill={colors.cream}
        opacity={0.85}
      />
    </Svg>
  );
}

function dotSize(width: number): number {
  return Math.max(1.5, width * 0.035);
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wovenInset: {
    borderColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    height: '80%',
    justifyContent: 'center',
    padding: 3,
    width: '72%',
  },
  wovenRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 2,
  },
  diamond: {
    transform: [{ rotate: '45deg' }],
  },
});
