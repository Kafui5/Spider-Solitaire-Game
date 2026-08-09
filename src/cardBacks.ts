import { colors } from './theme';

export type CardBackId = 'woven' | 'spider' | 'geometric' | 'midnight' | 'royal';

export interface CardBackDesign {
  id: CardBackId;
  name: string;
  backgroundColor: string;
  borderColor: string;
}

export const CARD_BACKS: CardBackDesign[] = [
  {
    id: 'woven',
    name: 'Woven',
    backgroundColor: colors.indigo,
    borderColor: colors.goldSoft,
  },
  {
    id: 'spider',
    name: 'Spider',
    backgroundColor: colors.indigo,
    borderColor: colors.gold,
  },
  {
    id: 'geometric',
    name: 'Geometric',
    backgroundColor: colors.ink,
    borderColor: colors.clay,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    backgroundColor: '#0A1128',
    borderColor: colors.gold,
  },
  {
    id: 'royal',
    name: 'Royal',
    backgroundColor: colors.felt,
    borderColor: colors.cream,
  },
];

export const DEFAULT_CARD_BACK: CardBackId = 'woven';
