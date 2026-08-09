import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';

import { colors } from '../theme';

interface SpiderWebProps {
  size?: number;
  opacity?: number;
}

/** Decorative spider web SVG motif borrowed from the Webspinner design */
function SpiderWebView({ size = 160, opacity = 0.15 }: SpiderWebProps) {
  const cx = 100;
  const cy = 100;
  const rings = [20, 38, 56, 74, 90];
  const spokes = 8;
  const spokeAngles = Array.from({ length: spokes }, (_, i) => (i * 360) / spokes);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg viewBox="0 0 200 200" width={size} height={size} style={{ opacity }}>
        <G fill="none" stroke={colors.gold} strokeWidth={0.7}>
          {rings.map((r) => (
            <Circle key={r} cx={cx} cy={cy} r={r} />
          ))}
          {spokeAngles.map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x2 = cx + 95 * Math.cos(rad);
            const y2 = cy + 95 * Math.sin(rad);
            return (
              <Line
                key={angle}
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

export const SpiderWeb = memo(SpiderWebView);

/** Small corner web for subtle decoration */
export function CornerWeb({ position }: { position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' }) {
  const posStyle = {
    topLeft: { top: -30, left: -30 },
    topRight: { top: -30, right: -30 },
    bottomLeft: { bottom: -30, left: -30 },
    bottomRight: { bottom: -30, right: -30 },
  }[position];

  return (
    <View style={[styles.corner, posStyle]} pointerEvents="none">
      <SpiderWeb size={100} opacity={0.1} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    zIndex: 0,
  },
});
