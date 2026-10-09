import { BubbleColor } from './types';

// Canvas virtual coordinate space
export const CANVAS_WIDTH = 384;
export const CANVAS_HEIGHT = 600;

export const BUBBLE_RADIUS = 24;
export const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
// Distance between vertical row centers in hexagonal staggered grid
export const ROW_HEIGHT = Math.round(BUBBLE_RADIUS * Math.sqrt(3)); // ~41.57 -> 41.57

export const GRID_COLUMNS_EVEN = 8;
export const GRID_COLUMNS_ODD = 7;
export const MAX_GRID_ROWS = 14;

// Danger line is located at the bottom warning zone
export const DANGER_ROW = 10;
export const DANGER_LINE_Y = 16 + DANGER_ROW * (BUBBLE_RADIUS * Math.sqrt(3)) + BUBBLE_RADIUS;

// Projectile launch origin
export const LAUNCHER_X = CANVAS_WIDTH / 2;
export const LAUNCHER_Y = CANVAS_HEIGHT - 55;
export const PROJECTILE_SPEED = 14;

export interface ColorMeta {
  color: BubbleColor;
  name: string;
  fill: string;
  dark: string;
  light: string;
  glow: string;
  symbol: 'diamond' | 'circle' | 'triangle' | 'star' | 'square' | 'hexagon';
}

export const BUBBLE_COLORS: Record<BubbleColor, ColorMeta> = {
  red: {
    color: 'red',
    name: 'Ruby',
    fill: '#ef4444',
    dark: '#991b1b',
    light: '#fca5a5',
    glow: 'rgba(239, 68, 68, 0.4)',
    symbol: 'diamond',
  },
  blue: {
    color: 'blue',
    name: 'Sapphire',
    fill: '#3b82f6',
    dark: '#1e40af',
    light: '#93c5fd',
    glow: 'rgba(59, 130, 246, 0.4)',
    symbol: 'circle',
  },
  green: {
    color: 'green',
    name: 'Emerald',
    fill: '#10b981',
    dark: '#065f46',
    light: '#6ee7b7',
    glow: 'rgba(16, 185, 129, 0.4)',
    symbol: 'triangle',
  },
  yellow: {
    color: 'yellow',
    name: 'Amber',
    fill: '#f59e0b',
    dark: '#92400e',
    light: '#fde68a',
    glow: 'rgba(245, 158, 11, 0.4)',
    symbol: 'star',
  },
  purple: {
    color: 'purple',
    name: 'Amethyst',
    fill: '#a855f7',
    dark: '#6b21a8',
    light: '#e9d5ff',
    glow: 'rgba(168, 85, 247, 0.4)',
    symbol: 'square',
  },
  cyan: {
    color: 'cyan',
    name: 'Aquamarine',
    fill: '#06b6d4',
    dark: '#155e75',
    light: '#a5f3fc',
    glow: 'rgba(6, 182, 212, 0.4)',
    symbol: 'hexagon',
  },
};

export const ALL_COLORS: BubbleColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'];
