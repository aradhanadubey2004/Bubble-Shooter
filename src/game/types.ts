export type BubbleColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'cyan';

export interface Bubble {
  id: string;
  row: number;
  col: number;
  color: BubbleColor;
  x: number;
  y: number;
  isPopping?: boolean;
  popProgress?: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BubbleColor;
  active: boolean;
}

export interface FallingBubble {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BubbleColor;
  rotation: number;
  vRot: number;
  alpha: number;
}

export interface PopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface ScoreFloater {
  id: string;
  x: number;
  y: number;
  text: string;
  alpha: number;
  vy: number;
  color: string;
  scale: number;
}

export interface AimPoint {
  x: number;
  y: number;
}

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

export type GameMode = 'LEVELS' | 'ARCADE';

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  colors: BubbleColor[];
  layout: (BubbleColor | null)[][];
  maxShots: number;
  description: string;
}

export interface GameStats {
  score: number;
  shotsLeft: number;
  bubblesPopped: number;
  orphansDropped: number;
  combos: number;
  maxCombo: number;
}
