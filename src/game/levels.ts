import { getBubbleCenter } from './grid';
import { Bubble, BubbleColor, LevelConfig } from './types';

export const GAME_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Novice Meadow',
    subtitle: 'Learn the Basics',
    colors: ['red', 'blue', 'green'],
    maxShots: 36,
    description: 'Match 3 or more bubbles of the same color to clear them. Master the wall bounce!',
    layout: [
      ['red', 'red', 'blue', 'blue', 'green', 'green', 'red', 'red'],
      ['red', 'blue', 'blue', 'green', 'green', 'red', 'red'],
      ['blue', 'blue', 'green', 'green', 'red', 'red', 'blue', 'blue'],
      ['green', 'green', 'red', 'red', 'blue', 'blue', 'green'],
    ],
  },
  {
    id: 2,
    name: 'Rainbow Arch',
    subtitle: 'Four Spectrum Ribbons',
    colors: ['red', 'blue', 'green', 'yellow'],
    maxShots: 34,
    description: 'A new Amber bubble appears! Target the upper clusters to drop bottom bubbles.',
    layout: [
      ['yellow', 'yellow', 'red', 'red', 'blue', 'blue', 'green', 'green'],
      ['yellow', 'red', 'red', 'blue', 'blue', 'green', 'green'],
      ['red', 'red', 'yellow', 'yellow', 'green', 'green', 'blue', 'blue'],
      ['blue', 'blue', 'green', 'green', 'yellow', 'yellow', 'red'],
      ['green', 'green', 'blue', 'blue', 'red', 'red', 'yellow', 'yellow'],
    ],
  },
  {
    id: 3,
    name: 'Diamond Cross',
    subtitle: 'Precision Angles',
    colors: ['red', 'blue', 'yellow', 'purple'],
    maxShots: 32,
    description: 'Amethyst purple arrives. Angle your shots against the side walls to sneak into tight gaps.',
    layout: [
      ['purple', 'purple', 'yellow', 'yellow', 'blue', 'blue', 'red', 'red'],
      ['purple', 'yellow', 'yellow', 'blue', 'blue', 'red', 'red'],
      ['yellow', 'purple', 'purple', 'red', 'red', 'blue', 'blue', 'yellow'],
      ['yellow', 'red', 'purple', 'purple', 'red', 'yellow', 'yellow'],
      ['blue', 'purple', 'yellow', 'red', 'yellow', 'purple', 'blue', 'blue'],
    ],
  },
  {
    id: 4,
    name: 'Prism Waves',
    subtitle: 'Serpentine Clusters',
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    maxShots: 30,
    description: 'Five distinct colors in winding waves. Look for high-value hanging clusters to drop!',
    layout: [
      ['red', 'blue', 'green', 'yellow', 'purple', 'green', 'blue', 'red'],
      ['blue', 'green', 'yellow', 'purple', 'green', 'blue', 'red'],
      ['green', 'yellow', 'purple', 'red', 'blue', 'green', 'yellow', 'purple'],
      ['yellow', 'purple', 'red', 'blue', 'green', 'yellow', 'purple'],
      ['purple', 'red', 'blue', 'green', 'yellow', 'purple', 'red', 'blue'],
      ['red', 'blue', 'green', 'yellow', 'purple', 'red', 'blue'],
    ],
  },
  {
    id: 5,
    name: 'Crystal Cavern',
    subtitle: 'Aquamarine Glow',
    colors: ['blue', 'green', 'yellow', 'purple', 'cyan'],
    maxShots: 28,
    description: 'Aquamarine bubbles enter the cavern. Cut off the top anchors to cause massive avalanches.',
    layout: [
      ['cyan', 'cyan', 'blue', 'blue', 'purple', 'purple', 'cyan', 'cyan'],
      ['cyan', 'blue', 'green', 'green', 'purple', 'cyan', 'cyan'],
      ['blue', 'green', 'yellow', 'yellow', 'green', 'blue', 'purple', 'purple'],
      ['green', 'yellow', 'cyan', 'cyan', 'yellow', 'green', 'blue'],
      ['yellow', 'cyan', 'purple', 'purple', 'cyan', 'yellow', 'green', 'green'],
      ['cyan', 'purple', 'blue', 'blue', 'purple', 'cyan', 'yellow'],
    ],
  },
  {
    id: 6,
    name: 'Starlight Citadel',
    subtitle: 'The Royal Fortress',
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'],
    maxShots: 28,
    description: 'All 6 jewel colors guard the fortress. Use the next bubble preview and bubble swap wisely.',
    layout: [
      ['cyan', 'purple', 'yellow', 'green', 'blue', 'red', 'purple', 'cyan'],
      ['cyan', 'yellow', 'green', 'blue', 'red', 'purple', 'cyan'],
      ['purple', 'yellow', 'green', 'red', 'red', 'green', 'yellow', 'purple'],
      ['yellow', 'green', 'red', 'blue', 'blue', 'red', 'green'],
      ['green', 'red', 'blue', 'cyan', 'cyan', 'blue', 'red', 'green'],
      ['red', 'blue', 'cyan', 'yellow', 'cyan', 'blue', 'red'],
      ['blue', 'cyan', 'yellow', 'purple', 'yellow', 'cyan', 'blue', 'blue'],
    ],
  },
  {
    id: 7,
    name: 'Heart of Flame',
    subtitle: 'Flaming Core',
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'],
    maxShots: 26,
    description: 'A glowing ruby heart enveloped in outer layers. Pierce through the defenses!',
    layout: [
      ['purple', 'cyan', 'blue', 'green', 'green', 'blue', 'cyan', 'purple'],
      ['purple', 'blue', 'red', 'red', 'red', 'blue', 'purple'],
      ['cyan', 'blue', 'red', 'yellow', 'red', 'red', 'blue', 'cyan'],
      ['cyan', 'red', 'yellow', 'yellow', 'red', 'cyan', 'cyan'],
      ['blue', 'red', 'red', 'yellow', 'red', 'red', 'blue', 'blue'],
      ['green', 'blue', 'red', 'red', 'blue', 'green', 'green'],
      ['green', 'green', 'blue', 'blue', 'green', 'green', 'cyan', 'cyan'],
    ],
  },
  {
    id: 8,
    name: 'Arcade Champion',
    subtitle: 'Master of Bubbles',
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'],
    maxShots: 25,
    description: 'The ultimate puzzle layout. Every single shot counts. Clear the board to achieve victory!',
    layout: [
      ['red', 'yellow', 'blue', 'purple', 'green', 'cyan', 'red', 'yellow'],
      ['yellow', 'blue', 'purple', 'green', 'cyan', 'red', 'yellow'],
      ['blue', 'purple', 'green', 'cyan', 'red', 'yellow', 'blue', 'purple'],
      ['purple', 'green', 'cyan', 'red', 'yellow', 'blue', 'purple'],
      ['green', 'cyan', 'red', 'yellow', 'blue', 'purple', 'green', 'cyan'],
      ['cyan', 'red', 'yellow', 'blue', 'purple', 'green', 'cyan'],
      ['red', 'yellow', 'blue', 'purple', 'green', 'cyan', 'red', 'yellow'],
      ['yellow', 'blue', 'purple', 'green', 'cyan', 'red', 'yellow'],
    ],
  },
];

/**
 * Initializes a full grid of Bubble objects from a LevelConfig layout.
 */
export function createLevelGrid(level: LevelConfig, maxRows = 14): (Bubble | null)[][] {
  const grid: (Bubble | null)[][] = [];

  for (let r = 0; r < maxRows; r++) {
    const rowBubbles: (Bubble | null)[] = [];
    const layoutRow = level.layout[r];
    const colCount = r % 2 === 0 ? 8 : 7;

    for (let c = 0; c < colCount; c++) {
      const color = layoutRow ? layoutRow[c] : null;
      if (color) {
        const { x, y } = getBubbleCenter(r, c);
        rowBubbles.push({
          id: `bubble-${r}-${c}-${Math.random().toString(36).substring(2, 7)}`,
          row: r,
          col: c,
          color,
          x,
          y,
        });
      } else {
        rowBubbles.push(null);
      }
    }
    grid.push(rowBubbles);
  }

  return grid;
}
