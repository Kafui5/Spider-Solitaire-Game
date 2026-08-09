import type { Difficulty } from './gameEngine.ts';
import type { GamePerformance } from './rewards.ts';

export interface WebPattern {
  id: string;
  timestamp: number;
  difficulty: Difficulty;
  // SVG path data representing the pattern
  nodes: PatternNode[];
  connections: PatternConnection[];
  // Metadata about the game that shaped this pattern
  style: 'tight' | 'loose' | 'balanced';
  complexity: number; // 1-10
}

export interface PatternNode {
  x: number; // 0-100 normalized
  y: number; // 0-100 normalized
  size: number; // 1-5
}

export interface PatternConnection {
  from: number; // node index
  to: number; // node index
  curve: number; // -1 to 1, curvature
}

/**
 * Simple seeded pseudo-random number generator (mulberry32).
 * Produces deterministic results for a given seed.
 */
function createSeededRandom(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Maps the efficiency rating string to a numeric complexity value.
 */
function efficiencyToComplexity(
  rating: 'perfect' | 'excellent' | 'good' | 'average' | 'below'
): number {
  switch (rating) {
    case 'perfect':
      return 10;
    case 'excellent':
      return 8;
    case 'good':
      return 6;
    case 'average':
      return 4;
    case 'below':
      return 2;
  }
}

/**
 * Computes the efficiency rating from game performance data.
 * Uses moves relative to optimal play for the difficulty.
 */
function getEfficiencyRating(
  performance: GamePerformance
): 'perfect' | 'excellent' | 'good' | 'average' | 'below' {
  const baseMoves = performance.difficulty === 1 ? 80 : performance.difficulty === 2 ? 100 : 130;
  const ratio = performance.moves / baseMoves;

  if (ratio <= 1.0) return 'perfect';
  if (ratio <= 1.3) return 'excellent';
  if (ratio <= 1.6) return 'good';
  if (ratio <= 2.0) return 'average';
  return 'below';
}

/**
 * Calculates the Euclidean distance between two nodes.
 */
function distance(a: PatternNode, b: PatternNode): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Generates a unique web pattern based on how the game was played.
 *
 * - Fast games → tighter/denser web with more connections
 * - Slow games → looser/wider web with fewer connections
 * - Few undos → smooth curves
 * - Many undos → jagged curves
 * - Efficiency → more symmetric patterns
 * - More moves → more nodes
 */
export function generateWebPattern(performance: GamePerformance): WebPattern {
  const seed = performance.moves * 1000 + performance.timeSeconds * 7 + performance.difficulty * 31;
  const random = createSeededRandom(seed);

  // Determine style based on time
  const style: 'tight' | 'loose' | 'balanced' =
    performance.timeSeconds < 300
      ? 'tight'
      : performance.timeSeconds > 900
        ? 'loose'
        : 'balanced';

  // Determine complexity from efficiency
  const efficiencyRating = getEfficiencyRating(performance);
  const complexity = efficiencyToComplexity(efficiencyRating);

  // Number of nodes: 8 + floor(moves/20), capped at 30
  const nodeCount = Math.min(30, 8 + Math.floor(performance.moves / 20));

  // Generate nodes
  const nodes: PatternNode[] = [];
  for (let i = 0; i < nodeCount; i++) {
    // For higher complexity (efficient play), generate more symmetric patterns
    // by mirroring some nodes around the center
    let x: number;
    let y: number;

    if (complexity >= 7 && i % 2 === 1 && i > 0) {
      // Mirror the previous node for symmetry
      x = 100 - nodes[i - 1].x;
      y = nodes[i - 1].y + (random() - 0.5) * 10;
    } else {
      x = random() * 80 + 10; // Keep within 10-90 range
      y = random() * 80 + 10;
    }

    // Clamp to valid range
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    // Size varies 1-5 based on position in generation order
    const size = 1 + Math.floor(random() * 5);

    nodes.push({ x, y, size: Math.min(5, size) });
  }

  // Generate connections: each node connects to 2-4 nearest neighbors
  // Fast games get more connections (tighter web)
  const baseConnections = style === 'tight' ? 4 : style === 'loose' ? 2 : 3;
  const connections: PatternConnection[] = [];
  const jagged = performance.usedUndos > 5;

  for (let i = 0; i < nodes.length; i++) {
    // Calculate distances to all other nodes
    const distances: { index: number; dist: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      distances.push({ index: j, dist: distance(nodes[i], nodes[j]) });
    }

    // Sort by distance and pick nearest neighbors
    distances.sort((a, b) => a.dist - b.dist);
    const connectCount = Math.min(
      baseConnections,
      Math.max(2, 2 + Math.floor(random() * 3))
    );

    for (let k = 0; k < connectCount && k < distances.length; k++) {
      const target = distances[k].index;

      // Avoid duplicate connections
      const exists = connections.some(
        (c) =>
          (c.from === i && c.to === target) ||
          (c.from === target && c.to === i)
      );
      if (exists) continue;

      // Determine curvature
      let curve: number;
      if (jagged) {
        // More jagged curves when many undos used
        curve = (random() - 0.5) * 2; // Full range -1 to 1
      } else {
        // Smooth curves with few undos
        curve = (random() - 0.5) * 0.6; // Gentle range -0.3 to 0.3
      }

      connections.push({ from: i, to: target, curve });
    }
  }

  // Generate a unique ID from the seed
  const id = `web_${seed.toString(36)}_${Date.now().toString(36)}`;

  return {
    id,
    timestamp: Date.now(),
    difficulty: performance.difficulty,
    nodes,
    connections,
    style,
    complexity,
  };
}

/**
 * Converts a WebPattern into an SVG string that can be rendered.
 * Uses a 100x100 viewBox. Draws circles at nodes and quadratic
 * bezier curves for connections.
 */
export function patternToSVGPath(pattern: WebPattern): string {
  const parts: string[] = [];

  // SVG header
  parts.push(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">'
  );

  // Style definitions based on pattern style
  const strokeColor =
    pattern.style === 'tight'
      ? '#c084fc' // purple for tight
      : pattern.style === 'loose'
        ? '#67e8f9' // cyan for loose
        : '#a78bfa'; // violet for balanced

  const strokeWidth = pattern.style === 'tight' ? 0.3 : 0.5;
  const nodeColor = strokeColor;

  // Draw connections as quadratic bezier curves
  parts.push(
    `<g stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" opacity="0.7">`
  );

  for (const conn of pattern.connections) {
    const fromNode = pattern.nodes[conn.from];
    const toNode = pattern.nodes[conn.to];

    // Calculate control point for the quadratic bezier
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;

    // Perpendicular offset based on curve value
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    // Perpendicular direction
    const perpX = -dy / len;
    const perpY = dx / len;

    // Control point offset by curvature * distance
    const offset = conn.curve * len * 0.5;
    const cx = midX + perpX * offset;
    const cy = midY + perpY * offset;

    parts.push(
      `  <path d="M ${fromNode.x.toFixed(1)} ${fromNode.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${toNode.x.toFixed(1)} ${toNode.y.toFixed(1)}"/>`
    );
  }

  parts.push('</g>');

  // Draw nodes as circles
  parts.push(`<g fill="${nodeColor}" opacity="0.9">`);

  for (const node of pattern.nodes) {
    const radius = node.size * 0.4;
    parts.push(
      `  <circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${radius.toFixed(1)}"/>`
    );
  }

  parts.push('</g>');

  // Close SVG
  parts.push('</svg>');

  return parts.join('\n');
}
